<template>
  <div class="paywall-container flex min-h-screen flex-col">
    <!-- Bouton fermer en haut à droite -->
    <button class="close-button relative z-10" @click="skipPaywall">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <!-- Contenu scrollable -->
    <div
      class="relative z-10 flex-1 overflow-y-auto px-6 pt-14"
      style="padding-bottom: calc(13rem + env(safe-area-inset-bottom))"
    >
      <!-- Titre -->
      <h1 class="mb-6 text-center text-3xl font-bold text-[var(--color-black)]">
        {{ $t('onboarding.paywall.title') }}
      </h1>

      <!-- Liste des avantages -->
      <ul class="mb-8 space-y-2 text-left">
        <li class="flex items-start gap-3">
          <span class="mt-1 text-lg">•</span>
          <span class="text-base text-gray-700">{{ $t('onboarding.paywall.benefit1') }}</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-1 text-lg">•</span>
          <span class="text-base text-gray-700">{{ $t('onboarding.paywall.benefit2') }}</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-1 text-lg">•</span>
          <span class="text-base text-gray-700">{{ $t('onboarding.paywall.benefit3') }}</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-1 text-lg">•</span>
          <span class="text-base text-gray-700">{{ $t('onboarding.paywall.benefit4') }}</span>
        </li>
      </ul>

      <!-- Options d'abonnement -->
      <div class="mb-8 flex flex-col gap-3">
        <!-- Mensuel -->
        <button
          class="subscription-card relative"
          :class="{ selected: selectedPlan === 'monthly' }"
          @click="selectPlan('monthly')"
        >
          <span class="popular-badge">{{ $t('onboarding.paywall.mostPopular') }}</span>
          <div class="flex w-full items-center justify-between">
            <div class="text-left">
              <div class="text-lg font-bold text-[var(--color-black)]">
                {{ $t('onboarding.paywall.monthly.title') }}
              </div>
              <div class="text-sm text-gray-500">{{ $t('onboarding.paywall.monthly.renewal') }}</div>
            </div>
            <div class="text-xl font-bold text-[var(--color-black)]">
              {{ monthlyPrice || $t('onboarding.paywall.monthly.price') }}
            </div>
          </div>
        </button>

        <!-- À vie -->
        <button
          class="subscription-card"
          :class="{ selected: selectedPlan === 'lifetime' }"
          @click="selectPlan('lifetime')"
        >
          <div class="flex w-full items-center justify-between">
            <div class="text-left">
              <div class="text-lg font-bold text-[var(--color-black)]">
                {{ $t('onboarding.paywall.lifetime.title') }}
              </div>
              <div class="text-sm text-gray-500">{{ $t('onboarding.paywall.lifetime.renewal') }}</div>
            </div>
            <div class="text-xl font-bold text-[var(--color-black)]">
              {{ lifetimePrice || $t('onboarding.paywall.lifetime.price') }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- CTA fixé en bas -->
    <div
      class="fixed bottom-0 left-0 right-0 z-10 bg-white px-6 pt-6 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]"
      style="padding-bottom: calc(0.3rem + env(safe-area-inset-bottom))"
    >
      <button class="trial-button w-full" @click="selectPlan('monthly_free_trial')">
        {{ $t('onboarding.paywall.freeTrial') }}
      </button>
      <p v-if="monthlyPrice" class="mt-2 text-center text-xs text-gray-500">
        {{ $t('onboarding.paywall.freeTrialThen', { price: monthlyPrice }) }}
      </p>
      <p class="mt-3 text-center text-xs text-gray-500">
        {{ $t('onboarding.paywall.disclaimer') }}
      </p>
      <p class="mt-2 text-center text-xs text-gray-400">
        <NuxtLink to="/legal" class="underline">{{ $t('onboarding.paywall.privacyPolicy') }}</NuxtLink>
        <span class="mx-1">·</span>
        <button
          class="underline"
          @click="openLink('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')"
        >
          {{ $t('onboarding.paywall.termsOfUse') }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '~/store/onboarding'
import { useUserProfileStore } from '~/store/userProfile'
import useSupabaseAuth from '~/composables/useSupabaseAuth'
import { useUserProfile } from '~/composables/useUserProfile'
import { syncUserProfileToRemote } from '~/lib/sync'
import { useSubscription } from '~/composables/useSubscription'
import { useExternalLink } from '~/composables/useExternalLink'

const router = useRouter()
const onboardingStore = useOnboardingStore()
const userProfileStore = useUserProfileStore()
const selectedPlan = ref<'monthly' | 'monthly_free_trial' | 'lifetime' | null>(null)
const { initAuth, getCurrentUserId } = useSupabaseAuth()
const { saveUserProfile: saveUserProfileLocal } = useUserProfile()
const { getOfferings, purchasePackage } = useSubscription()
const { openLink } = useExternalLink()
const monthlyPrice = ref('')
const monthlyPackageRef = ref<PurchasesPackage | null>(null)
const monthlyTrialPackageRef = ref<PurchasesPackage | null>(null)
const lifetimePrice = ref('')
const lifetimePackageRef = ref<PurchasesPackage | null>(null)
const MONTHLY_PRODUCT_ID = 'memo_pro_monthly'
const MONTHLY_FREE_TRIAL_PRODUCT_ID = 'memo_pro_monthly_free_trial'
const LIFETIME_PRODUCT_ID = 'memo_pro_lifetime'

onMounted(async () => {
  try {
    const offerings = await getOfferings()
    const monthlyPackage = offerings?.current?.availablePackages?.find(
      (pkg: PurchasesPackage) => pkg.product.identifier === MONTHLY_PRODUCT_ID
    )
    if (monthlyPackage) {
      monthlyPrice.value = monthlyPackage.product.priceString
      monthlyPackageRef.value = monthlyPackage
    }

    const monthlyTrialPackage = offerings?.current?.availablePackages?.find(
      (pkg: PurchasesPackage) => pkg.product.identifier === MONTHLY_FREE_TRIAL_PRODUCT_ID
    )
    if (monthlyTrialPackage) {
      monthlyTrialPackageRef.value = monthlyTrialPackage
    }

    const lifetimePackage = offerings?.current?.availablePackages?.find((pkg: PurchasesPackage) =>
      pkg.identifier?.includes('lifetime')
    )
    if (lifetimePackage) {
      lifetimePrice.value = lifetimePackage.product.priceString
      lifetimePackageRef.value = lifetimePackage
    }
  } catch (e) {
    console.error('Error loading offerings:', e)
  }
})

function getSubscriptionSnapshot(plan: 'monthly' | 'monthly_free_trial' | 'lifetime', customerInfo?: CustomerInfo) {
  const entitlements = customerInfo ? Object.values(customerInfo.entitlements.active) : []
  const entitlement = entitlements[0]
  const productId = entitlement?.productIdentifier || null
  const expiresAt = entitlement?.expirationDate ? new Date(entitlement.expirationDate).getTime() : null

  if (productId === LIFETIME_PRODUCT_ID || plan === 'lifetime') {
    return { status: 'lifetime' as const, productId: LIFETIME_PRODUCT_ID, expiresAt: null }
  }

  if (entitlement?.periodType === 'TRIAL' || plan === 'monthly_free_trial') {
    return { status: 'monthly_trial' as const, productId: MONTHLY_FREE_TRIAL_PRODUCT_ID, expiresAt }
  }

  return { status: 'monthly' as const, productId: MONTHLY_PRODUCT_ID, expiresAt }
}

async function completeOnboarding(subscriptionSnapshot?: {
  status: 'free' | 'monthly' | 'monthly_trial' | 'lifetime'
  productId?: string | null
  expiresAt?: number | null
}) {
  try {
    // 1. Authentification silencieuse via Supabase
    await initAuth()
    const userId = await getCurrentUserId()

    // 2. Sauvegarder les données d'onboarding dans SQLite local
    await saveUserProfileLocal({
      userId,
      firstName: userProfileStore.firstName,
      goal: JSON.stringify(userProfileStore.goal),
      situation: userProfileStore.situation,
      notificationHour: userProfileStore.notificationHour,
      language: userProfileStore.language,
      onboardingCompletedAt: Date.now(),
      subscriptionStatus: subscriptionSnapshot?.status || 'free',
      subscriptionProductId: subscriptionSnapshot?.productId || null,
      subscriptionExpiresAt: subscriptionSnapshot?.expiresAt || null,
      subscriptionUpdatedAt: Date.now(),
    })

    // 3. Marquer l'onboarding comme terminé
    onboardingStore.completeOnboarding()

    // Track event
    const { usePosthog } = await import('~/composables/usePosthog')
    const posthog = usePosthog()
    posthog.capture('onboarding_completed', {
      subscription_status: subscriptionSnapshot?.status || 'free',
      subscription_product_id: subscriptionSnapshot?.productId || null,
      first_name: userProfileStore.firstName,
      goal: userProfileStore.goal.join(','),
      situation: userProfileStore.situation,
      language: userProfileStore.language,
      notification_hour: userProfileStore.notificationHour,
    })

    // 4. Sync vers Supabase (non-bloquant)
    syncUserProfileToRemote().catch(() => {
      // Sync error handled silently
    })

    // 5. Rediriger vers l'écran principal
    router.push('/')
  } catch (e) {
    console.error('❌ completeOnboarding error:', e)
    // Continuer malgré l'erreur pour ne pas bloquer l'utilisateur
    onboardingStore.completeOnboarding()
    router.push('/')
  }
}

async function selectPlan(plan: 'monthly' | 'monthly_free_trial' | 'lifetime') {
  const packageToPurchase =
    {
      monthly: monthlyPackageRef.value,
      monthly_free_trial: monthlyTrialPackageRef.value,
      lifetime: lifetimePackageRef.value,
    }[plan] || null

  if (!packageToPurchase) {
    selectedPlan.value = plan
    return
  }

  selectedPlan.value = plan

  try {
    // Timeout de 30 secondes pour détecter si ça bloque
    const purchasePromise = purchasePackage(packageToPurchase)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Purchase timeout after 30s')), 30000)
    )

    const result = (await Promise.race([purchasePromise, timeoutPromise])) as CustomerInfo | null

    if (result) {
      const snapshot = getSubscriptionSnapshot(plan, result)
      await completeOnboarding({
        status: snapshot.status,
        productId: snapshot.productId,
        expiresAt: snapshot.expiresAt,
      })
    }
  } catch (e: unknown) {
    console.error('❌ Purchase error:', e)
  }
}

async function skipPaywall() {
  try {
    // L'utilisateur ferme le paywall sans souscrire
    await completeOnboarding({ status: 'free', productId: null, expiresAt: null })
  } catch (error) {
    console.error('❌ skipPaywall error:', error)
  }
}

defineOptions({ name: 'OnboardingPaywallPage' })
</script>

<style scoped>
.paywall-container {
  position: relative;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px;
  color: #d1d5db;
  transition: color 0.2s;
  z-index: 20;
}

.subscription-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 20px;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: white;
  text-align: center;
  transition: all 0.3s ease-in-out;
  width: 100%;
  cursor: pointer;
}

.subscription-card.selected {
  border-color: var(--color-primary);
  background: #f5f3ff;
}

.popular-badge {
  position: absolute;
  top: -10px;
  right: -8px;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--color-accent-blue);
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.trial-button {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: var(--color-primary);
  transition: opacity 0.2s;
}

.trial-button:hover {
  opacity: 0.9;
}
</style>
