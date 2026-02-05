import { defineStore } from 'pinia'
import type { PurchasesOfferings, CustomerInfo } from '@revenuecat/purchases-capacitor'

interface SubscriptionState {
  isSubscribed: boolean
  offerings: PurchasesOfferings | null
  customerInfo: CustomerInfo | null
  loading: boolean
  initialized: boolean
}

export const useSubscriptionStore = defineStore('subscription', {
  state: (): SubscriptionState => ({
    isSubscribed: false,
    offerings: null,
    customerInfo: null,
    loading: false,
    initialized: false,
  }),

  getters: {
    /**
     * Check if user has premium access
     */
    hasPremiumAccess(): boolean {
      return this.isSubscribed
    },

    /**
     * Get current subscription plan type
     */
    currentPlan(): string | null {
      if (!this.customerInfo || !this.isSubscribed) {
        return null
      }

      // Get the first active entitlement
      const activeEntitlements = Object.keys(this.customerInfo.entitlements.active)
      if (activeEntitlements.length > 0) {
        const entitlement = this.customerInfo.entitlements.active[activeEntitlements[0]]
        return entitlement?.productIdentifier || null
      }

      return null
    },

    /**
     * Get subscription expiration date
     */
    expirationDate(): Date | null {
      if (!this.customerInfo || !this.isSubscribed) {
        return null
      }

      const activeEntitlements = Object.keys(this.customerInfo.entitlements.active)
      if (activeEntitlements.length > 0) {
        const entitlement = this.customerInfo.entitlements.active[activeEntitlements[0]]
        return entitlement?.expirationDate ? new Date(entitlement.expirationDate) : null
      }

      return null
    },

    /**
     * Check if subscription is in free trial
     */
    isInFreeTrial(): boolean {
      if (!this.customerInfo || !this.isSubscribed) {
        return false
      }

      const activeEntitlements = Object.keys(this.customerInfo.entitlements.active)
      if (activeEntitlements.length > 0) {
        const entitlement = this.customerInfo.entitlements.active[activeEntitlements[0]]
        return entitlement?.periodType === 'TRIAL'
      }

      return false
    },
  },

  actions: {
    /**
     * Set subscription status
     */
    setSubscribed(isSubscribed: boolean) {
      this.isSubscribed = isSubscribed
    },

    /**
     * Set offerings
     */
    setOfferings(offerings: PurchasesOfferings) {
      this.offerings = offerings
    },

    /**
     * Set customer info
     */
    setCustomerInfo(customerInfo: CustomerInfo) {
      this.customerInfo = customerInfo
    },

    /**
     * Set loading state
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * Mark store as initialized
     */
    setInitialized(initialized: boolean) {
      this.initialized = initialized
    },

    /**
     * Reset store to initial state
     */
    reset() {
      this.isSubscribed = false
      this.offerings = null
      this.customerInfo = null
      this.loading = false
      this.initialized = false
    },
  },
})
