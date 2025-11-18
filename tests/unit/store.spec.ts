import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useAppStore from '~/store/app'
import { useOnboardingStore } from '~/store/onboarding'

// Mock useSupabaseAuth composable
const mockCheckOnboardingStatus = vi.fn()
vi.mock('@/composables/useSupabaseAuth', () => ({
  default: () => ({
    checkOnboardingStatus: mockCheckOnboardingStatus,
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

  it('initOnboardingStatus checks Supabase and updates state', async () => {
    mockCheckOnboardingStatus.mockResolvedValue(true)
    const store = useOnboardingStore()

    await store.initOnboardingStatus()

    expect(store.hasCompletedOnboarding).toBe(true)
  })

  it('initOnboardingStatus handles false from Supabase', async () => {
    mockCheckOnboardingStatus.mockResolvedValue(false)
    const store = useOnboardingStore()

    await store.initOnboardingStatus()

    expect(store.hasCompletedOnboarding).toBe(false)
  })

  it('initOnboardingStatus handles errors gracefully', async () => {
    mockCheckOnboardingStatus.mockRejectedValue(new Error('Network error'))
    const store = useOnboardingStore()

    await store.initOnboardingStatus()

    // Should set to false on error (safer default)
    expect(store.hasCompletedOnboarding).toBe(false)
  })
})
