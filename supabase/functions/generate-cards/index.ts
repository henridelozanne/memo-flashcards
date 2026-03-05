// @ts-nocheck - This file runs on Deno (Supabase Edge Functions), not Node.js
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface CardInput {
  question: string
  answer: string
}

interface RequestBody {
  cards: CardInput[]
  locale: string
  categoryName: string
  goal: string
  situation: string
}

interface GeneratedCard {
  question: string
  answer: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { cards, locale, categoryName, goal, situation } = body

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid cards input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cardsSummary = [...cards]
      .sort(() => Math.random() - 0.5)
      .slice(0, 30)
      .map((c, i) => ({ index: i + 1, question: c.question, answer: c.answer }))

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
    const language = languageMap[locale] ?? 'English'

    function getGoalInstruction(goal) {
      switch (goal) {
        case 'learnLanguage':
          return "The user's goal is to learn a language. Generate cards that prioritise high-utility vocabulary, common expressions, and core grammar patterns relevant to the category."
        case 'reviseClasses':
          return "The user's goal is to revise school material. Generate cards covering key definitions, concepts, and facts commonly required for exams in this topic."
        case 'memorizeFactsScience':
          return "The user's goal is to memorise historical or scientific facts. Prefer precise, high-signal facts (dates, definitions, laws, discoveries, figures) that are commonly taught or referenced."
        case 'learnVocabulary':
          return "The user's goal is to learn professional vocabulary. Generate cards introducing essential field-specific terms with concise, accurate definitions and typical usage."
        case 'developCulture':
          return "The user's goal is to develop general knowledge. Generate broadly useful, interesting, and commonly referenced facts related to the category."
        case 'other':
        default:
          return "The user's goal is to learn about this topic. Generate useful, relevant cards that build a solid understanding of the category."
      }
    }

    function getSituationInstruction(situation) {
      switch (situation) {
        case 'student':
          return 'Adapt difficulty and terminology to a university student: moderately advanced vocabulary is fine, but keep questions clear and answers succinct.'
        case 'highSchool':
          return 'Adapt difficulty and wording to a high-school level learner: focus on core concepts and commonly taught knowledge, avoid niche jargon.'
        case 'employed':
          return 'Adapt the cards to a working professional: prioritise practical knowledge and concepts that are useful in real-world contexts.'
        case 'retraining':
          return 'Adapt the cards to someone retraining into a new field: prioritise fundamentals, core terminology, and the essential building blocks of the topic.'
        case 'selfLearner':
          return 'Adapt the cards to an independent learner: keep them clear, structured, and focused on high-utility knowledge that builds understanding progressively.'
        case 'jobSeeking':
          return 'Adapt the cards to someone job-seeking: prioritise key concepts and terminology that can help in interviews or professional conversations about this topic.'
        case 'other':
        default:
          return 'Adapt the cards to a general audience: keep terminology accessible and focus on broadly useful knowledge.'
      }
    }

    const systemPrompt = `
      You are an expert flashcard creator.

      I will provide you the set of existing flashcards about a specific topic : ${categoryName}.

      Generate exactly 10 new flashcard suggestions in ${language} about this topic.

      Match the writing style, difficulty, and formatting of the existing cards.

      Each card must be different from the existing cards.

      Each flashcard must test one atomic piece of knowledge.

      Questions must be clear and concise.

      Answers must be factual and under one sentence.

      ${getGoalInstruction(goal)}

      ${getSituationInstruction(situation)}

      Return ONLY valid JSON.

      Format:
      {
        "proposals": [
          {"question": "...", "answer": "..."}
        ]
      }
    `

    const userPrompt = `Here are the existing flashcards in the collection:\n\n${JSON.stringify(cardsSummary, null, 2)}\n\nGenerate 10 complementary flashcard suggestions.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
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
        question: p.question
          .replace(/\s*\|\s*A:.*$/i, '')
          .replace(/^Q:\s*/i, '')
          .replace(/\s*\|\s*$/, '')
          .trim(),
        answer: p.answer.replace(/^A:\s*/i, '').trim(),
      }))
      .slice(0, 10)

    return new Response(JSON.stringify({ proposals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('generate-cards error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
