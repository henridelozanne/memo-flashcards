import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUserProfile } from '@/composables/useUserProfile'

// Mock useDatabase
vi.mock('@/composables/useDatabase', () => ({
  useDatabase: () => ({
    getDbConnection: vi.fn().mockResolvedValue({
      get: vi.fn().mockResolvedValue({
        id: 'user-123',
        user_id: 'user-123',
        first_name: 'John',
        goal: 'developCulture',
        situation: 'student',
        notification_hour: '20:00',
        language: 'en',
        onboarding_completed_at: Date.now(),
        created_at: Date.now(),
        updated_at: Date.now(),
      }),
      run: vi.fn().mockResolvedValue({ changes: { changes: 1 } }),
    }),
  }),
}))

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads user profile from SQLite', async () => {
    const { loadUserProfile } = useUserProfile()
    const profile = await loadUserProfile('user-123')

    expect(profile).toBeDefined()
    expect(profile?.first_name).toBe('John')
    expect(profile?.goal).toBe('developCulture')
  })

  it('saves user profile to SQLite', async () => {
    const { saveUserProfile } = useUserProfile()

    await expect(
      saveUserProfile({
        userId: 'user-123',
        firstName: 'Jane',
        goal: 'learnLanguage',
        situation: 'employed',
        notificationHour: '19:00',
        language: 'fr',
      })
    ).resolves.not.toThrow()
  })

  it('updates notification hour', async () => {
    const { updateNotificationHour } = useUserProfile()

    await expect(updateNotificationHour('user-123', '21:00')).resolves.not.toThrow()
  })

  it('updates language', async () => {
    const { updateLanguage } = useUserProfile()

    await expect(updateLanguage('user-123', 'es')).resolves.not.toThrow()
  })
})
