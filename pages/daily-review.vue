<template>
  <div
    class="review-session-layout fixed inset-0 flex flex-col bg-gray-50"
    style="padding-top: env(safe-area-inset-top)"
  >
    <!-- Header fixe -->
    <div class="flex-shrink-0 px-6 pb-2 pt-6">
      <PageHeader :title="$t('dailyReview.title')" back-button-visible @back="goBack">
        <template #actions>
          <div class="text-sm font-semibold text-gray-600">{{ currentIndex + 1 }} / {{ total }}</div>
        </template>
      </PageHeader>
    </div>

    <!-- Main review area -->
    <div class="flex flex-1 flex-col items-center justify-center overflow-hidden p-4">
      <transition name="fade" mode="out-in">
        <div v-if="!sessionFinished" :key="currentIndex" class="flex w-full flex-col items-center">
          <ReviewCard
            :current-card="currentCard"
            :is-back-visible="isBackVisible"
            @show-back="isBackVisible = true"
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCards } from '~/composables/useCards'
import { useReviewSession } from '~/composables/useReviewSession'

const router = useRouter()
const { getCardsDueToday } = useCards()

const {
  currentIndex,
  isBackVisible,
  sessionFinished,
  total,
  cardsReviewedCount,
  currentCard,
  successRate,
  answer,
  goBack,
  goToFinish,
  initializeSession,
} = useReviewSession({
  getCards: getCardsDueToday,
  onBack: () => router.push('/'),
  onFinish: () => router.push('/'),
})

onMounted(initializeSession)

defineOptions({ name: 'DailyReviewPage' })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* Empêcher le scroll du body quand le composant de révision est actif */
body:has(.review-session-layout) {
  overflow: hidden;
}
</style>
