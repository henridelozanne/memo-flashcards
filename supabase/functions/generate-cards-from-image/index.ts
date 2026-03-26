import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface CardInput {
  question: string
  answer: string
}

interface RequestBody {
  images: string[] // base64 encoded, without data: prefix
  locale: string
  categoryName: string
  existingCards?: CardInput[]
}

interface GeneratedCard {
  question: string
  answer: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const languageMap: Record<string, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    const body: RequestBody = await req.json()
    const { images, locale, categoryName, existingCards } = body

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (images.length > 5) {
      return new Response(JSON.stringify({ error: 'Too many images (max 5)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const language = languageMap[locale] ?? 'English'

    const systemPrompt = `
You are an expert flashcard creator. The user will provide you with one or more photos of course notes, textbook pages, or handwritten notes (possibly in multiple images), as well as the existing flashcards of his collection.

Your job:
1. Read and understand ALL the content across ALL the provided images.
2. Generate between 3 and 10 flashcard suggestions in ${language} based on the quantity of knowledge present in the images.

The collection is named: "${categoryName}".

Rules:
- Each flashcard must test one atomic piece of knowledge extracted from the document(s).
- Adapt to the existing flashcards of the collection in tone, style, use of punctuation etc. If the user doesn't use interrogative pronouns in their flashcards ("what is", ...), don't use them in the generated ones.
- Questions must be concise.
- Answers must be factual and under one sentence.
- Do NOT invent or provide information not present in the images.

Return ONLY valid JSON in this exact format:
{
  "proposals": [
    {"question": "...", "answer": "..."}
  ]
}
`

    // Build the content array: system instruction + one image_url entry per image
    const existingCardsSummary =
      existingCards && existingCards.length > 0
        ? `\n\nHere are some existing flashcards from this collection (use them as reference for tone, style and formatting):\n${JSON.stringify([...existingCards].sort(() => Math.random() - 0.5).slice(0, 30), null, 2)}`
        : ''

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [
      {
        type: 'text',
        text: `Here are ${images.length} page(s) of content. Analyse them all together and generate between 3 and 10 flashcards.${existingCardsSummary}`,
      },
      ...images.map((base64) => ({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64}`,
          detail: 'high',
        },
      })),
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.5,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const openaiData = await response.json()
    const content = openaiData.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    const parsed = JSON.parse(content) as { proposals: GeneratedCard[] }

    if (!parsed.proposals || !Array.isArray(parsed.proposals)) {
      throw new Error('Invalid response structure from OpenAI')
    }

    const proposals: GeneratedCard[] = parsed.proposals
      .filter((p) => p.question && p.answer)
      .map((p) => ({
        question: p.question.replace(/^Q:\s*/i, '').trim(),
        answer: p.answer.replace(/^A:\s*/i, '').trim(),
      }))
      .slice(0, 10)

    return new Response(JSON.stringify({ proposals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('generate-cards-from-image error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
