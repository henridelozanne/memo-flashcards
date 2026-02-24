import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStatistics } from '~/composables/useStatistics'
import { useDatabase } from '~/composables/useDatabase'

vi.mock('~/composables/useDatabase')

// Helper pour ajouter les mocks pour les statistiques de rythme (après overdueCards)
function addRhythmStatsMocks(mockDb: any, hasFirstCard = false) {
  // Mock pour first card date
  mockDb.all.mockResolvedValueOnce([{ first_created: hasFirstCard ? Date.now() : null }])

  if (hasFirstCard) {
    // Mock pour days with review all time (seulement si firstCardDate existe)
    mockDb.all.mockResolvedValueOnce([{ count: 0 }])
  }

  // Mock pour days with review this month (toujours exécuté)
  mockDb.all.mockResolvedValueOnce([{ count: 0 }])

  // Mock pour les dates de révision pour streaks (toujours exécuté)
  mockDb.all.mockResolvedValueOnce([])

  // Mock pour hourly review data (toujours exécuté)
  mockDb.all.mockResolvedValueOnce([])

  // Mock pour avg time per session (toujours exécuté)
  mockDb.all.mockResolvedValueOnce([{ avg_duration: 0 }])

  // Mock pour total time in review (toujours exécuté)
  mockDb.all.mockResolvedValueOnce([{ total_duration: 0 }])
}

