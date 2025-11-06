<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 3 (temporaire pour test) -->
    <div class="flex h-full flex-col pt-12">
      <!-- Titre -->
      <h1 class="mb-12 text-center text-2xl font-bold text-[var(--color-black)]">
        Étape 3 - En cours de développement
      </h1>

      <p class="text-center text-gray-600">Bonjour {{ onboardingStore.firstName }} ! 👋</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

// Initialiser l'étape à 3
onMounted(() => {
  onboardingStore.currentStep = 3
})

defineOptions({ name: 'OnboardingStep3Page' })
</script>
