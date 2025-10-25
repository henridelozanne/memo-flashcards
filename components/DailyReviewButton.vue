<template>
  <div class="mb-6">
    <button
      class="flex w-full items-center justify-center gap-3 rounded-[15px] bg-[var(--color-primary)] px-6 py-4 text-lg font-semibold text-white shadow-[0px_4px_32px_#0000000a] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      data-testid="daily-review-btn"
      :disabled="dailyCardsCount === 0"
      @click="handleClick"
    >
      {{ $t('dailyReview.reviewToday', { count: dailyCardsCount }) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  dailyCardsCount: number
}>()

const router = useRouter()

function handleClick() {
  router.push('/daily-review')
}
</script>