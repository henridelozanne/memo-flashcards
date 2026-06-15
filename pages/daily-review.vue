<template>
  <div class="review-session-layout fixed inset-0 flex flex-col" style="padding-top: env(safe-area-inset-top)">
    <!-- Header fixe -->
    <div class="header-container flex-shrink-0 px-6 pb-2 pt-6">
      <PageHeader :title="$t('dailyReview.title')" back-button-visible @back="goBack">
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
            :collection-name="currentCollectionName"
            :collection-color="currentCollectionColor"
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
            @back="goToFinish"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCards } from '~/composables/useCards'
import { useCollections } from '~/composables/useCollections'
import { useReviewSession } from '~/composables/useReviewSession'
import { useDailyReviewStore } from '~/store/dailyReview'
import { useXpScore } from '~/composables/useXpScore'
import XpFlipWidget from '~/components/XpFlipWidget.vue'
import XpGainBanner from '~/components/XpGainBanner.vue'

const router = useRouter()
const { getCardsDueToday } = useCards()
const { loadCollections, getCollection } = useCollections()
const dailyReviewStore = useDailyReviewStore()

const {
  currentIndex,
  isBackVisible,
  sessionFinished,
  cardsReviewedCount,
  goodCount,
  successRate,
  answeredCards,
  total,
  currentCard,
  answer,
  goBack,
  goToFinish,
  initializeSession,
} = useReviewSession({
  getCards: getCardsDueToday,
  onBack: () => router.push('/'),
  onFinish: () => {
    dailyReviewStore.setShowStreakModal(true)
    router.push('/')
  },
})

const xpWidgetRef = ref<InstanceType<typeof XpFlipWidget>>()
const { xpScore, showBanner, isBoost, boostMilestone, earnedCompartment, onCorrectAnswer, onWrongAnswer } = useXpScore()
watch(showBanner, (val) => {
  if (!val) xpWidgetRef.value?.flipBack()
})

function handleAnswer(value: boolean) {
  if (value && currentCard.value) {
    onCorrectAnswer(currentCard.value.compartment)
  } else if (!value) {
    onWrongAnswer()
  }
  answer(value)
}

const cardBackground = computed(() => {
  if (!currentCard.value) return null
  return getCollection(currentCard.value.collection_id)?.card_background ?? null
})

const currentCollectionName = computed(() => {
  if (!currentCard.value) return null
  return getCollection(currentCard.value.collection_id)?.name ?? null
})

const currentCollectionColor = computed(() => {
  if (!currentCard.value) return null
  return getCollection(currentCard.value.collection_id)?.color ?? null
})

onMounted(async () => {
  await loadCollections()
  initializeSession()
})

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

.review-session-layout > *:not(.header-container) {
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

<style>
/* Empêcher le scroll du body quand le composant de révision est actif */
body:has(.review-session-layout) {
  overflow: hidden;
}
</style>
