import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotifications } from '~/composables/useNotifications'
import { useUserProfileStore } from '~/store/userProfile'
import { LocalNotifications } from '@capacitor/local-notifications'

// Mock Capacitor LocalNotifications
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: vi.fn(),
    getPending: vi.fn(),
    cancel: vi.fn(),
    schedule: vi.fn(),
  },
}))

// Mock useCards
const mockGetCardsDueToday = vi.fn()

vi.mock('~/composables/useCards', () => ({
  useCards: () => ({
    getCardsDueToday: mockGetCardsDueToday,
  }),
}))

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn((key: string, params?: any) => {
      // Simulate random message selection
      if (key.startsWith('notifications.message')) {
        const firstName = params?.firstName || ''
        return `Test notification message for ${firstName}`.trim()
      }
      return key
    }),
  }),
}))

describe('useNotifications', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Reset all mocks
    vi.clearAllMocks()

    // Setup default mock implementations
    vi.mocked(LocalNotifications.checkPermissions).mockResolvedValue({
      display: 'granted',
    } as any)

    vi.mocked(LocalNotifications.getPending).mockResolvedValue({
      notifications: [],
    } as any)

    vi.mocked(LocalNotifications.schedule).mockResolvedValue({
      notifications: [{ id: 1 }],
    } as any)

    // Mock getCardsDueToday
    mockGetCardsDueToday.mockResolvedValue([
      { id: '1', question: 'Q1', answer: 'A1' },
      { id: '2', question: 'Q2', answer: 'A2' },
    ])

    // Setup user profile store
    const userProfileStore = useUserProfileStore()
    userProfileStore.notificationHour = '20:00'
  })

  describe('scheduleDailyNotification', () => {
    it('should not schedule notification if permission is not granted', async () => {
      vi.mocked(LocalNotifications.checkPermissions).mockResolvedValue({
        display: 'denied',
      } as any)

      const { scheduleDailyNotification } = useNotifications()
      await scheduleDailyNotification()

      expect(LocalNotifications.schedule).not.toHaveBeenCalled()
    })

    it('should not schedule notification if no cards are due', async () => {
      mockGetCardsDueToday.mockResolvedValue([])

      const { scheduleDailyNotification } = useNotifications()
      await scheduleDailyNotification()

      expect(LocalNotifications.schedule).not.toHaveBeenCalled()
    })

    it('should schedule notification for today if time has not passed', async () => {
      const now = new Date()
      const futureHour = now.getHours() + 1
      const userProfileStore = useUserProfileStore()
      userProfileStore.notificationHour = `${futureHour.toString().padStart(2, '0')}:00`

      const { scheduleDailyNotification } = useNotifications()
      await scheduleDailyNotification()

      expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1)
      const scheduleCall = vi.mocked(LocalNotifications.schedule).mock.calls[0][0]
      const scheduledDate = new Date(scheduleCall.notifications[0].schedule!.at!)

      expect(scheduledDate.getDate()).toBe(now.getDate())
      expect(scheduledDate.getHours()).toBe(futureHour)
    })

    it('should schedule notification for tomorrow if time has passed', async () => {
      const now = new Date()
      const pastHour = now.getHours() - 1
      const userProfileStore = useUserProfileStore()
      userProfileStore.notificationHour = `${pastHour.toString().padStart(2, '0')}:00`

      const { scheduleDailyNotification } = useNotifications()
      await scheduleDailyNotification()

      expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1)
      const scheduleCall = vi.mocked(LocalNotifications.schedule).mock.calls[0][0]
      const scheduledDate = new Date(scheduleCall.notifications[0].schedule!.at!)
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)

      expect(scheduledDate.getDate()).toBe(tomorrow.getDate())
    })

    it('should use random notification message with firstName', async () => {
      const userProfileStore = useUserProfileStore()
      userProfileStore.firstName = 'John'

      const { scheduleDailyNotification } = useNotifications()
      await scheduleDailyNotification()

      const scheduleCall = vi.mocked(LocalNotifications.schedule).mock.calls[0][0]
      expect(scheduleCall.notifications[0].body).toContain('Test notification message')
      expect(scheduleCall.notifications[0].title).toBe('MemoLooper')
    })

    it('should use random notification message without firstName', async () => {
      const userProfileStore = useUserProfileStore()
      userProfileStore.firstName = ''

      const { scheduleDailyNotification } = useNotifications()
      await scheduleDailyNotification()

      const scheduleCall = vi.mocked(LocalNotifications.schedule).mock.calls[0][0]
      expect(scheduleCall.notifications[0].body).toBe('Test notification message for')
      expect(scheduleCall.notifications[0].title).toBe('MemoLooper')
    })

    it('should cancel existing notifications before scheduling', async () => {
      vi.mocked(LocalNotifications.getPending).mockResolvedValue({
        notifications: [{ id: 1 }],
      } as any)

      const { scheduleDailyNotification } = useNotifications()
      await scheduleDailyNotification()

      expect(LocalNotifications.cancel).toHaveBeenCalledWith({
        notifications: [{ id: 1 }],
      })
    })
  })

  describe('cancelAllNotifications', () => {
    it('should cancel notifications if they exist', async () => {
      vi.mocked(LocalNotifications.getPending).mockResolvedValue({
        notifications: [{ id: 1 }],
      } as any)

      const { cancelAllNotifications } = useNotifications()
      await cancelAllNotifications()

      expect(LocalNotifications.cancel).toHaveBeenCalledWith({
        notifications: [{ id: 1 }],
      })
    })

    it('should not call cancel if no notifications exist', async () => {
      vi.mocked(LocalNotifications.getPending).mockResolvedValue({
        notifications: [],
      } as any)

      const { cancelAllNotifications } = useNotifications()
      await cancelAllNotifications()

      expect(LocalNotifications.cancel).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(LocalNotifications.getPending).mockRejectedValue(new Error('Test error'))

      const { cancelAllNotifications } = useNotifications()

      // Should not throw
      await expect(cancelAllNotifications()).resolves.toBeUndefined()
    })
  })

  describe('updateDailyNotification', () => {
    it('should cancel and reschedule notification', async () => {
      vi.mocked(LocalNotifications.getPending)
        .mockResolvedValueOnce({
          notifications: [{ id: 1 }],
        } as any)
        .mockResolvedValueOnce({
          notifications: [],
        } as any)

      const { updateDailyNotification } = useNotifications()
      await updateDailyNotification()

      // Cancel is called twice: once by cancelAllNotifications, once by scheduleDailyNotification
      expect(LocalNotifications.cancel).toHaveBeenCalledTimes(1)
      expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1)
    })
  })
})
