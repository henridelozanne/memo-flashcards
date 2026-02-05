import { useSubscription } from '~/composables/useSubscription'
import { useSubscriptionStore } from '~/store/subscription'

import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(async () => {
  // Don't block app initialization if RevenueCat fails
  try {
    const { initRevenueCat } = useSubscription()
    const subscriptionStore = useSubscriptionStore()

    // Initialize RevenueCat on app startup
    if (!subscriptionStore.initialized) {
      await initRevenueCat()
      subscriptionStore.setInitialized(true)
    }
  } catch (error) {
    console.warn('RevenueCat initialization failed (non-blocking):', error)
    // Continue app initialization even if RevenueCat fails
  }
})
