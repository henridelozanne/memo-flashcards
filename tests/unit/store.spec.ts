import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useAppStore from '~/store/app'
import { useOnboardingStore } from '~/store/onboarding'

// Mock useSupabaseAuth composable
const mockLoadUserProfile = vi.fn()

vi.mock('@/composables/useSupabaseAuth', () => ({
  default: () => ({
    loadUserProfile: mockLoadUserProfile,
  }),
}))

describe('app store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('toggles premium', () => {
    const store = useAppStore()
    expect(store.isPremium).toBe(false)
    store.togglePremium()
    expect(store.isPremium).toBe(true)
  })

  it('sets language', () => {
    const store = useAppStore()
    store.setLanguage('en')
    expect(store.language).toBe('en')
  })
})

describe('onboarding store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with null hasCompletedOnboarding', () => {
    const store = useOnboardingStore()
    expect(store.hasCompletedOnboarding).toBeNull()
  })

  it('sets user data correctly', () => {
    const store = useOnboardingStore()
    store.firstName = 'John'
    store.goal = 'Learn Spanish'
    store.situation = 'Student'
    store.notificationHour = '09:00'

    expect(store.firstName).toBe('John')
    expect(store.goal).toBe('Learn Spanish')
    expect(store.situation).toBe('Student')
    expect(store.notificationHour).toBe('09:00')
  })

  it('marks onboarding as completed', () => {
    const store = useOnboardingStore()
    expect(store.hasCompletedOnboarding).toBeNull()

    store.completeOnboarding()

    expect(store.hasCompletedOnboarding).toBe(true)
  })

  it('resets onboarding state', () => {
    const store = useOnboardingStore()
    store.firstName = 'John'
    store.goal = 'Learn Spanish'
    store.completeOnboarding()

    store.resetOnboarding()

    expect(store.firstName).toBe('')
    expect(store.goal).toBe('')
    expect(store.situation).toBe('')
    expect(store.notificationHour).toBe('')
    expect(store.hasCompletedOnboarding).toBe(false)
  })

  it('should load all user data from Supabase when onboarding is completed', async () => {
    mockLoadUserProfile.mockResolvedValue({
      firstName: 'John',
      goal: 'learn',
      situation: 'student',
      notificationHour: '09:00',
      hasCompletedOnboarding: true,
    })
    const store = useOnboardingStore()

    await store.loadUserData()

    expect(store.firstName).toBe('John')
    expect(store.goal).toBe('learn')
    expect(store.situation).toBe('student')
    expect(store.notificationHour).toBe('09:00')
    expect(store.hasCompletedOnboarding).toBe(true)
  })

  it('should set hasCompletedOnboarding to false when no profile found', async () => {
    mockLoadUserProfile.mockResolvedValue(null)
    const store = useOnboardingStore()

    await store.loadUserData()

    expect(store.hasCompletedOnboarding).toBe(false)
  })

  it('should handle errors when loading user profile', async () => {
    const store = useOnboardingStore()
    mockLoadUserProfile.mockRejectedValue(new Error('Network error'))

    await store.loadUserData()

    expect(store.hasCompletedOnboarding).toBe(false)
  })
})
