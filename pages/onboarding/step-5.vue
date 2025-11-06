<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 5 (temporaire pour test) -->
    <div class="flex h-full flex-col items-center justify-center pt-12">
      <!-- Titre -->
      <h1 class="mb-8 text-center text-2xl font-bold text-[var(--color-black)]">Étape 5 - En cours de développement</h1>

      <div class="space-y-2 text-center text-gray-600">
        <p>👋 Bonjour {{ onboardingStore.firstName }} !</p>
        <p>
          🎯 Ton objectif : <strong>{{ onboardingStore.goal }}</strong>
        </p>
        <p>
          📚 Ta situation : <strong>{{ onboardingStore.situation }}</strong>
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

// Initialiser l'étape à 5
onMounted(() => {
  onboardingStore.currentStep = 5
})

defineOptions({ name: 'OnboardingStep5Page' })
</script>
