
<template>
  <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
    <div class="text-2xl font-bold mb-2">{{ $t('review.sessionFinished') }}</div>
    <div class="text-lg text-gray-700 mb-4">{{ $t('review.congrats') }}</div>
    <div class="mb-2">{{ $t('review.cardsReviewed', { count: cardsReviewedCount }) }}</div>
    <div class="mb-2">{{ $t('review.successRate', { percent: successRate }) }}</div>
    <button class="mt-6 px-6 py-2 rounded bg-gray-100 text-gray-700 text-base font-medium shadow-sm" @click="$emit('back')">
      {{ $t('review.backToCollections') }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  cardsReviewedCount: { type: Number, required: true },
  successRate: { type: Number, required: true }
})
defineEmits(['back'])
</script>
