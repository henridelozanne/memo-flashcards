<template>
  <div class="review-session-layout fixed inset-0 flex flex-col" style="padding-top: env(safe-area-inset-top)">
    <!-- Header fixe -->
    <div class="header-container flex-shrink-0 px-6 pb-2 pt-6">
      <PageHeader :title="$t('practiceMode.title')" :back-button-visible="true" @back="goToFinish">
        <template #actions>
          <XpFlipWidget ref="xpWidgetRef" :current="currentIndex + 1" :total="total" :xp="xpScore" />
        </template>
      </PageHeader>
    </div>

    <!-- Main review area -->
    <div class="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-4">
      <!-- XP Banner -->
      <div class="absolute left-0 right-0 top-0 flex items-center justify-center" style="min-height: 3rem">
        <XpGainBanner
          :visible="showBanner"
          :compartment="earnedCompartment"
          :is-boost="isBoost"
          :boost-milestone="boostMilestone"
        />
      </div>
      <transition name="fade" mode="out-in">
        <div v-if="!sessionFinished" :key="currentIndex" class="flex w-full flex-col items-center">
          <ReviewCard
            :current-card="currentCard"
            :is-back-visible="isBackVisible"
            :card-background="cardBackground"
            @show-back="isBackVisible = true"
            @answer="handleAnswer"
          />
        </div>
        <!-- End of session - Centered on viewport -->
        <div v-else class="session-end-overlay">
          <ReviewSessionEnd
            :cards-reviewed-count="cardsReviewedCount"
            :good-count="goodCount"
            :success-rate="successRate"
            :xp-score="xpScore"
            :answered-cards="answeredCards"
            :return-label="$t('practiceMode.returnToCollection')"
            @back="goToFinish"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCards } from '~/composables/useCards'
import { useCollections } from '~/composables/useCollections'
import { useReviewSession } from '~/composables/useReviewSession'
import { useXpScore } from '~/composables/useXpScore'
import XpFlipWidget from '~/components/XpFlipWidget.vue'
import XpGainBanner from '~/components/XpGainBanner.vue'

const route = useRoute()
const router = useRouter()
const { loadCards, cards } = useCards()
const { loadCollections, getCollection } = useCollections()

const collectionId = String(route.params.id)
const cardBackground = ref<string | null>(null)

const xpWidgetRef = ref<InstanceType<typeof XpFlipWidget>>()
const { xpScore, showBanner, isBoost, boostMilestone, earnedCompartment, onCorrectAnswer, onWrongAnswer } = useXpScore()
watch(showBanner, (val) => {
  if (!val) xpWidgetRef.value?.flipBack()
})

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
  cardBackground.value = getCollection(collectionId)?.card_background ?? null
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
  goodCount,
  successRate,
  answeredCards,
  currentCard,
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

function handleAnswer(value: boolean) {
  if (value && currentCard.value) {
    onCorrectAnswer(currentCard.value.compartment)
  } else if (!value) {
    onWrongAnswer()
  }
  answer(value)
}

onMounted(async () => {
  await loadCollections()
  await initializeSession()
})

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
  padding-top: calc(env(safe-area-inset-top) + 5rem);
  z-index: 10;
}
</style>
