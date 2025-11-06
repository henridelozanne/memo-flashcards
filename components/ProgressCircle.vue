<template>
  <div class="relative flex h-16 w-16 items-center justify-center">
    <svg class="h-full w-full transform" viewBox="0 0 40 40">
      <!-- Cercle de fond -->
      <path
        d="M20 5
          a 15 15 0 1 1 0 30
          a 15 15 0 1 1 0 -30"
        fill="none"
        :class="backgroundStrokeClass"
        stroke-width="3"
      />
      <!-- Cercle de progression -->
      <path
        d="M20 5
          a 15 15 0 1 1 0 30
          a 15 15 0 1 1 0 -30"
        fill="none"
        :class="progressStrokeClass"
        class="progress-stroke"
        stroke-width="3"
        :stroke-dasharray="strokeDashArray"
        :stroke-opacity="progressPercentage > 0 ? 1 : 0"
        stroke-linecap="round"
      />
    </svg>
    <!-- Texte au centre -->
    <div v-if="numbersVisible" class="absolute inset-1 flex items-center justify-center">
      <span class="text-[12px] font-bold">{{ currentValue }}</span
      >/<span class="text-[12px] font-bold">{{ totalValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDailyReviewStore } from '~/store/dailyReview'

const dailyReviewStore = useDailyReviewStore()

const props = defineProps({
  isFromPageHeader: {
    type: Boolean,
    default: false,
  },
  // Props optionnelles pour utiliser des valeurs custom au lieu du store
  current: {
    type: Number,
    default: undefined,
  },
  total: {
    type: Number,
    default: undefined,
  },
  // Masquer les chiffres (utile pour l'onboarding)
  numbersVisible: {
    type: Boolean,
    default: true,
  },
})

const backgroundStrokeClass = computed(() =>
  props.isFromPageHeader ? 'stroke-[var(--color-accent-purple)]' : 'stroke-white/30'
)

const progressStrokeClass = computed(() => (props.isFromPageHeader ? 'stroke-[var(--color-primary)]' : 'stroke-white'))

// Données depuis les props ou depuis le store
const currentValue = computed(() => props.current ?? dailyReviewStore.answeredCardsCount)
const totalValue = computed(() => props.total ?? dailyReviewStore.totalCardsDueCount)

// Calcul de la progression en pourcentage
const progressPercentage = computed(() => {
  if (totalValue.value === 0) return 0
  return Math.round((currentValue.value / totalValue.value) * 100)
})

// Calcul du stroke-dasharray pour la progression
const strokeDashArray = computed(() => `${progressPercentage.value}, 100`)
</script>

<style scoped>
.progress-stroke {
  transition:
    stroke-dasharray 0.6s ease-out,
    stroke-opacity 0.3s ease-out;
}
</style>
