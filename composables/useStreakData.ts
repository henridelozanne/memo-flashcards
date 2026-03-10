import { useDatabase } from '~/composables/useDatabase'

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface WeekDayStatus {
  date: Date
  reviewed: boolean
  isFuture: boolean
}

export const useStreakData = () => {
  function getLast7DaysDates(): Date[] {
    const today = new Date()
    const dates: Date[] = []
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      dates.push(d)
    }
    return dates
  }

  async function getLast7DaysStatus(): Promise<boolean[]> {
    const { getDbConnection } = useDatabase()
    const db = await getDbConnection()

    const dates = getLast7DaysDates()
    const startDate = dates[0]
    const startDateStr = formatDate(startDate)

    const reviewDatesResult = await db.all<{ review_date: string }>(
      `SELECT DISTINCT DATE(reviewed_at / 1000, 'unixepoch') as review_date
       FROM review_logs
       WHERE user_id = ? AND DATE(reviewed_at / 1000, 'unixepoch') >= ?`,
      ['default-user', startDateStr]
    )

    const reviewDatesSet = new Set(reviewDatesResult.map((r) => r.review_date))

    return dates.map((d, i) => {
      if (i === 6) return true
      return reviewDatesSet.has(formatDate(d))
    })
  }

  async function getCurrentWeekStatus(): Promise<WeekDayStatus[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Last 7 days, today always at index 6
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return d
    })

    const { getDbConnection } = useDatabase()
    const db = await getDbConnection()

    const reviewDatesResult = await db.all<{ review_date: string }>(
      `SELECT DISTINCT DATE(reviewed_at / 1000, 'unixepoch') as review_date
       FROM review_logs
       WHERE user_id = ? AND DATE(reviewed_at / 1000, 'unixepoch') >= ?`,
      ['default-user', formatDate(dates[0])]
    )

    const reviewDatesSet = new Set(reviewDatesResult.map((r) => r.review_date))
    const todayStr = formatDate(today)

    return dates.map((d) => {
      const dateStr = formatDate(d)
      const isToday = dateStr === todayStr
      const reviewed = isToday ? true : reviewDatesSet.has(dateStr)
      return { date: d, reviewed, isFuture: false }
    })
  }

  async function getStreakCount(): Promise<number> {
    const { getDbConnection } = useDatabase()
    const db = await getDbConnection()

    const result = await db.all<{ review_date: string }>(
      `SELECT DISTINCT DATE(reviewed_at / 1000, 'unixepoch') as review_date
       FROM review_logs
       WHERE user_id = ?
       ORDER BY review_date DESC`,
      ['default-user']
    )

    const reviewDates = new Set(result.map((r) => r.review_date))
    let count = 1 // today always counts (just finished)
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - 1)

    while (reviewDates.has(formatDate(d))) {
      count += 1
      d.setDate(d.getDate() - 1)
    }

    return count
  }

  return { getLast7DaysDates, getLast7DaysStatus, getCurrentWeekStatus, getStreakCount }
}
