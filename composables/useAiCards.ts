import { ref } from 'vue'
import type { Card } from '~/lib/types'

export interface AiCardProposal {
  question: string
  answer: string
}

let supabaseInstance: any = null

async function getSupabase() {
  if (!supabaseInstance) {
    const { supabase } = await import('../lib/supabase')
    supabaseInstance = supabase
  }
  return supabaseInstance
}

export const useAiCards = () => {
  const proposals = ref<AiCardProposal[]>([])
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  const generateCards = async (
    cards: Card[],
    locale: string,
    categoryName: string,
    goal: string,
    situation: string
  ): Promise<AiCardProposal[]> => {
    isGenerating.value = true
    error.value = null
    proposals.value = []

    try {
      const supabase = await getSupabase()

      const cardInputs = cards.map((c) => ({
        question: c.question,
        answer: c.answer,
      }))

      const { data, error: fnError } = await supabase.functions.invoke('generate-cards', {
        body: { cards: cardInputs, locale, categoryName, goal, situation },
      })

      if (fnError) {
        throw new Error(fnError.message || 'Error calling AI service')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      if (!data?.proposals || !Array.isArray(data.proposals)) {
        throw new Error('Invalid response from AI service')
      }

      proposals.value = data.proposals as AiCardProposal[]
      return proposals.value
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unexpected error'
      return []
    } finally {
      isGenerating.value = false
    }
  }

  const reset = () => {
    proposals.value = []
    error.value = null
    isGenerating.value = false
  }

  return {
    proposals,
    isGenerating,
    error,
    generateCards,
    reset,
  }
}
