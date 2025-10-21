<template>
  <ReviewSessionLayout
    :current-index="currentIndex"
    :total="total"
    :cards-reviewed-count="cardsReviewedCount"
    :session-finished="sessionFinished"
    :current-card="currentCard"
    :is-back-visible="isBackVisible"
    :header-title="$t('dailyReview.title')"
    :success-rate="successRate"
    :go-back="goBack"
    :go-to-finish="goToFinish"
    :answer="answer"
    @show-back="isBackVisible = true"
  />
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
