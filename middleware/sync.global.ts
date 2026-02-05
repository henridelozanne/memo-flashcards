import type { RouteLocationNormalized } from 'vue-router'
import { useUserProfileStore } from '~/store/userProfile'
import {
  syncUserProfileFromRemote,
  syncUserProfileToRemote,
  syncCollectionsFromRemote,
  syncCollectionsToRemote,
  syncCardsFromRemote,
  syncCardsToRemote,
} from '~/lib/sync'

// @ts-expect-error - Auto-imported by Nuxt
export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Skip check if already on onboarding route
  if (to.path.startsWith('/onboarding') || to.path.startsWith('/paywall')) {
    return
  }

  const userProfileStore = useUserProfileStore()

  // Load user data from SQLite (with bidirectional sync)
  if (userProfileStore.hasCompletedOnboarding === null) {
    // Wrap all sync operations in a try-catch to prevent blocking the app
    try {
      // Sync user profile from remote to local (blocking)
      try {
        await syncUserProfileFromRemote()
      } catch (error) {
        console.error('[MIDDLEWARE] Failed to sync profile from remote at startup:', error)
        // Continue anyway - user might be offline
      }

    // Sync user profile from local to remote if local is newer (non-blocking)
    try {
      await syncUserProfileToRemote()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to sync profile to remote at startup:', error)
      // Continue anyway - user might be offline
    }

    // Sync collections from remote to local (blocking)
    try {
      await syncCollectionsFromRemote()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to sync collections from remote at startup:', error)
    }

    // Sync collections from local to remote if local is newer (non-blocking)
    try {
      await syncCollectionsToRemote()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to sync collections to remote at startup:', error)
    }

    // Sync cards from remote to local (blocking)
    try {
      await syncCardsFromRemote()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to sync cards from remote at startup:', error)
    }

    // Sync cards from local to remote if local is newer (non-blocking)
    try {
      await syncCardsToRemote()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to sync cards to remote at startup:', error)
    }

    // Invalidate daily review cache after syncing cards
    try {
      const { useDailyReview } = await import('~/composables/useDailyReview')
      const { invalidateCache } = useDailyReview()
      await invalidateCache()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to invalidate daily review cache:', error)
    }

    // Load from local SQLite - this should never fail
    try {
      await userProfileStore.loadUserData()
    } catch (error) {
      console.error('[MIDDLEWARE] Failed to load user data from SQLite:', error)
      // If this fails, something is seriously wrong - but don't block the app
    }
    } catch (globalError) {
      console.error('[MIDDLEWARE] Critical error during sync initialization:', globalError)
      // Even if everything fails, try to load local data
      try {
        await userProfileStore.loadUserData()
      } catch (e) {
        console.error('[MIDDLEWARE] Could not load any user data:', e)
      }
    }
  }

  // Redirect to onboarding if not completed
  if (!userProfileStore.hasCompletedOnboarding) {
    // @ts-expect-error - Auto-imported by Nuxt
    return navigateTo('/onboarding/welcome')
  }
})
