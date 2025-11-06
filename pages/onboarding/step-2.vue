<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 2 -->
    <div class="flex h-full flex-col pt-12">
      <!-- Titre -->
      <h1 class="mb-12 text-center text-2xl font-bold text-[var(--color-black)]">
        {{ $t('onboarding.step2.title') }}
      </h1>

      <!-- Champ de saisie -->
      <div class="flex flex-col gap-3">
        <input
          v-model="firstName"
          type="text"
          :placeholder="$t('onboarding.step2.placeholder')"
          class="w-full rounded-[15px] border-2 px-6 py-4 text-lg transition focus:outline-none"
          :class="hasError ? 'border-[var(--color-accent-red)]' : 'border-gray-200 focus:border-[var(--color-primary)]'"
          @input="hasError = false"
          @keyup.enter="handleEnter"
        />

        <!-- Message d'erreur -->
        <transition name="error-fade">
          <p v-if="hasError" class="text-sm text-[var(--color-accent-red)]">
            {{ $t('onboarding.step2.error') }}
          </p>
        </transition>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

// État local
const firstName = ref(onboardingStore.firstName || '')
const hasError = ref(false)

// Fonction de validation
function validate(): boolean {
  const trimmedName = firstName.value.trim()

  if (!trimmedName) {
    hasError.value = true
    return false
  }

  // Sauvegarder dans le store
  onboardingStore.firstName = trimmedName
  hasError.value = false
  return true
}

// Gestion de la touche Enter
function handleEnter() {
  if (validate()) {
    onboardingStore.nextStep()
  }
}

// Enregistrer la validation au montage
onMounted(() => {
  // Initialiser l'étape à 2 en premier
  onboardingStore.currentStep = 2

  // Enregistrer la validation dans le store
  onboardingStore.registerStepValidation(validate)
})

defineOptions({ name: 'OnboardingStep2Page' })
</script>

<style scoped>
.error-fade-enter-active,
.error-fade-leave-active {
  transition: opacity 0.2s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
}
</style>
