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
      <ProgressCircle v-if="totalCardsDueToday > 0" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useDailyReviewStore } from '~/store/dailyReview'
import ProgressCircle from '~/components/ProgressCircle.vue'

const router = useRouter()
const dailyReviewStore = useDailyReviewStore()

const dailyAnsweredCardsCount = computed(() => dailyReviewStore.answeredCardsCount)
const totalCardsDueToday = computed(() => dailyReviewStore.totalCardsDueCount)
const remainingCardsCount = computed(() => totalCardsDueToday.value - dailyAnsweredCardsCount.value)

function handleClick() {
  router.push('/daily-review')
}
</script>
