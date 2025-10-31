<template>
  <div class="mb-6">
    <button
      class="flex w-full items-center justify-center gap-3 rounded-[15px] bg-[var(--color-primary)] px-4 py-3 text-lg font-semibold text-white shadow-[0px_4px_32px_#0000000a] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      data-testid="daily-review-btn"
      :disabled="remainingCardsCount === 0"
      @click="handleClick"
    >
      <span>{{ $t('dailyReview.reviewToday', { count: totalCardsDueToday }) }}</span>

      <!-- Barre de progression circulaire -->
      <div v-if="totalCardsDueToday > 0" class="relative flex h-20 w-20 items-center justify-center">
        <svg class="h-full w-full transform" viewBox="0 0 40 40">
          <!-- Cercle de fond -->
          <path
            d="M20 5
              a 15 15 0 1 1 0 30
              a 15 15 0 1 1 0 -30"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="3"
          />
          <!-- Cercle de progression -->
          <path
            v-if="progressPercentage > 0"
            d="M20 5
              a 15 15 0 1 1 0 30
              a 15 15 0 1 1 0 -30"
            fill="none"
            stroke="white"
            stroke-width="3"
            :stroke-dasharray="strokeDashArray"
            stroke-linecap="round"
          />
        </svg>
        <!-- Texte au centre -->
        <div class="absolute inset-2 flex items-center justify-center">
          <span class="text-[10px] font-bold">{{ dailyAnsweredCardsCount }}</span
          >/<span class="text-[10px] font-bold">{{ totalCardsDueToday }}</span>
        </div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useDailyReviewStore } from '~/store/dailyReview'

const router = useRouter()
const dailyReviewStore = useDailyReviewStore()

const dailyAnsweredCardsCount = computed(() => dailyReviewStore.answeredCardsCount)
const totalCardsDueToday = computed(() => dailyReviewStore.totalCardsDueCount)
const remainingCardsCount = computed(() => totalCardsDueToday.value - dailyAnsweredCardsCount.value)

// Calcul de la progression en pourcentage
const progressPercentage = computed(() => {
  if (totalCardsDueToday.value === 0) return 0
  return Math.round((dailyAnsweredCardsCount.value / totalCardsDueToday.value) * 100)
})

// Calcul du stroke-dasharray pour la progression
const strokeDashArray = computed(() => `${progressPercentage.value}, 100`)

function handleClick() {
  router.push('/daily-review')
}
</script>
