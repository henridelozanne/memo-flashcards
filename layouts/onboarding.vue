<template>
  <div class="onboarding-layout fixed inset-0 flex flex-col bg-gray-50" style="padding-top: env(safe-area-inset-top)">
    <!-- Header fixe (masqué sur l'écran 1) - Seulement ProgressCircle -->
    <div v-if="showHeader" class="flex-shrink-0 px-6 pb-2 pt-6">
      <div class="flex justify-end">
        <ProgressCircle
          :current="completedSteps"
          :total="onboardingStore.totalSteps"
          is-from-page-header
          :numbers-visible="false"
        />
      </div>
    </div>

    <!-- Contenu de l'onboarding -->
    <div class="flex flex-1 flex-col overflow-auto p-6">
      <div class="flex h-full w-full max-w-lg flex-col">
        <transition name="fade" mode="out-in">
          <slot />
        </transition>
      </div>
    </div>

    <!-- Bouton fixe en bas -->
    <div class="flex-shrink-0 p-6" style="padding-bottom: calc(env(safe-area-inset-bottom) + 1.5rem)">
      <div class="mx-auto w-full max-w-lg">
        <button
          class="w-full rounded-[15px] bg-[var(--color-primary)] px-8 py-4 text-lg font-semibold text-white shadow-[0px_4px_32px_#0000000a] transition hover:opacity-90"
          @click="handleNext"
        >
          <slot name="button-label">{{ $t('onboarding.continue') }}</slot>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '~/store/onboarding'
import ProgressCircle from '~/components/ProgressCircle.vue'

const router = useRouter()
const onboardingStore = useOnboardingStore()

// Nombre d'étapes complétées (étape actuelle - 1)
const completedSteps = computed(() => Math.max(0, onboardingStore.currentStep - 1))

// Afficher le header seulement à partir de l'étape 2
const showHeader = computed(() => onboardingStore.currentStep > 1)

function handleNext() {
  // Valider avant de passer à l'étape suivante
  const isValid = onboardingStore.validateCurrentStep()

  if (!isValid) {
    return // Ne pas continuer si la validation échoue
  }

  onboardingStore.nextStep()
}

// Navigation automatique basée sur currentStep
watch(
  () => onboardingStore.currentStep,
  (newStep) => {
    const stepRoutes: Record<number, string> = {
      1: '/onboarding/step-1',
      2: '/onboarding/step-2',
      3: '/onboarding/step-3',
      4: '/onboarding/step-4',
      5: '/onboarding/step-5',
      6: '/onboarding/step-6',
      7: '/onboarding/step-7',
      8: '/onboarding/step-8',
      9: '/onboarding/step-9',
      10: '/onboarding/step-10',
      11: '/onboarding/step-11',
    }

    const targetRoute = stepRoutes[newStep]
    if (targetRoute && router.currentRoute.value.path !== targetRoute) {
      router.push(targetRoute)
    }
  }
)

// Réinitialiser la validation quand la route change
watch(
  () => router.currentRoute.value.path,
  () => {
    onboardingStore.currentStepValidation = null
  }
)

defineOptions({ name: 'OnboardingLayout' })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
