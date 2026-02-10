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
    <div class="relative z-10 flex-1 overflow-y-auto px-6 pb-32 pt-16">
      <!-- Titre -->
      <h1 class="mb-12 text-center text-3xl font-bold text-[var(--color-black)]">
        {{ $t('onboarding.paywall.title') }}
      </h1>

      <!-- Liste des avantages -->
      <ul class="mb-12 space-y-3 text-left">
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
      <div class="mb-8 grid grid-cols-2 gap-3">
        <!-- Mensuel -->
        <div class="subscription-card" :class="{ selected: selectedPlan === 'monthly' }">
          <div class="mb-2 text-2xl">💎</div>
          <div class="mb-3 text-lg font-bold text-[var(--color-black)]">
            {{ $t('onboarding.paywall.monthly.title') }}
          </div>
          <div class="mb-2 text-base font-semibold text-[var(--color-black)]">
            {{ monthlyPrice || $t('onboarding.paywall.monthly.price') }}
          </div>
          <div class="mb-2 text-sm text-gray-600">{{ $t('onboarding.paywall.monthly.subtitle') }}</div>
          <div class="mb-4 text-sm text-gray-600">{{ $t('onboarding.paywall.monthly.renewal') }}</div>
          <button class="subscribe-button mt-auto" :disabled="isPurchasing" @click="selectPlan('monthly')">
            {{ isPurchasing ? `⏳ ${$t('onboarding.paywall.purchasing')}` : $t('onboarding.paywall.chooseOffer') }}
          </button>
        </div>

        <!-- À vie -->
        <div class="subscription-card" :class="{ selected: selectedPlan === 'lifetime' }">
          <div class="mb-2 text-2xl">⭐</div>
          <div class="mb-3 text-lg font-bold text-[var(--color-black)]">
            {{ $t('onboarding.paywall.lifetime.title') }}
          </div>
          <div class="mb-2 text-base font-semibold text-[var(--color-black)]">
            {{ lifetimePrice || $t('onboarding.paywall.lifetime.price') }}
          </div>
          <div class="mb-2 text-sm text-gray-600">{{ $t('onboarding.paywall.lifetime.subtitle') }}</div>
          <div class="mb-4 text-sm text-gray-600">{{ $t('onboarding.paywall.lifetime.renewal') }}</div>
          <button class="subscribe-button mt-auto" :disabled="isPurchasing" @click="selectPlan('lifetime')">
            {{ isPurchasing ? `⏳ ${$t('onboarding.paywall.purchasing')}` : $t('onboarding.paywall.chooseOffer') }}
          </button>
        </div>
      </div>
    </div>

    <!-- CTA fixé en bas -->
    <!-- <div class="fixed bottom-0 left-0 right-0 z-10 bg-white px-6 pb-8 pt-6 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      <button class="trial-button w-full" @click="startFreeTrial">
        {{ $t('onboarding.paywall.freeTrial') }}
      </button>
      <p class="mt-3 text-center text-sm text-gray-500">
        {{ $t('onboarding.paywall.disclaimer') }}
      </p>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '~/store/onboarding'
import { useUserProfileStore } from '~/store/userProfile'
import useSupabaseAuth from '~/composables/useSupabaseAuth'
import { useUserProfile } from '~/composables/useUserProfile'
import { syncUserProfileToRemote } from '~/lib/sync'
import { useSubscription } from '~/composables/useSubscription'

const router = useRouter()
const onboardingStore = useOnboardingStore()
const userProfileStore = useUserProfileStore()
const selectedPlan = ref<'monthly' | 'lifetime' | null>(null)
const { initAuth, getCurrentUserId } = useSupabaseAuth()
const { saveUserProfile: saveUserProfileLocal } = useUserProfile()
const { getOfferings, purchasePackage } = useSubscription()
const monthlyPrice = ref('')
const monthlyPackageRef = ref<PurchasesPackage | null>(null)
const lifetimePrice = ref('')
const lifetimePackageRef = ref<PurchasesPackage | null>(null)
const isPurchasing = ref(false)

onMounted(async () => {
  try {
    const offerings = await getOfferings()
    const monthlyPackage = offerings?.current?.availablePackages?.find((pkg: PurchasesPackage) =>
      pkg.identifier?.includes('monthly')
    )
    if (monthlyPackage) {
      monthlyPrice.value = monthlyPackage.product.priceString
      monthlyPackageRef.value = monthlyPackage
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

async function completeOnboarding() {
  try {
    // 1. Authentification silencieuse via Supabase
    await initAuth()
    const userId = await getCurrentUserId()

    // 2. Sauvegarder les données d'onboarding dans SQLite local
    await saveUserProfileLocal({
      userId,
      firstName: userProfileStore.firstName,
      goal: userProfileStore.goal,
      situation: userProfileStore.situation,
      notificationHour: userProfileStore.notificationHour,
      language: userProfileStore.language,
      onboardingCompletedAt: Date.now(),
    })

    // 3. Marquer l'onboarding comme terminé
    onboardingStore.completeOnboarding()

    // 4. Sync vers Supabase (non-bloquant)
    syncUserProfileToRemote().catch(() => {
      // Sync error handled silently
    })

    // 5. Rediriger vers l'écran principal
    router.push('/')
  } catch (e) {
    // Continuer malgré l'erreur pour ne pas bloquer l'utilisateur
    onboardingStore.completeOnboarding()
    router.push('/')
  }
}

async function selectPlan(plan: 'monthly' | 'lifetime') {
  const packageToPurchase = plan === 'monthly' ? monthlyPackageRef.value : lifetimePackageRef.value

  if (!packageToPurchase) {
    selectedPlan.value = plan
    return
  }

  selectedPlan.value = plan
  isPurchasing.value = true

  try {
    // Timeout de 30 secondes pour détecter si ça bloque
    const purchasePromise = purchasePackage(packageToPurchase)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Purchase timeout after 30s')), 30000)
    )

    const result = await Promise.race([purchasePromise, timeoutPromise])

    if (result) {
      await completeOnboarding()
    } else {
      isPurchasing.value = false
    }
  } catch (e: any) {
    console.error('❌ Purchase error:', e)

    isPurchasing.value = false
  }
}

// function startFreeTrial() {
//   completeOnboarding()
// }

function skipPaywall() {
  // L'utilisateur ferme le paywall sans souscrire
  completeOnboarding()
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
  color: #374151;
  transition: color 0.2s;
}

.close-button:hover {
  color: #111827;
}

.subscription-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: white;
  text-align: center;
  transition: all 0.3s ease-in-out;
}

.subscription-card.selected {
  border-color: var(--color-primary);
  background: #f5f3ff;
}

.subscribe-button {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  background: white;
  transition: all 0.2s;
}

.subscribe-button:hover {
  background: #f9fafb;
}

.subscription-card.selected .subscribe-button {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: white;
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
