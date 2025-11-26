<template>
  <div class="w-full max-w-md rounded-[15px] bg-white p-8 text-center shadow-[0px_4px_32px_#0000000a]">
    <div class="mb-2 text-2xl font-bold">
      {{ $t('review.sessionFinished') }}
    </div>
    <div class="mb-4 text-lg text-gray-700">{{ $t('review.congrats') }}</div>
    <div class="mb-2">
      {{ $t('review.cardsReviewed', { count: cardsReviewedCount }) }}
    </div>
    <div class="mb-2">
      {{ $t('review.successRate', { percent: successRate }) }}
    </div>
    <button
      class="mt-6 rounded-[15px] bg-[var(--color-primary)] px-6 py-2 text-base font-medium text-white shadow-sm transition hover:bg-[var(--color-dark-purple)]"
      @click="$emit('back')"
    >
      {{ returnLabel || $t('review.backToCollections') }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  cardsReviewedCount: { type: Number, required: true },
  successRate: { type: Number, required: true },
  returnLabel: { type: String, default: '' },
})
defineEmits(['back'])
</script>