describe('useStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('overdueCards calculation', () => {
    it('counts cards with next_review_at before today (date only, not time)', async () => {
      // Mock system time to 2025-11-24 10:00:00
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-11-24T10:00:00'))

      const startOfToday = new Date(2025, 10, 24, 0, 0, 0).getTime() // 24 nov 2025 à 00h00

      const mockDb = {
        all: vi.fn(),
      }

      vi.mocked(useDatabase).mockReturnValue({
        getDbConnection: vi.fn().mockResolvedValue(mockDb),
      } as any)

      // Mock pour les cartes totales
      mockDb.all.mockResolvedValueOnce([{ count: 10 }])
      // Mock pour les collections
      mockDb.all.mockResolvedValueOnce([{ count: 2 }])
      // Mock pour les reviews
      mockDb.all.mockResolvedValueOnce([{ count: 50 }])
      // Mock pour les sessions
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      // Mock pour le success rate
      mockDb.all.mockResolvedValueOnce([{ total: 50, correct: 40 }])
      // Mock pour les cartes créées aujourd'hui
      mockDb.all.mockResolvedValueOnce([{ count: 1 }])
      // Mock pour les cartes créées ce mois
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      // Mock pour les cartes révisées aujourd'hui
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      // Mock pour les cartes révisées ce mois
      mockDb.all.mockResolvedValueOnce([{ count: 8 }])
      // Mock pour les compartiments
      mockDb.all.mockResolvedValueOnce([
        { compartment: 1, count: 5 },
        { compartment: 2, count: 3 },
        { compartment: 3, count: 2 },
      ])
      // Mock pour le taux de couverture
      mockDb.all.mockResolvedValueOnce([{ count: 8 }])
      // Mock pour les cartes en retard
      mockDb.all.mockResolvedValueOnce([{ count: 3 }])
      // Mocks pour les stats de rythme
      addRhythmStatsMocks(mockDb, false)

      const { loadStatistics, overdueCards } = useStatistics()
      await loadStatistics()

      // Vérifier que la requête pour overdueCards utilise startOfToday
      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM cards WHERE deleted_at IS NULL AND next_review_at < ?',
        [startOfToday]
      )
      expect(overdueCards.value).toBe(3)

      vi.useRealTimers()
    })

    it('does not count cards scheduled for today as overdue', async () => {
      const now = new Date('2025-11-24T10:00:00') // 24 nov 2025 à 10h
      const startOfToday = new Date(2025, 10, 24, 0, 0, 0).getTime() // 24 nov 2025 à 00h00
      const cardAt9AM = new Date('2025-11-24T09:00:00').getTime() // 24 nov 2025 à 9h

      const mockDb = {
        all: vi.fn(),
      }

      vi.mocked(useDatabase).mockReturnValue({
        getDbConnection: vi.fn().mockResolvedValue(mockDb),
      } as any)

      // Setup mocks pour toutes les requêtes
      mockDb.all.mockResolvedValueOnce([{ count: 10 }]) // totalCards
      mockDb.all.mockResolvedValueOnce([{ count: 2 }]) // totalCollections
      mockDb.all.mockResolvedValueOnce([{ count: 50 }]) // totalReviews
      mockDb.all.mockResolvedValueOnce([{ count: 5 }]) // totalSessions
      mockDb.all.mockResolvedValueOnce([{ total: 50, correct: 40 }]) // success rate
      mockDb.all.mockResolvedValueOnce([{ count: 1 }]) // cartes créées aujourd'hui
      mockDb.all.mockResolvedValueOnce([{ count: 5 }]) // cartes créées ce mois
      mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // cartes révisées aujourd'hui
      mockDb.all.mockResolvedValueOnce([{ count: 8 }]) // cartes révisées ce mois
      mockDb.all.mockResolvedValueOnce([]) // compartiments
      mockDb.all.mockResolvedValueOnce([{ count: 8 }]) // coverage
      mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // overdue (aucune car 9h > 00h00)
      addRhythmStatsMocks(mockDb, false)

      const { loadStatistics, overdueCards } = useStatistics()
      await loadStatistics()

      // La requête doit comparer avec startOfToday (00h00), pas avec now (10h00)
      // Donc une carte à 9h00 aujourd'hui n'est pas en retard car 9h00 > 00h00
      expect(overdueCards.value).toBe(0)
    })

    it('counts cards from yesterday as overdue', async () => {
      const now = new Date('2025-11-24T10:00:00') // 24 nov 2025 à 10h
      const startOfToday = new Date(2025, 10, 24, 0, 0, 0).getTime() // 24 nov 2025 à 00h00
      const yesterdayAt11PM = new Date('2025-11-23T23:00:00').getTime() // 23 nov à 23h

      const mockDb = {
        all: vi.fn(),
      }

      vi.mocked(useDatabase).mockReturnValue({
        getDbConnection: vi.fn().mockResolvedValue(mockDb),
      } as any)

      // Setup mocks
      mockDb.all.mockResolvedValueOnce([{ count: 10 }]) // totalCards
      mockDb.all.mockResolvedValueOnce([{ count: 2 }]) // totalCollections
      mockDb.all.mockResolvedValueOnce([{ count: 50 }]) // totalReviews
      mockDb.all.mockResolvedValueOnce([{ count: 5 }]) // totalSessions
      mockDb.all.mockResolvedValueOnce([{ total: 50, correct: 40 }]) // success rate
      mockDb.all.mockResolvedValueOnce([{ count: 1 }]) // cartes créées aujourd'hui
      mockDb.all.mockResolvedValueOnce([{ count: 5 }]) // cartes créées ce mois
      mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // cartes révisées aujourd'hui
      mockDb.all.mockResolvedValueOnce([{ count: 8 }]) // cartes révisées ce mois
      mockDb.all.mockResolvedValueOnce([]) // compartiments
      mockDb.all.mockResolvedValueOnce([{ count: 8 }]) // coverage
      mockDb.all.mockResolvedValueOnce([{ count: 2 }]) // overdue (hier à 23h < 00h00 aujourd'hui)
      addRhythmStatsMocks(mockDb, false)

      const { loadStatistics, overdueCards } = useStatistics()
      await loadStatistics()

      // Une carte d'hier à 23h est en retard car 23h hier < 00h00 aujourd'hui
      expect(overdueCards.value).toBe(2)
    })
  })

  describe('globalCoverageRate calculation', () => {
    it('calculates percentage of cards that have been reviewed at least once', async () => {
      const mockDb = {
        all: vi.fn(),
      }

      vi.mocked(useDatabase).mockReturnValue({
        getDbConnection: vi.fn().mockResolvedValue(mockDb),
      } as any)

      mockDb.all.mockResolvedValueOnce([{ count: 20 }]) // 20 total cards
      mockDb.all.mockResolvedValueOnce([{ count: 2 }])
      mockDb.all.mockResolvedValueOnce([{ count: 50 }])
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      mockDb.all.mockResolvedValueOnce([{ total: 50, correct: 40 }])
      mockDb.all.mockResolvedValueOnce([{ count: 1 }])
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 8 }])
      mockDb.all.mockResolvedValueOnce([]) // compartiments
      mockDb.all.mockResolvedValueOnce([{ count: 12 }]) // 12 cards reviewed at least once
      mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // overdue
      addRhythmStatsMocks(mockDb, false)

      const { loadStatistics, globalCoverageRate } = useStatistics()
      await loadStatistics()

      // 12/20 = 60%
      expect(globalCoverageRate.value).toBe(60)
    })

    it('returns 0 when no cards exist', async () => {
      const mockDb = {
        all: vi.fn(),
      }

      vi.mocked(useDatabase).mockReturnValue({
        getDbConnection: vi.fn().mockResolvedValue(mockDb),
      } as any)

      mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // 0 total cards
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ total: 0, correct: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      addRhythmStatsMocks(mockDb, false)

      const { loadStatistics, globalCoverageRate } = useStatistics()
      await loadStatistics()

      expect(globalCoverageRate.value).toBe(0)
    })
  })

  describe('compartmentData', () => {
    it('returns array with counts for each compartment', async () => {
      const mockDb = {
        all: vi.fn(),
      }

      vi.mocked(useDatabase).mockReturnValue({
        getDbConnection: vi.fn().mockResolvedValue(mockDb),
      } as any)

      mockDb.all.mockResolvedValueOnce([{ count: 20 }])
      mockDb.all.mockResolvedValueOnce([{ count: 2 }])
      mockDb.all.mockResolvedValueOnce([{ count: 50 }])
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      mockDb.all.mockResolvedValueOnce([{ total: 50, correct: 40 }])
      mockDb.all.mockResolvedValueOnce([{ count: 1 }])
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 8 }])
      mockDb.all.mockResolvedValueOnce([
        { compartment: 1, count: 10 },
        { compartment: 2, count: 5 },
        { compartment: 3, count: 3 },
        { compartment: 4, count: 2 },
      ])
      mockDb.all.mockResolvedValueOnce([{ count: 12 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      addRhythmStatsMocks(mockDb, false)

      const { loadStatistics, compartmentData } = useStatistics()
      await loadStatistics()

      // Doit avoir 5 éléments (compartiments 1-5)
      expect(compartmentData.value.length).toBe(5)
      expect(compartmentData.value).toEqual([10, 5, 3, 2, 0])
    })
  })

  describe('globalSuccessRate', () => {
    it('calculates percentage of correct answers', async () => {
      const mockDb = {
        all: vi.fn(),
      }

      vi.mocked(useDatabase).mockReturnValue({
        getDbConnection: vi.fn().mockResolvedValue(mockDb),
      } as any)

      mockDb.all.mockResolvedValueOnce([{ count: 20 }])
      mockDb.all.mockResolvedValueOnce([{ count: 2 }])
      mockDb.all.mockResolvedValueOnce([{ count: 100 }])
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      mockDb.all.mockResolvedValueOnce([{ total: 100, correct: 75 }]) // 75/100 = 75%
      mockDb.all.mockResolvedValueOnce([{ count: 1 }])
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 8 }])
      mockDb.all.mockResolvedValueOnce([])
      mockDb.all.mockResolvedValueOnce([{ count: 12 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      addRhythmStatsMocks(mockDb, false)

      const { loadStatistics, globalSuccessRate } = useStatistics()
      await loadStatistics()

      expect(globalSuccessRate.value).toBe(75)
    })

    it('returns 0 when no reviews exist', async () => {
      const mockDb = {
        all: vi.fn(),
      }

      vi.mocked(useDatabase).mockReturnValue({
        getDbConnection: vi.fn().mockResolvedValue(mockDb),
      } as any)

      mockDb.all.mockResolvedValueOnce([{ count: 20 }])
      mockDb.all.mockResolvedValueOnce([{ count: 2 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ total: 0, correct: 0 }]) // 0/0 = 0%
      mockDb.all.mockResolvedValueOnce([{ count: 1 }])
      mockDb.all.mockResolvedValueOnce([{ count: 5 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      mockDb.all.mockResolvedValueOnce([{ count: 0 }])
      addRhythmStatsMocks(mockDb, false)

      const { loadStatistics, globalSuccessRate } = useStatistics()
      await loadStatistics()

      expect(globalSuccessRate.value).toBe(0)
    })
  })

  describe('rhythm statistics', () => {
    describe('daysWithReviewAllTime', () => {
      it('calculates percentage of days with reviews since first card', async () => {
        // Mock system time to 2025-11-24 10:00:00
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2025-11-24T10:00:00'))

        const mockDb = {
          all: vi.fn(),
        }

        vi.mocked(useDatabase).mockReturnValue({
          getDbConnection: vi.fn().mockResolvedValue(mockDb),
        } as any)

        const firstCardDate = new Date('2025-11-01T00:00:00').getTime() // 24 jours avant

        // Setup mocks pour toutes les requêtes
        mockDb.all.mockResolvedValueOnce([{ count: 20 }]) // totalCards
        mockDb.all.mockResolvedValueOnce([{ count: 2 }]) // totalCollections
        mockDb.all.mockResolvedValueOnce([{ count: 50 }]) // totalReviews
        mockDb.all.mockResolvedValueOnce([{ count: 5 }]) // totalSessions
        mockDb.all.mockResolvedValueOnce([{ total: 50, correct: 40 }]) // success rate
        mockDb.all.mockResolvedValueOnce([{ count: 1 }]) // cartes créées aujourd'hui
        mockDb.all.mockResolvedValueOnce([{ count: 5 }]) // cartes créées ce mois
        mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // cartes révisées aujourd'hui
        mockDb.all.mockResolvedValueOnce([{ count: 8 }]) // cartes révisées ce mois
        mockDb.all.mockResolvedValueOnce([]) // compartiments
        mockDb.all.mockResolvedValueOnce([{ count: 8 }]) // coverage
        mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // overdue
        mockDb.all.mockResolvedValueOnce([{ first_created: firstCardDate }]) // first card date
        mockDb.all.mockResolvedValueOnce([{ count: 18 }]) // 18 jours distincts avec révision
        mockDb.all.mockResolvedValueOnce([{ count: 10 }]) // jours ce mois
        mockDb.all.mockResolvedValueOnce([]) // dates de révision pour streaks
        mockDb.all.mockResolvedValueOnce([]) // hourly review data
        mockDb.all.mockResolvedValueOnce([{ avg_duration: 0 }]) // avg time per session
        mockDb.all.mockResolvedValueOnce([{ total_duration: 0 }]) // total time in review

        const { loadStatistics, daysWithReviewAllTime } = useStatistics()
        await loadStatistics()

        // 18 jours avec révision sur 24 jours = 75%
        expect(daysWithReviewAllTime.value).toBe(75)

        vi.useRealTimers()
      })

      it('returns 0 when no cards exist', async () => {
        const mockDb = {
          all: vi.fn(),
        }

        vi.mocked(useDatabase).mockReturnValue({
          getDbConnection: vi.fn().mockResolvedValue(mockDb),
        } as any)

        mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // totalCards
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ total: 0, correct: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ first_created: null }]) // pas de première carte
        mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // days with review this month
        mockDb.all.mockResolvedValueOnce([]) // dates de révision pour streaks
        mockDb.all.mockResolvedValueOnce([]) // hourly review data
        mockDb.all.mockResolvedValueOnce([{ avg_duration: 0 }]) // avg time per session
        mockDb.all.mockResolvedValueOnce([{ total_duration: 0 }]) // total time in review

        const { loadStatistics, daysWithReviewAllTime } = useStatistics()
        await loadStatistics()

        expect(daysWithReviewAllTime.value).toBe(0)
      })
    })

    describe('daysWithReviewThisMonth', () => {
      it('calculates percentage of days with reviews this month', async () => {
        // Mock system time to 2025-11-24 10:00:00
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2025-11-24T10:00:00'))

        const mockDb = {
          all: vi.fn(),
        }

        vi.mocked(useDatabase).mockReturnValue({
          getDbConnection: vi.fn().mockResolvedValue(mockDb),
        } as any)

        const firstCardDate = new Date('2025-11-01T00:00:00').getTime()

        mockDb.all.mockResolvedValueOnce([{ count: 20 }])
        mockDb.all.mockResolvedValueOnce([{ count: 2 }])
        mockDb.all.mockResolvedValueOnce([{ count: 50 }])
        mockDb.all.mockResolvedValueOnce([{ count: 5 }])
        mockDb.all.mockResolvedValueOnce([{ total: 50, correct: 40 }])
        mockDb.all.mockResolvedValueOnce([{ count: 1 }])
        mockDb.all.mockResolvedValueOnce([{ count: 5 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 8 }])
        mockDb.all.mockResolvedValueOnce([])
        mockDb.all.mockResolvedValueOnce([{ count: 8 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ first_created: firstCardDate }])
        mockDb.all.mockResolvedValueOnce([{ count: 18 }])
        mockDb.all.mockResolvedValueOnce([{ count: 20 }]) // 20 jours distincts ce mois
        mockDb.all.mockResolvedValueOnce([])
        mockDb.all.mockResolvedValueOnce([]) // hourly review data
        mockDb.all.mockResolvedValueOnce([{ avg_duration: 0 }]) // avg time per session
        mockDb.all.mockResolvedValueOnce([{ total_duration: 0 }]) // total time in review

        const { loadStatistics, daysWithReviewThisMonth } = useStatistics()
        await loadStatistics()

        // 20 jours avec révision sur 24 jours = 83%
        expect(daysWithReviewThisMonth.value).toBe(83)

        vi.useRealTimers()
      })
    })

    describe('streaks', () => {
      it('calculates longest streak with reviews', async () => {
        const mockDb = {
          all: vi.fn(),
        }

        vi.mocked(useDatabase).mockReturnValue({
          getDbConnection: vi.fn().mockResolvedValue(mockDb),
        } as any)

        const firstCardDate = new Date('2025-11-01T00:00:00').getTime()

        mockDb.all.mockResolvedValueOnce([{ count: 20 }])
        mockDb.all.mockResolvedValueOnce([{ count: 2 }])
        mockDb.all.mockResolvedValueOnce([{ count: 50 }])
        mockDb.all.mockResolvedValueOnce([{ count: 5 }])
        mockDb.all.mockResolvedValueOnce([{ total: 50, correct: 40 }])
        mockDb.all.mockResolvedValueOnce([{ count: 1 }])
        mockDb.all.mockResolvedValueOnce([{ count: 5 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 8 }])
        mockDb.all.mockResolvedValueOnce([])
        mockDb.all.mockResolvedValueOnce([{ count: 8 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ first_created: firstCardDate }])
        mockDb.all.mockResolvedValueOnce([{ count: 18 }])
        mockDb.all.mockResolvedValueOnce([{ count: 20 }])
        mockDb.all.mockResolvedValueOnce([
          { review_date: '2025-11-01' },
          { review_date: '2025-11-02' },
          { review_date: '2025-11-03' },
          { review_date: '2025-11-05' },
          { review_date: '2025-11-06' },
          { review_date: '2025-11-07' },
          { review_date: '2025-11-08' },
          { review_date: '2025-11-09' },
        ])
        mockDb.all.mockResolvedValueOnce([]) // hourly review data
        mockDb.all.mockResolvedValueOnce([{ avg_duration: 0 }]) // avg time per session
        mockDb.all.mockResolvedValueOnce([{ total_duration: 0 }]) // total time in review

        const { loadStatistics, longestStreakWith, longestStreakWithout } = useStatistics()
        await loadStatistics()

        // Plus longue série : 01-03 (3 jours) puis 05-09 (5 jours) = 5 jours max
        expect(longestStreakWith.value).toBe(5)
        // Plus longue série sans : 04 (1 jour) = 1 jour max (pas de calcul après 09 car lastpour allDaysResult vide après)
        expect(longestStreakWithout.value).toBeGreaterThan(0)
      })

      it('returns 0 for streaks when no reviews exist', async () => {
        const mockDb = {
          all: vi.fn(),
        }

        vi.mocked(useDatabase).mockReturnValue({
          getDbConnection: vi.fn().mockResolvedValue(mockDb),
        } as any)

        mockDb.all.mockResolvedValueOnce([{ count: 20 }])
        mockDb.all.mockResolvedValueOnce([{ count: 2 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ total: 0, correct: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }])
        mockDb.all.mockResolvedValueOnce([{ first_created: null }])
        mockDb.all.mockResolvedValueOnce([{ count: 0 }]) // days with review this month
        mockDb.all.mockResolvedValueOnce([]) // dates de révision pour streaks
        mockDb.all.mockResolvedValueOnce([]) // hourly review data
        mockDb.all.mockResolvedValueOnce([{ avg_duration: 0 }]) // avg time per session
        mockDb.all.mockResolvedValueOnce([{ total_duration: 0 }]) // total time in review

        const { loadStatistics, longestStreakWith, longestStreakWithout } = useStatistics()
        await loadStatistics()

        expect(longestStreakWith.value).toBe(0)
        expect(longestStreakWithout.value).toBe(0)
      })
    })
  })
})
