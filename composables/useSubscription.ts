import {
  Purchases,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
} from '@revenuecat/purchases-capacitor'
import { computed, ref } from 'vue'
import { useSubscriptionStore } from '~/store/subscription'
import { useRuntimeConfig } from 'nuxt/app'
import { useUserProfile } from '~/composables/useUserProfile'
import useSupabaseAuth from '~/composables/useSupabaseAuth'

const MONTHLY_PRODUCT_ID = 'memo_pro_monthly'
const MONTHLY_FREE_TRIAL_PRODUCT_ID = 'memo_pro_monthly_free_trial'
const LIFETIME_PRODUCT_ID = 'memo_pro_lifetime'

export const useSubscription = () => {
  const subscriptionStore = useSubscriptionStore()

  const deriveSubscriptionSnapshot = (customerInfo: CustomerInfo) => {
    const activeEntitlements = Object.values(customerInfo.entitlements.active)
    if (activeEntitlements.length === 0) {
      return {
        status: 'free' as const,
        productId: null,
        expiresAt: null,
      }
    }

    const entitlement = activeEntitlements[0]
    const productId = entitlement?.productIdentifier || null
    const expiresAt = entitlement?.expirationDate ? new Date(entitlement.expirationDate).getTime() : null

    if (productId === LIFETIME_PRODUCT_ID) {
      return {
        status: 'lifetime' as const,
        productId,
        expiresAt: null,
      }
    }

    if (entitlement?.periodType === 'TRIAL') {
      return {
        status: 'monthly_trial' as const,
        productId: productId || MONTHLY_FREE_TRIAL_PRODUCT_ID,
        expiresAt,
      }
    }

    return {
      status: 'monthly' as const,
      productId: productId || MONTHLY_PRODUCT_ID,
      expiresAt,
    }
  }

  const updateLocalSubscriptionStatus = async (customerInfo: CustomerInfo) => {
    try {
      const { status, productId, expiresAt } = deriveSubscriptionSnapshot(customerInfo)
      const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
      const { getCurrentUserId } = useSupabaseAuth()
      const userId = await getCurrentUserId()

      const { useUserProfile } = await import('~/composables/useUserProfile')
      const { updateSubscriptionStatus } = useUserProfile()

      await updateSubscriptionStatus({
        userId,
        subscriptionStatus: status,
        subscriptionProductId: productId,
        subscriptionExpiresAt: expiresAt,
        subscriptionUpdatedAt: Date.now(),
      })
    } catch (error) {
      console.warn('Failed to update local subscription status:', error)
    }
  }

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
        // Créer un objet propre sans proxy Vue
        const cleanPackage = JSON.parse(JSON.stringify(packageToPurchase))

        const result = await Purchases.purchasePackage({ aPackage: cleanPackage })
        customerInfo = result.customerInfo
      } catch (innerError) {
        console.error('❌ Purchases.purchasePackage ERROR:', innerError)
        throw innerError
      }

      // Update subscription status
      const isSubscribed = checkCustomerInfoForActiveSubscription(customerInfo)
      subscriptionStore.setSubscribed(isSubscribed)
      subscriptionStore.setCustomerInfo(customerInfo)
      await updateLocalSubscriptionStatus(customerInfo)

      return customerInfo
    } catch (error: any) {
      console.error('⚠️ purchasePackage CATCH:', error)
      // User cancelled purchase
      if (error?.code === 'PURCHASE_CANCELLED') {
        console.log('🚫 User cancelled purchase')
        return null
      }

      console.error('❌ Rethrowing error:', error)
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
      await updateLocalSubscriptionStatus(customerInfo)

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
      await updateLocalSubscriptionStatus(customerInfo)

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

  // ============================================
  // Accès premium et limitations
  // ============================================

  const localStatus = ref<'free' | 'monthly' | 'monthly_trial' | 'lifetime'>('free')

  /**
   * Vérifie si l'utilisateur a accès au premium
   * Un utilisateur a accès au premium s'il est :
   * - En essai gratuit (monthly_trial)
   * - Abonné mensuel (monthly)
   * - Abonné à vie (lifetime)
   *
   * On vérifie d'abord le store RevenueCat, puis le profil local en fallback
   */
  const isPremium = computed(() => {
    // Si le store RevenueCat indique premium, c'est la source de vérité
    if (subscriptionStore.hasPremiumAccess) {
      return true
    }

    // Sinon, vérifier le statut local
    return localStatus.value !== 'free'
  })

  /**
   * Vérifie le statut d'abonnement depuis le profil local
   */
  async function checkLocalSubscriptionStatus(): Promise<'free' | 'monthly' | 'monthly_trial' | 'lifetime'> {
    try {
      const { getCurrentUserId } = useSupabaseAuth()
      const { loadUserProfile } = useUserProfile()
      const userId = await getCurrentUserId()
      const profile = await loadUserProfile(userId)

      const status = (profile?.subscription_status as 'free' | 'monthly' | 'monthly_trial' | 'lifetime') || 'free'
      localStatus.value = status
      return status
    } catch (error) {
      console.error('Error checking local subscription status:', error)
      localStatus.value = 'free'
      return 'free'
    }
  }

  /**
   * Vérifie si l'utilisateur est sur le plan gratuit
   */
  const isFree = computed(() => !isPremium.value)

  /**
   * Limites pour les utilisateurs gratuits
   */
  const FREE_LIMITS = {
    MAX_COLLECTIONS: 2,
    // Possibilité d'ajouter d'autres limites plus tard :
    // MAX_CARDS_PER_COLLECTION: 50,
  }

  // Charger le statut local au démarrage
  checkLocalSubscriptionStatus()

  return {
    // RevenueCat core
    initRevenueCat,
    getOfferings,
    purchasePackage,
    restorePurchases,
    checkSubscriptionStatus,
    setUserId,
    logoutUser,
    // Accès premium et limitations
    isPremium,
    isFree,
    FREE_LIMITS,
    checkLocalSubscriptionStatus,
  }
}
