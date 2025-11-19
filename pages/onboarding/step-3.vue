<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 4 -->
    <div class="flex h-full flex-col pt-4">
      <!-- Titre -->
      <h1 class="slide-up-1 mb-8 text-center text-2xl font-bold text-[var(--color-black)]">
        {{ $t('onboarding.step3.title') }}
      </h1>

      <!-- Liste d'options -->
      <div class="flex flex-col gap-3">
        <button
          v-for="(situationOption, index) in situationOptions"
          :key="situationOption.value"
          :class="[
            'w-full rounded-[15px] border-2 px-6 py-4 text-left text-base transition',
            selectedSituation === situationOption.value
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] font-semibold text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            `slide-up-${index + 2}`,
          ]"
          @click="selectSituation(situationOption.value)"
        >
          {{ situationOption.label }}
        </button>
      </div>
    </div>

    <!-- Slot pour personnaliser le bouton -->
    <template #button-label>
      <span :class="{ 'opacity-50': !selectedSituation }">
        {{ $t('onboarding.continue') }}
      </span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOnboardingStore } from '~/store/onboarding'
import { useUserProfileStore } from '~/store/userProfile'

const onboardingStore = useOnboardingStore()
const userProfileStore = useUserProfileStore()
const { t } = useI18n()

// État local
const selectedSituation = ref<string>(userProfileStore.situation || '')

// Liste des options de situations
const situationOptions = computed(() => [
  { value: 'student', label: t('onboarding.step3.situations.student') },
  { value: 'highSchool', label: t('onboarding.step3.situations.highSchool') },
  { value: 'employed', label: t('onboarding.step3.situations.employed') },
  { value: 'retraining', label: t('onboarding.step3.situations.retraining') },
  { value: 'selfLearner', label: t('onboarding.step3.situations.selfLearner') },
  { value: 'jobSeeking', label: t('onboarding.step3.situations.jobSeeking') },
  { value: 'other', label: t('onboarding.step3.situations.other') },
])

// Sélectionner une situation
function selectSituation(situation: string) {
  selectedSituation.value = situation
}

// Fonction de validation
function validate(): boolean {
  if (!selectedSituation.value) {
    return false // Bloquer si aucune sélection
  }

  // Sauvegarder dans le store
  userProfileStore.situation = selectedSituation.value
  return true
}

// Enregistrer la validation au montage
onMounted(() => {
  onboardingStore.currentStep = 3
  onboardingStore.registerStepValidation(validate)
})

defineOptions({ name: 'OnboardingStep3Page' })
</script>
