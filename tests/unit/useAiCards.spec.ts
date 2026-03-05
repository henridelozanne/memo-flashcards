import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock supabase before importing the composable
const mockInvoke = vi.fn()

vi.mock('~/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}))

import { useAiCards } from '~/composables/useAiCards'
import type { Card } from '~/lib/types'

// Helper
const makeCard = (id: string, question = 'Q', answer = 'A'): Card => ({
  id,
  question,
  answer,
  collection_id: 'col-1',
  user_id: 'user-1',
  created_at: Date.now(),
  updated_at: Date.now(),
  compartment: 1,
  next_review_at: Date.now(),
  correct_answers: 0,
  total_reviews: 0,
})

const mockProposals = [
  { question: 'What is Vue?', answer: 'A progressive JavaScript framework.' },
  { question: 'What is Pinia?', answer: 'A state management library for Vue.' },
]

describe('useAiCards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('état initial', () => {
    it('should initialise with empty proposals, no error and not generating', () => {
      const { proposals, isGenerating, error } = useAiCards()
      expect(proposals.value).toEqual([])
      expect(isGenerating.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('generateCards — succès', () => {
    it('should return proposals and update reactive state', async () => {
      mockInvoke.mockResolvedValue({ data: { proposals: mockProposals }, error: null })

      const { proposals, isGenerating, error, generateCards } = useAiCards()
      const cards = [makeCard('1'), makeCard('2')]

      const result = await generateCards(cards, 'fr', 'JavaScript', 'learnVocabulary', 'student')

      expect(result).toEqual(mockProposals)
      expect(proposals.value).toEqual(mockProposals)
      expect(isGenerating.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should send correct payload to supabase edge function', async () => {
      mockInvoke.mockResolvedValue({ data: { proposals: mockProposals }, error: null })

      const { generateCards } = useAiCards()
      const cards = [makeCard('1', 'Capital of France?', 'Paris'), makeCard('2', 'Capital of Spain?', 'Madrid')]

      await generateCards(cards, 'en', 'Geography', 'memorizeFactsScience', 'employed')

      expect(mockInvoke).toHaveBeenCalledWith('generate-cards', {
        body: {
          cards: [
            { question: 'Capital of France?', answer: 'Paris' },
            { question: 'Capital of Spain?', answer: 'Madrid' },
          ],
          locale: 'en',
          categoryName: 'Geography',
          goal: 'memorizeFactsScience',
          situation: 'employed',
        },
      })
    })

    it('should set isGenerating to true during the call and false after', async () => {
      let generatingDuringCall = false

      mockInvoke.mockImplementation(async () => {
        generatingDuringCall = true
        return { data: { proposals: mockProposals }, error: null }
      })

      const { isGenerating, generateCards } = useAiCards()

      expect(isGenerating.value).toBe(false)
      const promise = generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')
      // isGenerating becomes true synchronously before the first await inside generateCards
      await promise
      expect(generatingDuringCall).toBe(true)
      expect(isGenerating.value).toBe(false)
    })

    it('should reset previous proposals and error on a new call', async () => {
      mockInvoke.mockResolvedValue({ data: { proposals: mockProposals }, error: null })

      const { proposals, error, generateCards } = useAiCards()

      // Forcer un état précédent
      proposals.value = [{ question: 'old', answer: 'old' }]
      error.value = 'previous error'

      await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(proposals.value).toEqual(mockProposals)
      expect(error.value).toBeNull()
    })
  })

  describe('generateCards — erreur Supabase (fnError)', () => {
    it('should set error and return empty array when supabase returns fnError', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: { message: 'Function invocation failed' } })

      const { proposals, error, generateCards } = useAiCards()
      const result = await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(result).toEqual([])
      expect(proposals.value).toEqual([])
      expect(error.value).toBe('Function invocation failed')
      expect(error.value).not.toBeNull()
    })

    it('should use fallback message when fnError has no message', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: {} })

      const { error, generateCards } = useAiCards()
      await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(error.value).toBe('Error calling AI service')
    })
  })

  describe('generateCards — erreur métier (data.error)', () => {
    it('should set error when the edge function returns an error field', async () => {
      mockInvoke.mockResolvedValue({ data: { error: 'OPENAI_API_KEY is not configured' }, error: null })

      const { error, generateCards } = useAiCards()
      const result = await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(result).toEqual([])
      expect(error.value).toBe('OPENAI_API_KEY is not configured')
    })
  })

  describe('generateCards — réponse invalide', () => {
    it('should set error when proposals key is missing', async () => {
      mockInvoke.mockResolvedValue({ data: { something: 'else' }, error: null })

      const { error, generateCards } = useAiCards()
      const result = await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(result).toEqual([])
      expect(error.value).toBe('Invalid response from AI service')
    })

    it('should set error when proposals is not an array', async () => {
      mockInvoke.mockResolvedValue({ data: { proposals: 'not an array' }, error: null })

      const { error, generateCards } = useAiCards()
      const result = await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(result).toEqual([])
      expect(error.value).toBe('Invalid response from AI service')
    })

    it('should set error when data is null', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: null })

      const { error, generateCards } = useAiCards()
      const result = await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(result).toEqual([])
      expect(error.value).toBe('Invalid response from AI service')
    })
  })

  describe('generateCards — exception réseau', () => {
    it('should catch thrown errors and set error state', async () => {
      mockInvoke.mockRejectedValue(new Error('Network timeout'))

      const { error, isGenerating, generateCards } = useAiCards()
      const result = await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(result).toEqual([])
      expect(error.value).toBe('Network timeout')
      expect(isGenerating.value).toBe(false)
    })

    it('should handle non-Error exceptions with fallback message', async () => {
      mockInvoke.mockRejectedValue('some string error')

      const { error, generateCards } = useAiCards()
      await generateCards([makeCard('1')], 'fr', 'Test', 'other', 'other')

      expect(error.value).toBe('Unexpected error')
    })
  })

  describe('reset', () => {
    it('should clear proposals, error and isGenerating', () => {
      const { proposals, error, isGenerating, reset } = useAiCards()

      proposals.value = mockProposals
      error.value = 'some error'
      isGenerating.value = true

      reset()

      expect(proposals.value).toEqual([])
      expect(error.value).toBeNull()
      expect(isGenerating.value).toBe(false)
    })
  })
})
