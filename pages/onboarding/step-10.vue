<template>
  <NuxtLayout name="onboarding">
    <div class="flex h-full flex-col items-center justify-center px-6">
      <!-- Titre -->
      <h1 class="slide-up-1 mb-8 max-w-md text-center text-3xl font-bold leading-tight text-[var(--color-black)]">
        <span>{{ $t('onboarding.step10.title', { firstName: userProfileStore.firstName }).split(',')[0] }},</span>
        <br />
        <span>{{ $t('onboarding.step10.title', { firstName: userProfileStore.firstName }).split(',')[1] }}</span>
      </h1>

      <!-- Message -->
      <p class="slide-up-2 mb-16 max-w-md text-center text-lg text-gray-600">
        {{ $t('onboarding.step10.subtitle') }}
      </p>

      <!-- Icône de succès -->
      <div class="slide-up-3 success-icon mb-16">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#10b981" />
          <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <template #button-label>
      {{ $t('onboarding.letsGo') }}
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '~/store/onboarding'
import { useUserProfileStore } from '~/store/userProfile'
import { useNotifications } from '~/composables/useNotifications'
import useSupabaseAuth from '~/composables/useSupabaseAuth'
import { useUserProfile } from '~/composables/useUserProfile'
import { syncUserProfileToRemote } from '~/lib/sync'

const router = useRouter()
const onboardingStore = useOnboardingStore()
const userProfileStore = useUserProfileStore()
const { scheduleDailyNotification } = useNotifications()
const { initAuth, getCurrentUserId } = useSupabaseAuth()
const { saveUserProfile: saveUserProfileLocal } = useUserProfile()

onMounted(() => {
  onboardingStore.currentStep = 10

  // Terminer l'onboarding et rediriger vers la page d'accueil
  onboardingStore.registerStepValidation(async () => {
    try {
      // TODO: Supprimer cette logique quand le paywall sera rétabli
      // Cette logique était dans paywall.vue mais le paywall est bypassé pour l'instant

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

      // 3. Sync vers Supabase (non-bloquant)
      syncUserProfileToRemote().catch(() => {
        // Sync error handled silently
      })
    } catch (e) {
      console.error('[ONBOARDING] Error during auth/profile save:', e)
      // Continuer malgré l'erreur pour ne pas bloquer l'utilisateur
    }

    // Planifier la notification quotidienne
    await scheduleDailyNotification()

    // Marquer l'onboarding comme terminé
    onboardingStore.completeOnboarding()

    // Rediriger vers la page d'accueil
    router.push('/')
    return false // Empêcher la navigation automatique
  })
})

defineOptions({ name: 'OnboardingStep10Page' })
</script>

<style scoped>
.success-icon {
  animation: successPop 0.5s ease-out 0.9s forwards;
}

@keyframes successPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
