<template>
  <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
    <div class="text-2xl font-bold mb-2">{{ $t('dailyReview.sessionFinished') }}</div>
    <div class="text-lg text-gray-700 mb-4">{{ getEncouragementMessage() }}</div>
    
    <!-- Statistiques -->
    <div class="space-y-2 mb-6">
      <div class="text-sm text-gray-600">{{ $t('dailyReview.cardsReviewed', { count: cardsReviewed }) }}</div>
      <div class="text-sm text-gray-600">{{ $t('dailyReview.successRate', { percent: successRate }) }}</div>
    </div>
    
    <button class="mt-6 px-6 py-2 rounded bg-gray-100 text-gray-700 text-base font-medium shadow-sm" @click="$emit('back')">
      {{ $t('dailyReview.backToCollections') }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  cardsReviewed: { type: Number, required: true },
  successRate: { type: Number, required: true }
})
defineEmits(['back'])

// Messages d'encouragement basés sur le taux de réussite
function getEncouragementMessage() {
  return 'Félicitations pour cette session !'
}
</script>