import {
  Purchases,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
} from '@revenuecat/purchases-capacitor'
import { useSubscriptionStore } from '~/store/subscription'
import { useRuntimeConfig } from 'nuxt/app'

export const useSubscription = () => {
  const subscriptionStore = useSubscriptionStore()

  /**
   * Initialize RevenueCat SDK
   * Must be called at app startup
   */
  const initRevenueCat = async () => {
    try {
      const config = useRuntimeConfig()
      const apiKey = config.public.revenuecatApiKey as string

      if (!apiKey) {
        console.error('RevenueCat API key not found in environment variables')
        return
      }

      await Purchases.configure({
        apiKey,
        appUserID: undefined, // Let RevenueCat generate anonymous ID, or use Supabase user ID
      })

      // Enable debug logs in development
      if (process.env.NODE_ENV === 'development') {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
      }

      // Check subscription status on init
      await checkSubscriptionStatus()
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error)
    }
  }

  /**
   * Get available subscription offerings from RevenueCat
   * @returns PurchasesOfferings or null if error
   */
  const getOfferings = async (): Promise<PurchasesOfferings | null> => {
    try {
      subscriptionStore.setLoading(true)
      const offerings = await Purchases.getOfferings()

      if (offerings.current) {
        subscriptionStore.setOfferings(offerings)
        return offerings
      }

      console.warn('No current offering available')
      return null
    } catch (error) {
      console.error('Failed to get offerings:', error)
      return null
    } finally {
      subscriptionStore.setLoading(false)
    }
  }

  /**
   * Purchase a subscription package
   * @param packageToPurchase - The RevenueCat package to purchase
   * @returns CustomerInfo if successful, null otherwise
   */
  const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo | null> => {
    try {
      subscriptionStore.setLoading(true)

      let customerInfo
      try {
        const result = await Purchases.purchasePackage({ aPackage: packageToPurchase })
        customerInfo = result.customerInfo
      } catch (innerError) {
        throw innerError
      }

      // Update subscription status
      const isSubscribed = checkCustomerInfoForActiveSubscription(customerInfo)
      subscriptionStore.setSubscribed(isSubscribed)
      subscriptionStore.setCustomerInfo(customerInfo)

      return customerInfo
    } catch (error: any) {
      // User cancelled purchase
      if (error?.code === 'PURCHASE_CANCELLED') {
        return null
      }

      throw error
    } finally {
      subscriptionStore.setLoading(false)
    }
  }

  /**
   * Restore previous purchases
   * Useful when user reinstalls the app or switches devices
   * @returns CustomerInfo if successful, null otherwise
   */
  const restorePurchases = async (): Promise<CustomerInfo | null> => {
    try {
      subscriptionStore.setLoading(true)
      const { customerInfo } = await Purchases.restorePurchases()

      // Update subscription status
      const isSubscribed = checkCustomerInfoForActiveSubscription(customerInfo)
      subscriptionStore.setSubscribed(isSubscribed)
      subscriptionStore.setCustomerInfo(customerInfo)

      return customerInfo
    } catch (error) {
      console.error('Failed to restore purchases:', error)
      return null
    } finally {
      subscriptionStore.setLoading(false)
    }
  }

  /**
   * Check current subscription status
   * @returns true if user has active subscription, false otherwise
   */
  const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.getCustomerInfo()
      const isSubscribed = checkCustomerInfoForActiveSubscription(customerInfo)

      subscriptionStore.setSubscribed(isSubscribed)
      subscriptionStore.setCustomerInfo(customerInfo)

      return isSubscribed
    } catch (error) {
      console.error('Failed to check subscription status:', error)
      return false
    }
  }

  /**
   * Helper function to check if CustomerInfo has active subscription
   * @param customerInfo - RevenueCat CustomerInfo object
   * @returns true if user has active entitlement
   */
  const checkCustomerInfoForActiveSubscription = (customerInfo: CustomerInfo): boolean => {
    // Check if user has any active entitlements
    // RevenueCat uses "entitlements" to determine what features user has access to
    const activeEntitlements = Object.keys(customerInfo.entitlements.active)

    // You should configure an entitlement identifier in RevenueCat dashboard
    // For example: "premium" or "pro"
    return activeEntitlements.length > 0
  }

  /**
   * Set user ID for RevenueCat
   * Call this after user signs in with Supabase
   * @param userId - Supabase user ID
   */
  const setUserId = async (userId: string) => {
    try {
      await Purchases.logIn({ appUserID: userId })

      // Refresh subscription status after login
      await checkSubscriptionStatus()
    } catch (error) {
      console.error('Failed to set user ID:', error)
    }
  }

  /**
   * Log out current user
   * Call this when user signs out
   */
  const logoutUser = async () => {
    try {
      await Purchases.logOut()
      subscriptionStore.reset()
    } catch (error) {
      console.error('Failed to logout user:', error)
    }
  }

  return {
    initRevenueCat,
    getOfferings,
    purchasePackage,
    restorePurchases,
    checkSubscriptionStatus,
    setUserId,
    logoutUser,
  }
}
