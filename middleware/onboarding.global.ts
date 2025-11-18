import type { RouteLocationNormalized } from 'vue-router'
import { useOnboardingStore } from '~/store/onboarding'

// @ts-expect-error - Auto-imported by Nuxt
export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Skip check if already on onboarding route
  if (to.path.startsWith('/onboarding') || to.path.startsWith('/paywall')) {
    return
  }

  const onboardingStore = useOnboardingStore()

  // Only check once per session
  if (onboardingStore.hasCompletedOnboarding === null) {
    await onboardingStore.initOnboardingStatus()
  }

  // Redirect to onboarding if not completed
  if (!onboardingStore.hasCompletedOnboarding) {
    // @ts-expect-error - Auto-imported by Nuxt
    return navigateTo('/onboarding/welcome')
  }
})
