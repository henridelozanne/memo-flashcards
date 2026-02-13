<template>
  <div
    class="review-session-layout fixed inset-0 flex flex-col"
    :class="sessionFinished ? 'with-animated-bg' : ''"
    style="padding-top: env(safe-area-inset-top)"
  >
    <AnimatedSunburst v-if="sessionFinished" />
    <!-- Header fixe -->
    <div class="header-container flex-shrink-0 px-6 pb-2 pt-6" :class="{ 'header-with-backdrop': sessionFinished }">
      <PageHeader :title="$t('dailyReview.title')" back-button-visible @back="goBack">
        <template #actions>
          <ProgressCircle :is-from-page-header="true" color-variant="purple" />
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
        <!-- End of session - Centered on viewport -->
        <div v-else class="session-end-overlay">
          <ReviewSessionEnd :cards-reviewed-count="cardsReviewedCount" :success-rate="successRate" @back="goToFinish" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCards } from '~/composables/useCards'
import { useReviewSession } from '~/composables/useReviewSession'
import ProgressCircle from '~/components/ProgressCircle.vue'

const router = useRouter()
const { getCardsDueToday } = useCards()

const {
  currentIndex,
  isBackVisible,
  sessionFinished,
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

.with-animated-bg {
  overflow: hidden;
}

.review-session-layout > *:not(.animated-sunburst):not(.header-container) {
  position: relative;
  z-index: 1;
}

.header-container {
  position: relative;
  z-index: 20;
}

.header-with-backdrop {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 0 0 20px 20px;
  border-top: 1px solid var(--color-primary);
  border-bottom: 1px solid var(--color-primary);
  margin: 0 -1.5rem;
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
}

.session-end-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 10;
}
</style>

<style>
/* Empêcher le scroll du body quand le composant de révision est actif */
body:has(.review-session-layout) {
  overflow: hidden;
}
</style>
