<template>
  <div class="review-session-layout fixed inset-0 bg-gray-50 flex flex-col" style="padding-top: env(safe-area-inset-top);">
    <!-- Header fixe -->
    <div class="flex-shrink-0 px-6 pt-6 pb-2">
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
    <div class="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
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

<style>
/* Empêcher le scroll du body quand le composant de révision est actif */
body:has(.review-session-layout) {
  overflow: hidden;
}
</style>