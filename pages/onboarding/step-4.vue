<!-- eslint-disable vue/no-v-html -->
<template>
  <NuxtLayout name="onboarding">
    <!-- Contenu de l'écran 5 - Courbe de l'oubli -->
    <div class="flex h-full flex-col items-center justify-center gap-8 pt-12">
      <!-- Titre avec sous-titre -->
      <div class="text-center">
        <h1 class="slide-up-1 text-2xl font-bold text-[var(--color-black)]">
          {{ $t('onboarding.step4.title') }}
        </h1>
        <p class="slide-up-2 mt-1 text-lg italic text-gray-500">
          {{ $t('onboarding.step4.subtitle') }}
        </p>
      </div>

      <!-- Image SVG de la courbe de l'oubli -->
      <div class="slide-up-3 relative mt-12 w-full max-w-md px-4">
        <img src="~/assets/svg/forgetting-curve.svg" alt="Forgetting curve" class="w-full" />

        <!-- Labels au-dessus des courbes -->
        <!-- Original learning (première courbe, à gauche) -->
        <div
          class="absolute -top-8 left-[8%] -rotate-[45deg] text-center text-[8px] font-medium leading-tight text-[var(--color-primary)]"
          v-html="$t('onboarding.step4.originalLearning')"
        ></div>

        <!-- First review (deuxième courbe) -->
        <div
          class="absolute -top-4 left-[25%] -rotate-[45deg] text-[8px] font-medium text-[var(--color-accent-purple)]"
        >
          {{ $t('onboarding.step4.firstReview') }}
        </div>

        <!-- Second review (troisième courbe) -->
        <div
          class="absolute -top-4 left-[40%] -rotate-[45deg] text-[8px] font-medium text-[var(--color-accent-purple)]"
        >
          {{ $t('onboarding.step4.secondReview') }}
        </div>

        <!-- Fourth review (quatrième courbe) -->
        <div
          class="absolute -top-4 left-[65%] -rotate-[45deg] text-[8px] font-medium text-[var(--color-accent-purple)]"
        >
          {{ $t('onboarding.step4.fourthReview') }}
        </div>

        <!-- Label "temps" sous l'axe X -->
        <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium italic text-gray-600">
          {{ $t('onboarding.step4.timeLabel') }}
        </div>
        <!-- Label "rétention" vertical à gauche de l'axe Y -->
        <div class="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium italic text-gray-600">
          {{ $t('onboarding.step4.retentionLabel') }}
        </div>
      </div>

      <!-- Texte explicatif avec mots en gras -->
      <div class="max-w-md space-y-3 px-6 text-justify text-base leading-relaxed text-gray-700">
        <p class="slide-up-4" v-html="formatText($t('onboarding.step4.explanation'))"></p>
        <p class="slide-up-5" v-html="formatText($t('onboarding.step4.forgettingCurve'))"></p>
        <p class="slide-up-6" v-html="formatText($t('onboarding.step4.solution'))"></p>
        <p class="slide-up-7" v-html="formatText($t('onboarding.step4.spacedRepetition'))"></p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'

const onboardingStore = useOnboardingStore()

// Fonction pour convertir les **texte** en <strong>texte</strong>
function formatText(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

// Initialiser l'étape à 5
onMounted(() => {
  onboardingStore.currentStep = 4
})

defineOptions({ name: 'OnboardingStep4Page' })
</script>
