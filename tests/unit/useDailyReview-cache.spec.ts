import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Preferences } from '@capacitor/preferences'
import { useDailyReview } from '~/composables/useDailyReview'

// Mock Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

// Mock database
const mockDbConnection = {
  all: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}

vi.mock('~/composables/useDatabase', () => ({
  useDatabase: () => ({
    getDbConnection: vi.fn().mockResolvedValue(mockDbConnection),
  }),
}))

// Mock daily review store
vi.mock('~/store/dailyReview', () => ({
  useDailyReviewStore: () => ({
    setTotalCardsDueCount: vi.fn(),
  }),
}))

describe('useDailyReview - Cache Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('invalidateCache', () => {
    it('should remove cache from Preferences', async () => {
      const { invalidateCache } = useDailyReview()

      await invalidateCache()

      expect(Preferences.remove).toHaveBeenCalledWith({
        key: 'dailyCardsDueTotal',
      })
    })

    it('should allow recalculation after cache invalidation', async () => {
      const today = new Date().toDateString()
      const { setCardsDueTotalCount, invalidateCache } = useDailyReview()

      // First call - should cache the result
      vi.mocked(Preferences.get).mockResolvedValueOnce({ value: null })
      mockDbConnection.all.mockResolvedValueOnce([
        { id: '1', next_review_at: Date.now() - 1000, deleted_at: null, compartment: 1, archived: 0 },
        { id: '2', next_review_at: Date.now() - 2000, deleted_at: null, compartment: 2, archived: 0 },
        { id: '3', next_review_at: Date.now() - 3000, deleted_at: null, compartment: 3, archived: 0 },
      ])

      await setCardsDueTotalCount()

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'dailyCardsDueTotal',
        value: JSON.stringify({ date: today, count: 3 }),
      })

      // Invalidate cache
      await invalidateCache()
      expect(Preferences.remove).toHaveBeenCalledWith({
        key: 'dailyCardsDueTotal',
      })

      // Second call after invalidation - should recalculate
      vi.mocked(Preferences.get).mockResolvedValueOnce({ value: null })
      mockDbConnection.all.mockResolvedValueOnce([
        { id: '1', next_review_at: Date.now() - 1000, deleted_at: null, compartment: 1, archived: 0 },
        { id: '2', next_review_at: Date.now() - 2000, deleted_at: null, compartment: 2, archived: 0 },
        { id: '3', next_review_at: Date.now() - 3000, deleted_at: null, compartment: 3, archived: 0 },
        { id: '4', next_review_at: Date.now() - 4000, deleted_at: null, compartment: 4, archived: 0 },
        { id: '5', next_review_at: Date.now() - 5000, deleted_at: null, compartment: 1, archived: 0 },
      ])

      await setCardsDueTotalCount()

      // Should have new count
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'dailyCardsDueTotal',
        value: JSON.stringify({ date: today, count: 5 }),
      })
    })
  })

  describe('Cache behavior with dates', () => {
    it('should use cached value when date matches today', async () => {
      const today = new Date().toDateString()
      const { setCardsDueTotalCount } = useDailyReview()

      // Mock cached value from today
      vi.mocked(Preferences.get).mockResolvedValueOnce({
        value: JSON.stringify({ date: today, count: 7 }),
      })

      await setCardsDueTotalCount()

      // Should not query database since cache is valid
      expect(mockDbConnection.all).not.toHaveBeenCalled()
    })

    it('should recalculate when cached date is different', async () => {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const today = new Date().toDateString()
      const { setCardsDueTotalCount } = useDailyReview()

      // Mock cached value from yesterday
      vi.mocked(Preferences.get).mockResolvedValueOnce({
        value: JSON.stringify({ date: yesterday, count: 7 }),
      })

      // Mock getCardsDueToday result
      mockDbConnection.all.mockResolvedValueOnce([
        { id: '1', next_review_at: Date.now() - 1000, deleted_at: null, compartment: 1, archived: 0 },
        { id: '2', next_review_at: Date.now() - 2000, deleted_at: null, compartment: 2, archived: 0 },
      ])

      await setCardsDueTotalCount()

      // Should query database (via getCardsDueToday) and update cache
      expect(mockDbConnection.all).toHaveBeenCalled()
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'dailyCardsDueTotal',
        value: JSON.stringify({ date: today, count: 2 }),
      })
    })
  })

  describe('Integration with sync', () => {
    it('cache should be invalidated after card sync in middleware', async () => {
      // This test documents the expected behavior:
      // 1. App starts
      // 2. syncCardsFromRemote() runs
      // 3. invalidateCache() is called
      // 4. setCardsDueTotalCount() recalculates with fresh data

      const { invalidateCache, setCardsDueTotalCount } = useDailyReview()

      // Simulate sync bringing new cards
      await invalidateCache()
      expect(Preferences.remove).toHaveBeenCalledWith({
        key: 'dailyCardsDueTotal',
      })

      // Simulate recalculation
      vi.mocked(Preferences.get).mockResolvedValueOnce({ value: null })
      mockDbConnection.all.mockResolvedValueOnce([
        { id: '1', next_review_at: Date.now() - 1000, deleted_at: null, compartment: 1, archived: 0 },
        { id: '2', next_review_at: Date.now() - 2000, deleted_at: null, compartment: 2, archived: 0 },
        { id: '3', next_review_at: Date.now() - 3000, deleted_at: null, compartment: 3, archived: 0 },
      ])

      await setCardsDueTotalCount()

      expect(Preferences.set).toHaveBeenCalled()
    })
  })
})
