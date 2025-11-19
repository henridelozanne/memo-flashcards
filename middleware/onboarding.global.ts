import type { RouteLocationNormalized } from 'vue-router'
import { useUserProfileStore } from '~/store/userProfile'

// @ts-expect-error - Auto-imported by Nuxt
export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Skip check if already on onboarding route
  if (to.path.startsWith('/onboarding') || to.path.startsWith('/paywall')) {
    return
  }

  const userProfileStore = useUserProfileStore()

  // Load user data from Supabase if not already loaded
  if (userProfileStore.hasCompletedOnboarding === null) {
    await userProfileStore.loadUserData()
  }

  // Redirect to onboarding if not completed
  if (!userProfileStore.hasCompletedOnboarding) {
    // @ts-expect-error - Auto-imported by Nuxt
    return navigateTo('/onboarding/welcome')
  }
})
