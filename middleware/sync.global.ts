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
  // Skip check if already on onboarding route or legal page
  if (to.path.startsWith('/onboarding') || to.path.startsWith('/paywall') || to.path === '/legal') {
    return
  }

  const userProfileStore = useUserProfileStore()

  // Load user data from SQLite (with bidirectional sync)
  if (userProfileStore.hasCompletedOnboarding === null) {
    try {
      // Step 1 — profile and collections are independent: run in parallel
      const [, collectionsFromRemoteOk] = await Promise.allSettled([
        syncUserProfileFromRemote().catch((e) => console.error('[MIDDLEWARE] Failed to sync profile from remote:', e)),
        syncCollectionsFromRemote().catch((e) =>
          console.error('[MIDDLEWARE] Failed to sync collections from remote:', e)
        ),
      ])

      // Step 2 — cards depend on collections being present locally first
      if (collectionsFromRemoteOk.status === 'fulfilled') {
        await syncCardsFromRemote().catch((e) => console.error('[MIDDLEWARE] Failed to sync cards from remote:', e))
      }

      // Step 3 — push local→remote in background (non-blocking, no await)
      Promise.allSettled([syncUserProfileToRemote(), syncCollectionsToRemote(), syncCardsToRemote()])

      // Step 4 — invalidate cache and load local data
      try {
        const { useDailyReview } = await import('~/composables/useDailyReview')
        const { invalidateCache } = useDailyReview()
        await invalidateCache()
      } catch (error) {
        console.error('[MIDDLEWARE] Failed to invalidate daily review cache:', error)
      }

      await userProfileStore
        .loadUserData()
        .catch((e) => console.error('[MIDDLEWARE] Failed to load user data from SQLite:', e))
    } catch (globalError) {
      console.error('[MIDDLEWARE] Critical error during sync initialization:', globalError)
      await userProfileStore.loadUserData().catch((e) => console.error('[MIDDLEWARE] Could not load any user data:', e))
    }
  }

  // Redirect to onboarding if not completed
  if (!userProfileStore.hasCompletedOnboarding) {
    // @ts-expect-error - Auto-imported by Nuxt
    // eslint-disable-next-line consistent-return
    return navigateTo('/onboarding/welcome')
  }
})
