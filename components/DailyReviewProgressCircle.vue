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
    <div class="absolute inset-1 flex items-center justify-center">
      <span class="text-[12px] font-bold">{{ current }}</span
      >/<span class="text-[12px] font-bold">{{ total }}</span>
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
})

const backgroundStrokeClass = computed(() =>
  props.isFromPageHeader ? 'stroke-[var(--color-accent-purple)]' : 'stroke-white/30'
)

const progressStrokeClass = computed(() => (props.isFromPageHeader ? 'stroke-[var(--color-primary)]' : 'stroke-white'))

// Données depuis le store
const current = computed(() => dailyReviewStore.answeredCardsCount)
const total = computed(() => dailyReviewStore.totalCardsDueCount)

// Calcul de la progression en pourcentage
const progressPercentage = computed(() => {
  if (total.value === 0) return 0
  return Math.round((current.value / total.value) * 100)
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
