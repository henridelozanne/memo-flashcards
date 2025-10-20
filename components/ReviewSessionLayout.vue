<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="px-4 pt-4 pb-2">
      <PageHeader 
        :title="headerTitle"
        back-button-visible
        @back="goBack"
      >
        <template #actions>
          <div class="text-sm text-gray-600 font-semibold">{{ currentIndex + 1 }} / {{ total }}</div>
        </template>
      </PageHeader>
    </div>

    <!-- Main review area -->
    <div class="flex-1 flex flex-col items-center justify-center">
      <transition name="fade" mode="out-in">
        <div v-if="!sessionFinished" :key="currentIndex" class="w-full flex flex-col items-center">
          <ReviewCard
            :current-card="currentCard"
            :is-back-visible="isBackVisible"
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