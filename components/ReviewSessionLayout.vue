<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <button class="text-gray-500 hover:text-gray-700" :aria-label="$t('common.backButton')" @click="goBack">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="text-xs text-gray-400 font-medium">{{ headerTitle }}</div>
      <div class="text-sm text-gray-600 font-semibold">{{ currentIndex + 1 }} / {{ total }}</div>
    </div>

    <!-- Main review area -->
    <div class="flex-1 flex flex-col items-center justify-center">
      <transition name="fade" mode="out-in">
        <div v-if="!sessionFinished" :key="currentIndex" class="w-full flex flex-col items-center">
          <ReviewCard
            :current-card="currentCard"
            :is-back-visible="isBackVisible"
            :collection-name="headerTitle"
            @show-back="$emit('show-back')"
            @answer="answer"
          />
        </div>
        <!-- End of session -->
        <ReviewSessionEnd
          v-else
          :cards-reviewed-count="cardsReviewedCount"
          :success-rate="successRate"
          @back="goToFinish"
        />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '~/lib/types'

defineProps<{
  currentIndex: number
  total: number
  cardsReviewedCount: number
  sessionFinished: boolean
  currentCard: Card | null
  isBackVisible: boolean
  headerTitle: string
  successRate: number
  goBack: () => void
  goToFinish: () => void
  answer: (choice: boolean) => void
}>()

defineEmits<{
  'show-back': []
}>()
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>