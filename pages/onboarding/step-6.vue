<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 6 (temporaire pour test) -->
    <div class="flex h-full flex-col items-center justify-center pt-12">
      <!-- Titre -->
      <h1 class="mb-8 text-center text-2xl font-bold text-[var(--color-black)]">Étape 6 - En cours de développement</h1>

      <div class="space-y-2 text-center text-gray-600">
        <p>📚 Suite de l'onboarding...</p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

// Initialiser l'étape à 6
onMounted(() => {
  onboardingStore.currentStep = 6
})

defineOptions({ name: 'OnboardingStep6Page' })
</script>
