import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDailyReviewStore } from '~/store/dailyReview'

// Mock Capacitor Preferences
const mockPreferences = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('@capacitor/preferences', () => ({
  Preferences: mockPreferences,
}))

describe('useDailyReviewStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const store = useDailyReviewStore()

    expect(store.answeredCardsCount).toBe(0)
    expect(store.totalCardsDueCount).toBe(0)
  })

  it('should set answered cards count', () => {
    const store = useDailyReviewStore()

    store.setAnsweredCardsCount(5)
    expect(store.answeredCardsCount).toBe(5)

    store.setAnsweredCardsCount(10)
    expect(store.answeredCardsCount).toBe(10)
  })

  it('should set total cards due count', () => {
    const store = useDailyReviewStore()

    store.setTotalCardsDueCount(8)
    expect(store.totalCardsDueCount).toBe(8)

    store.setTotalCardsDueCount(15)
    expect(store.totalCardsDueCount).toBe(15)
  })
})
