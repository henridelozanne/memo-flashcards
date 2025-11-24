import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import MonthCalendar from '@/components/MonthCalendar.vue'

// Mock the database
const mockDb = {
  all: vi.fn(),
}

vi.mock('~/composables/useDatabase', () => ({
  useDatabase: () => ({
    getDbConnection: vi.fn().mockResolvedValue(mockDb),
  }),
}))

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    tm: vi.fn((key: string) => {
      if (key === 'date.weekDays') {
        return ['L', 'M', 'M', 'J', 'V', 'S', 'D']
      }
      return []
    }),
  }),
}))

describe('MonthCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock current date to November 24, 2025
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 10, 24)) // Month is 0-indexed
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders month and year header', async () => {
    mockDb.all.mockResolvedValue([])

    const wrapper = mount(MonthCalendar)
    await flushPromises()

    expect(wrapper.text()).toContain('novembre 2025')
  })

  it('renders weekday headers in French', async () => {
    mockDb.all.mockResolvedValue([])

    const wrapper = mount(MonthCalendar)
    await flushPromises()

    const weekdayHeaders = wrapper.findAll('.mb-2 .text-center')
    expect(weekdayHeaders).toHaveLength(7)
    expect(weekdayHeaders[0].text()).toBe('L')
    expect(weekdayHeaders[1].text()).toBe('M')
    expect(weekdayHeaders[6].text()).toBe('D')
  })

  it('renders correct number of days for November 2025', async () => {
    mockDb.all.mockResolvedValue([])

    const wrapper = mount(MonthCalendar)
    await flushPromises()

    // November 2025 has 30 days
    const dayElements = wrapper.findAll('.grid-cols-7 > div').filter((el) => el.text().match(/^\d+$/))
    expect(dayElements).toHaveLength(30)
  })

  it('renders empty cells before first day of month', async () => {
    mockDb.all.mockResolvedValue([])

    const wrapper = mount(MonthCalendar)
    await flushPromises()

    // November 1, 2025 is a Saturday, so we need 5 empty cells (Mon-Fri)
    const emptyCells = wrapper.findAll('.aspect-square').filter((el) => el.text() === '')
    expect(emptyCells.length).toBeGreaterThan(0)
  })

  it('highlights current day with purple ring', async () => {
    mockDb.all.mockResolvedValue([])

    const wrapper = mount(MonthCalendar)
    await flushPromises()

    // Find the day 24 element
    const dayElements = wrapper.findAll('.grid-cols-7 > div')
    const day24 = dayElements.find((el) => el.text().includes('24'))

    expect(day24).toBeDefined()
    expect(day24?.classes()).toContain('ring-[var(--color-accent-purple)]')
  })

  it('highlights review days with green background', async () => {
    mockDb.all.mockResolvedValue([{ review_date: '2025-11-23' }])

    const wrapper = mount(MonthCalendar)
    await flushPromises()
    await nextTick()

    // Find the day 23 element
    const dayElements = wrapper.findAll('.grid-cols-7 > div')
    const day23 = dayElements.find((el) => el.text().includes('23'))

    expect(day23).toBeDefined()
    expect(day23?.classes()).toContain('bg-[#10b981]')
  })

  it('displays success icon on review days', async () => {
    mockDb.all.mockResolvedValue([{ review_date: '2025-11-23' }])

    const wrapper = mount(MonthCalendar)
    await flushPromises()
    await nextTick()

    const successIcons = wrapper.findAll('svg circle[fill="#10b981"]')
    expect(successIcons.length).toBeGreaterThan(0)
  })

  it('queries database with correct date range for current month', async () => {
    mockDb.all.mockResolvedValue([])

    mount(MonthCalendar)
    await flushPromises()

    expect(mockDb.all).toHaveBeenCalledWith(
      expect.stringContaining('SELECT DISTINCT DATE'),
      expect.arrayContaining([
        'default-user',
        expect.any(Number), // startOfMonth timestamp
        expect.any(Number), // endOfMonth timestamp
      ])
    )

    // Verify date range is for November 2025
    const callArgs = mockDb.all.mock.calls[0]
    const startOfMonth = callArgs[1][1]
    const endOfMonth = callArgs[1][2]

    expect(new Date(startOfMonth).getMonth()).toBe(10) // November (0-indexed)
    expect(new Date(endOfMonth).getMonth()).toBe(10)
  })

  it('navigates to previous month when clicking left arrow', async () => {
    mockDb.all.mockResolvedValue([])

    const wrapper = mount(MonthCalendar)
    await flushPromises()

    expect(wrapper.text()).toContain('novembre 2025')

    const leftButton = wrapper.findAll('button')[0]
    await leftButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('octobre 2025')
    expect(mockDb.all).toHaveBeenCalledTimes(2) // Initial load + navigation
  })

  it('navigates to next month when clicking right arrow', async () => {
    mockDb.all.mockResolvedValue([])

    const wrapper = mount(MonthCalendar)
    await flushPromises()

    expect(wrapper.text()).toContain('novembre 2025')

    const rightButton = wrapper.findAll('button')[1]
    await rightButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('décembre 2025')
    expect(mockDb.all).toHaveBeenCalledTimes(2) // Initial load + navigation
  })

  it('applies gray background to future dates', async () => {
    mockDb.all.mockResolvedValue([])

    const wrapper = mount(MonthCalendar)
    await flushPromises()

    // Find day 30 (future date from Nov 24)
    const dayElements = wrapper.findAll('.grid-cols-7 > div')
    const day30 = dayElements.find((el) => el.text().includes('30'))

    expect(day30).toBeDefined()
    expect(day30?.classes()).toContain('bg-gray-100')
    expect(day30?.classes()).toContain('text-gray-400')
  })

  it('combines today ring with review background when both conditions met', async () => {
    // Set system time to Nov 23 and add review for that day
    vi.setSystemTime(new Date(2025, 10, 23))
    mockDb.all.mockResolvedValue([{ review_date: '2025-11-23' }])

    const wrapper = mount(MonthCalendar)
    await flushPromises()
    await nextTick()

    // Find the day 23 element (today with review)
    const dayElements = wrapper.findAll('.grid-cols-7 > div')
    const day23 = dayElements.find((el) => el.text().includes('23'))

    expect(day23).toBeDefined()
    expect(day23?.classes()).toContain('bg-[#10b981]')
    expect(day23?.classes()).toContain('ring-[var(--color-accent-purple)]')
  })

  it('success icon has white stroke', async () => {
    mockDb.all.mockResolvedValue([{ review_date: '2025-11-23' }])

    const wrapper = mount(MonthCalendar)
    await flushPromises()
    await nextTick()

    const successIconCircle = wrapper.find('svg circle[fill="#10b981"]')
    expect(successIconCircle.exists()).toBe(true)
    expect(successIconCircle.attributes('stroke')).toBe('white')
    expect(successIconCircle.attributes('stroke-width')).toBe('1.5')
  })
})
