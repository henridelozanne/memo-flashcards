<template>
  <ReviewSessionLayout
    :current-index="currentIndex"
    :total="total"
    :cards-reviewed-count="cardsReviewedCount"
    :session-finished="sessionFinished"
    :current-card="currentCard"
    :is-back-visible="isBackVisible"
    :header-title="collection?.name || ''"
    :success-rate="successRate"
    :go-back="goBack"
    :go-to-finish="goToFinish"
    :answer="answer"
    @show-back="isBackVisible = true"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import { useReviewSession } from '~/composables/useReviewSession'
import type { Collection } from '~/lib/types'

const route = useRoute()
const router = useRouter()
const { getCollection } = useCollections()
const { getAllCardsFromCollection } = useCards()

const collectionId = String(route.params.id)
const collection = ref<Collection | null>(null)

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
  getCards: () => getAllCardsFromCollection(collectionId),
  onBack: () => router.push(`/collections/${collectionId}/cards`),
  onFinish: () => router.push('/'),
})

onMounted(async () => {
  collection.value = getCollection(collectionId)
  await initializeSession()
})

defineOptions({ name: 'ReviewSessionPage' })
</script>
