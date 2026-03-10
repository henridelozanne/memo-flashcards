import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStreakData } from '~/composables/useStreakData'
import { useDatabase } from '~/composables/useDatabase'

vi.mock('~/composables/useDatabase')

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return formatDate(d)
}

function makeMockDb(reviewDates: string[]) {
  const mockDb = {
    all: vi.fn().mockResolvedValue(reviewDates.map((d) => ({ review_date: d }))),
  }
  vi.mocked(useDatabase).mockReturnValue({
    getDbConnection: vi.fn().mockResolvedValue(mockDb),
  } as any)
  return mockDb
}

describe('useStreakData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-10T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── getLast7DaysDates ────────────────────────────────────────────────────

  describe('getLast7DaysDates', () => {
    it('returns 7 dates', () => {
      const { getLast7DaysDates } = useStreakData()
      expect(getLast7DaysDates()).toHaveLength(7)
    })

    it('last date is today', () => {
      const { getLast7DaysDates } = useStreakData()
      const dates = getLast7DaysDates()
      const today = new Date('2026-03-10')
      expect(formatDate(dates[6])).toBe(formatDate(today))
    })

    it('first date is 6 days ago', () => {
      const { getLast7DaysDates } = useStreakData()
      const dates = getLast7DaysDates()
      expect(formatDate(dates[0])).toBe('2026-03-04')
    })

    it('dates are consecutive', () => {
      const { getLast7DaysDates } = useStreakData()
      const dates = getLast7DaysDates()
      for (let i = 1; i < dates.length; i += 1) {
        const diff = dates[i].getTime() - dates[i - 1].getTime()
        expect(diff).toBe(24 * 60 * 60 * 1000)
      }
    })
  })

  // ─── getLast7DaysStatus ───────────────────────────────────────────────────

  describe('getLast7DaysStatus', () => {
    it('today (index 6) is always true', async () => {
      makeMockDb([]) // no review dates from DB
      const { getLast7DaysStatus } = useStreakData()
      const status = await getLast7DaysStatus()
      expect(status[6]).toBe(true)
    })

    it('returns true for days that have a review', async () => {
      makeMockDb(['2026-03-08', '2026-03-09'])
      const { getLast7DaysStatus } = useStreakData()
      const status = await getLast7DaysStatus()
      // index 4 = 2026-03-08, index 5 = 2026-03-09
      expect(status[4]).toBe(true)
      expect(status[5]).toBe(true)
    })

    it('returns false for days without a review', async () => {
      makeMockDb(['2026-03-10']) // only today
      const { getLast7DaysStatus } = useStreakData()
      const status = await getLast7DaysStatus()
      expect(status[0]).toBe(false)
      expect(status[1]).toBe(false)
    })

    it('returns 7 booleans', async () => {
      makeMockDb([])
      const { getLast7DaysStatus } = useStreakData()
      const status = await getLast7DaysStatus()
      expect(status).toHaveLength(7)
    })
  })

  // ─── getCurrentWeekStatus ─────────────────────────────────────────────────

  describe('getCurrentWeekStatus', () => {
    it('returns 7 WeekDayStatus entries', async () => {
      makeMockDb([])
      const { getCurrentWeekStatus } = useStreakData()
      const result = await getCurrentWeekStatus()
      expect(result).toHaveLength(7)
    })

    it('today (index 6) is always reviewed', async () => {
      makeMockDb([])
      const { getCurrentWeekStatus } = useStreakData()
      const result = await getCurrentWeekStatus()
      expect(result[6].reviewed).toBe(true)
    })

    it('today (index 6) is not marked as future', async () => {
      makeMockDb([])
      const { getCurrentWeekStatus } = useStreakData()
      const result = await getCurrentWeekStatus()
      expect(result[6].isFuture).toBe(false)
    })

    it('marks days with reviews as reviewed', async () => {
      makeMockDb(['2026-03-07', '2026-03-09'])
      const { getCurrentWeekStatus } = useStreakData()
      const result = await getCurrentWeekStatus()
      // index 3 = 2026-03-07, index 5 = 2026-03-09
      expect(result[3].reviewed).toBe(true)
      expect(result[5].reviewed).toBe(true)
    })

    it('marks days without reviews as not reviewed', async () => {
      makeMockDb([])
      const { getCurrentWeekStatus } = useStreakData()
      const result = await getCurrentWeekStatus()
      for (let i = 0; i < 6; i += 1) {
        expect(result[i].reviewed).toBe(false)
      }
    })

    it('index 6 date is today', async () => {
      makeMockDb([])
      const { getCurrentWeekStatus } = useStreakData()
      const result = await getCurrentWeekStatus()
      expect(formatDate(result[6].date)).toBe('2026-03-10')
    })

    it('index 0 date is 6 days ago', async () => {
      makeMockDb([])
      const { getCurrentWeekStatus } = useStreakData()
      const result = await getCurrentWeekStatus()
      expect(formatDate(result[0].date)).toBe('2026-03-04')
    })
  })

  // ─── getStreakCount ───────────────────────────────────────────────────────

  describe('getStreakCount', () => {
    it('returns 1 when no previous days reviewed', async () => {
      makeMockDb([])
      const { getStreakCount } = useStreakData()
      expect(await getStreakCount()).toBe(1)
    })

    it('returns 2 when only yesterday was reviewed', async () => {
      makeMockDb([daysAgo(1)])
      const { getStreakCount } = useStreakData()
      expect(await getStreakCount()).toBe(2)
    })

    it('counts consecutive days from yesterday backward', async () => {
      makeMockDb([daysAgo(1), daysAgo(2), daysAgo(3)])
      const { getStreakCount } = useStreakData()
      expect(await getStreakCount()).toBe(4)
    })

    it('stops at the first gap', async () => {
      // day 1 missing, so streak stops at day 1 (today)
      makeMockDb([daysAgo(2), daysAgo(3)])
      const { getStreakCount } = useStreakData()
      expect(await getStreakCount()).toBe(1)
    })

    it('handles a long streak correctly', async () => {
      const dates = Array.from({ length: 9 }, (_, i) => daysAgo(i + 1))
      makeMockDb(dates)
      const { getStreakCount } = useStreakData()
      expect(await getStreakCount()).toBe(10)
    })
  })
})
