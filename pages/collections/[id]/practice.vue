<template>
  <div
    class="review-session-layout fixed inset-0 flex flex-col bg-gray-50"
    style="padding-top: env(safe-area-inset-top)"
  >
    <!-- Header fixe -->
    <div class="flex-shrink-0 px-6 pb-2 pt-6">
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
        <!-- End of session -->
        <ReviewSessionEnd
          v-else
          :cards-reviewed-count="cardsReviewedCount"
          :success-rate="successRate"
          :return-label="$t('practiceMode.returnToCollection')"
          @back="goToFinish"
        />
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

// Fonction pour récupérer toutes les cartes de la collection
async function getCollectionCards() {
  await loadCards(collectionId)
  return [...cards.value]
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
</style>
