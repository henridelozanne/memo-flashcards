import { ref } from 'vue'
import { useDatabase } from '~/composables/useDatabase'

export const useStatistics = () => {
  const totalCards = ref(0)
  const totalCollections = ref(0)
  const totalReviews = ref(0)
  const totalSessions = ref(0)
  const globalSuccessRate = ref(0)
  const cardsCreatedThisMonth = ref(0)
  const cardsReviewedThisMonth = ref(0)
  const cardsCreatedToday = ref(0)
  const cardsReviewedToday = ref(0)
  const compartmentData = ref<number[]>([0, 0, 0, 0, 0])
  const globalCoverageRate = ref(0)
  const overdueCards = ref(0)

  const loadStatistics = async () => {
    const { getDbConnection } = useDatabase()
    const db = await getDbConnection()

    // Get total cards count (excluding deleted ones)
    const cardsResult = await db.all<{ count: number }>('SELECT COUNT(*) as count FROM cards WHERE deleted_at IS NULL')
    totalCards.value = cardsResult[0]?.count || 0

    // Get total collections count (excluding deleted ones)
    const collectionsResult = await db.all<{ count: number }>(
      'SELECT COUNT(*) as count FROM collections WHERE deleted_at IS NULL'
    )
    totalCollections.value = collectionsResult[0]?.count || 0

    // Get total reviews count from review_logs
    const reviewsResult = await db.all<{ total: number }>(
      'SELECT COUNT(*) as total FROM review_logs WHERE user_id = ?',
      ['default-user']
    )
    totalReviews.value = reviewsResult[0]?.total || 0

    // Get total sessions count from review_sessions
    const sessionsResult = await db.all<{ total: number }>(
      'SELECT COUNT(*) as total FROM review_sessions WHERE user_id = ? AND ended_at IS NOT NULL',
      ['default-user']
    )
    totalSessions.value = sessionsResult[0]?.total || 0

    // Get global success rate from review_logs
    const successRateResult = await db.all<{ correct: number; total: number }>(
      `SELECT 
        COUNT(CASE WHEN result = 'correct' THEN 1 END) as correct,
        COUNT(*) as total 
      FROM review_logs 
      WHERE user_id = ?`,
      ['default-user']
    )
    const correct = successRateResult[0]?.correct || 0
    const total = successRateResult[0]?.total || 0
    globalSuccessRate.value = total > 0 ? Math.round((correct / total) * 100) : 0

    // Get cards created this month (excluding deleted ones)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const cardsThisMonthResult = await db.all<{ count: number }>(
      'SELECT COUNT(*) as count FROM cards WHERE deleted_at IS NULL AND created_at >= ?',
      [startOfMonth]
    )
    cardsCreatedThisMonth.value = cardsThisMonthResult[0]?.count || 0

    // Get cards reviewed this month (distinct cards from review_logs)
    const cardsReviewedMonthResult = await db.all<{ count: number }>(
      'SELECT COUNT(DISTINCT card_id) as count FROM review_logs WHERE user_id = ? AND reviewed_at >= ?',
      ['default-user', startOfMonth]
    )
    cardsReviewedThisMonth.value = cardsReviewedMonthResult[0]?.count || 0

    // Get cards created today (excluding deleted ones)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const cardsTodayResult = await db.all<{ count: number }>(
      'SELECT COUNT(*) as count FROM cards WHERE deleted_at IS NULL AND created_at >= ?',
      [startOfDay]
    )
    cardsCreatedToday.value = cardsTodayResult[0]?.count || 0

    // Get cards reviewed today (distinct cards from review_logs)
    const cardsReviewedTodayResult = await db.all<{ count: number }>(
      'SELECT COUNT(DISTINCT card_id) as count FROM review_logs WHERE user_id = ? AND reviewed_at >= ?',
      ['default-user', startOfDay]
    )
    cardsReviewedToday.value = cardsReviewedTodayResult[0]?.count || 0

    // Get cards by compartment
    const compartmentResults = await db.all<{ compartment: number; count: number }>(
      'SELECT compartment, COUNT(*) as count FROM cards WHERE deleted_at IS NULL GROUP BY compartment ORDER BY compartment'
    )
    const newCompartmentData = [0, 0, 0, 0, 0]
    compartmentResults.forEach((row) => {
      if (row.compartment >= 1 && row.compartment <= 5) {
        newCompartmentData[row.compartment - 1] = row.count
      }
    })
    compartmentData.value = newCompartmentData

    // Get global coverage rate (cards reviewed at least once)
    const reviewedCardsResult = await db.all<{ count: number }>(
      'SELECT COUNT(DISTINCT card_id) as count FROM review_logs WHERE user_id = ?',
      ['default-user']
    )
    const reviewedCount = reviewedCardsResult[0]?.count || 0
    globalCoverageRate.value = totalCards.value > 0 ? Math.round((reviewedCount / totalCards.value) * 100) : 0

    // Get overdue cards (cards whose next_review_at is before today, not counting today)
    // We compare dates only, not time
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const overdueResult = await db.all<{ count: number }>(
      'SELECT COUNT(*) as count FROM cards WHERE deleted_at IS NULL AND next_review_at < ?',
      [startOfToday]
    )
    overdueCards.value = overdueResult[0]?.count || 0
  }

  return {
    totalCards,
    totalCollections,
    totalReviews,
    totalSessions,
    globalSuccessRate,
    cardsCreatedThisMonth,
    cardsReviewedThisMonth,
    cardsCreatedToday,
    cardsReviewedToday,
    compartmentData,
    globalCoverageRate,
    overdueCards,
    loadStatistics,
  }
}
