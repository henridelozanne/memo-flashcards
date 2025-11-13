<template>
  <NuxtLayout name="onboarding">
    <div class="flex h-full flex-col items-center justify-center px-6">
      <!-- Titre -->
      <h1 class="slide-up-1 mb-8 max-w-md text-center text-3xl font-bold leading-tight text-[var(--color-black)]">
        <span>{{ $t('onboarding.step10.title', { firstName: onboardingStore.firstName }).split(',')[0] }},</span>
        <br />
        <span>{{ $t('onboarding.step10.title', { firstName: onboardingStore.firstName }).split(',')[1] }}</span>
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

const router = useRouter()
const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.currentStep = 10

  // Rediriger vers le paywall au lieu de passer à l'étape suivante
  onboardingStore.registerStepValidation(() => {
    router.push('/paywall')
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
