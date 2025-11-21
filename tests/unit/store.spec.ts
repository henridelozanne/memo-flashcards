import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useAppStore from '~/store/app'
import { useOnboardingStore } from '~/store/onboarding'
import { useUserProfileStore } from '~/store/userProfile'

// Mock useUserProfile composable
const mockLoadUserProfile = vi.fn()

vi.mock('@/composables/useUserProfile', () => ({
  useUserProfile: () => ({
    loadUserProfile: mockLoadUserProfile,
  }),
}))

vi.mock('@/composables/useSupabaseAuth', () => ({
  default: () => ({
    getCurrentUserId: vi.fn().mockResolvedValue('user-123'),
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

describe('user profile store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const store = useUserProfileStore()
    expect(store.hasCompletedOnboarding).toBeNull()
    expect(store.firstName).toBe('')
    expect(store.language).toBe('en')
  })

  it('should load all user data from SQLite when onboarding is completed', async () => {
    mockLoadUserProfile.mockResolvedValue({
      id: 'profile-123',
      user_id: 'user-123',
      first_name: 'John',
      goal: 'learn',
      situation: 'student',
      notification_hour: '09:00',
      language: 'fr',
      onboarding_completed_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    })
    const store = useUserProfileStore()

    await store.loadUserData()

    expect(store.firstName).toBe('John')
    expect(store.goal).toBe('learn')
    expect(store.situation).toBe('student')
    expect(store.notificationHour).toBe('09:00')
    expect(store.language).toBe('fr')
    expect(store.hasCompletedOnboarding).toBe(true)
  })

  it('should set hasCompletedOnboarding to false when no profile found', async () => {
    mockLoadUserProfile.mockResolvedValue(null)
    const store = useUserProfileStore()

    await store.loadUserData()

    expect(store.hasCompletedOnboarding).toBe(false)
  })

  it('should handle errors when loading user profile', async () => {
    const store = useUserProfileStore()
    mockLoadUserProfile.mockRejectedValue(new Error('Network error'))

    await store.loadUserData()

    expect(store.hasCompletedOnboarding).toBe(false)
  })
})

describe('onboarding store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const store = useOnboardingStore()
    expect(store.currentStep).toBe(1)
    expect(store.totalSteps).toBe(10)
  })

  it('navigates to next step', () => {
    const store = useOnboardingStore()
    expect(store.currentStep).toBe(1)

    store.nextStep()

    expect(store.currentStep).toBe(2)
  })

  it('navigates to previous step', () => {
    const store = useOnboardingStore()
    store.nextStep()
    store.nextStep()
    expect(store.currentStep).toBe(3)

    store.previousStep()

    expect(store.currentStep).toBe(2)
  })

  it('resets to first step', () => {
    const store = useOnboardingStore()
    store.nextStep()
    store.nextStep()
    expect(store.currentStep).toBe(3)

    store.resetOnboarding()

    expect(store.currentStep).toBe(1)
  })
})
