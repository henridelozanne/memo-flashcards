<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 1 -->
    <div class="flex h-full flex-col justify-between py-8">
      <!-- Logo et nom de l'app -->
      <div class="flex flex-col items-center gap-6 pt-12">
        <div class="text-8xl">🧠</div>
        <h1 class="text-center text-3xl font-bold text-[var(--color-black)]">{{ $t('onboarding.appName') }}</h1>
      </div>

      <!-- Phrase d'accroche -->
      <div class="flex flex-col items-center gap-2 text-center">
        <p class="text-xl font-semibold text-[var(--color-black)]">{{ $t('onboarding.step1.tagline1') }}</p>
        <p class="text-xl font-semibold text-[var(--color-secondary)]">{{ $t('onboarding.step1.tagline2') }}</p>
      </div>

      <!-- Espace pour pousser le bouton vers le bas (géré par le layout) -->
      <div></div>
    </div>

    <!-- Personnalisation du texte du bouton -->
    <template #button-label>{{ $t('onboarding.start') }}</template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

// Initialiser l'étape à 1 au montage
onboardingStore.currentStep = 1

defineOptions({ name: 'OnboardingIndexPage' })
</script>
