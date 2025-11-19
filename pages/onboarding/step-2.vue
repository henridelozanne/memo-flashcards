<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 3 -->
    <div class="flex h-full flex-col pt-4">
      <!-- Titre avec prénom et retour à la ligne -->
      <h1 class="slide-up-1 mb-8 text-center text-2xl font-bold text-[var(--color-black)]">
        {{ $t('onboarding.step2.title', { name: userProfileStore.firstName }) }}<br />
        {{ $t('onboarding.step2.subtitle') }}
      </h1>

      <!-- Liste d'options -->
      <div class="flex flex-col gap-3">
        <button
          v-for="(goalOption, index) in goalOptions"
          :key="goalOption.value"
          :class="[
            'w-full rounded-[15px] border-2 px-6 py-4 text-left text-base transition',
            selectedGoal === goalOption.value
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] font-semibold text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            `slide-up-${index + 2}`,
          ]"
          @click="selectGoal(goalOption.value)"
        >
          {{ goalOption.label }}
        </button>
      </div>
    </div>

    <!-- Slot pour personnaliser le bouton -->
    <template #button-label>
      <span :class="{ 'opacity-50': !selectedGoal }">
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
const selectedGoal = ref<string>(userProfileStore.goal || '')

// Liste des options d'objectifs
const goalOptions = computed(() => [
  { value: 'learnLanguage', label: t('onboarding.step2.goals.learnLanguage') },
  { value: 'reviseClasses', label: t('onboarding.step2.goals.reviseClasses') },
  { value: 'memorizeFactsScience', label: t('onboarding.step2.goals.memorizeFactsScience') },
  { value: 'learnVocabulary', label: t('onboarding.step2.goals.learnVocabulary') },
  { value: 'developCulture', label: t('onboarding.step2.goals.developCulture') },
  { value: 'other', label: t('onboarding.step2.goals.other') },
])

// Sélectionner un objectif
function selectGoal(goal: string) {
  selectedGoal.value = goal
}

// Fonction de validation
function validate(): boolean {
  if (!selectedGoal.value) {
    return false // Bloquer si aucune sélection
  }

  // Sauvegarder dans le store
  userProfileStore.goal = selectedGoal.value
  return true
}

// Enregistrer la validation au montage
onMounted(() => {
  onboardingStore.currentStep = 2
  onboardingStore.registerStepValidation(validate)
})

defineOptions({ name: 'OnboardingStep2Page' })
</script>
