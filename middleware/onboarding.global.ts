import type { RouteLocationNormalized } from 'vue-router'
import { useUserProfileStore } from '~/store/userProfile'
import { syncUserProfileFromRemote, syncUserProfileToRemote } from '~/lib/sync'

// @ts-expect-error - Auto-imported by Nuxt
export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Skip check if already on onboarding route
  if (to.path.startsWith('/onboarding') || to.path.startsWith('/paywall')) {
    return
  }

  const userProfileStore = useUserProfileStore()

  // Load user data from SQLite (with bidirectional sync)
  if (userProfileStore.hasCompletedOnboarding === null) {
    // Sync from remote to local (blocking)
    try {
      await syncUserProfileFromRemote()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to sync profile from remote at startup:', error)
      // Continue anyway - user might be offline
    }

    // Sync from local to remote if local is newer (non-blocking)
    try {
      await syncUserProfileToRemote()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to sync profile to remote at startup:', error)
      // Continue anyway - user might be offline
    }

    // Load from local SQLite
    await userProfileStore.loadUserData()
  }

  // Redirect to onboarding if not completed
  if (!userProfileStore.hasCompletedOnboarding) {
    // @ts-expect-error - Auto-imported by Nuxt
    return navigateTo('/onboarding/welcome')
  }
})
