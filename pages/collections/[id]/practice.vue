<template>
  <div
    class="review-session-layout fixed inset-0 flex flex-col"
    :class="sessionFinished ? 'with-animated-bg' : ''"
    style="padding-top: env(safe-area-inset-top)"
  >
    <AnimatedSunburst v-if="sessionFinished" />
    <!-- Header fixe -->
    <div class="header-container flex-shrink-0 px-6 pb-2 pt-6" :class="{ 'header-with-backdrop': sessionFinished }">
      <PageHeader :title="$t('practiceMode.title')" :back-button-visible="true" @back="goToFinish">
        <template #actions>
          <ProgressCircle
            :current="cardsReviewedCount"
            :total="total"
            :is-from-page-header="true"
            color-variant="purple"
          />
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
          <ReviewSessionEnd
            :cards-reviewed-count="cardsReviewedCount"
            :success-rate="successRate"
            :return-label="$t('practiceMode.returnToCollection')"
            @back="goToFinish"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCards } from '~/composables/useCards'
import { useReviewSession } from '~/composables/useReviewSession'
import ProgressCircle from '~/components/ProgressCircle.vue'

const route = useRoute()
const router = useRouter()
const { loadCards, cards } = useCards()

const collectionId = String(route.params.id)

// Parse practice options from query params
const practiceOptions = {
  mostFailed: route.query.mostFailed === '1',
  onlyDue: route.query.onlyDue === '1',
  onlyNew: route.query.onlyNew === '1',
  excludeNew: route.query.excludeNew === '1',
  swapQuestionAnswer: route.query.swapQuestionAnswer === '1',
}

// Fonction pour récupérer et filtrer les cartes selon les options
async function getCollectionCards() {
  await loadCards(collectionId)
  let filteredCards = [...cards.value]

  const now = Date.now()

  // Filter: only due cards
  if (practiceOptions.onlyDue) {
    filteredCards = filteredCards.filter((card) => card.next_review_at <= now)
  }

  // Filter: only new cards (never reviewed)
  if (practiceOptions.onlyNew) {
    filteredCards = filteredCards.filter((card) => card.total_reviews === 0)
  }

  // Filter: exclude new cards
  if (practiceOptions.excludeNew) {
    filteredCards = filteredCards.filter((card) => card.total_reviews > 0)
  }

  // Filter: most failed (top 25%)
  if (practiceOptions.mostFailed) {
    // Calculate fail rate for each card and sort
    const cardsWithFailRate = filteredCards
      .filter((card) => card.total_reviews > 0) // Only cards that have been reviewed
      .map((card) => ({
        card,
        failRate: (card.total_reviews - card.correct_answers) / card.total_reviews,
      }))
      .sort((a, b) => b.failRate - a.failRate)

    // Take top 25%
    const top25PercentCount = Math.max(1, Math.ceil(cardsWithFailRate.length * 0.25))
    filteredCards = cardsWithFailRate.slice(0, top25PercentCount).map((item) => item.card)
  }

  // Swap question and answer if requested
  if (practiceOptions.swapQuestionAnswer) {
    filteredCards = filteredCards.map((card) => ({
      ...card,
      question: card.answer,
      answer: card.question,
    }))
  }

  return filteredCards
}

const {
  currentIndex,
  isBackVisible,
  sessionFinished,
  cardsReviewedCount,
  currentCard,
  successRate,
  total,
  answer,
  goToFinish,
  initializeSession,
} = useReviewSession({
  getCards: getCollectionCards,
  onBack: () => router.push(`/collections/${collectionId}/cards`),
  onFinish: () => router.push(`/collections/${collectionId}/cards`),
  isPracticeMode: true,
})

onMounted(initializeSession)

defineOptions({ name: 'PracticeReviewPage' })
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
