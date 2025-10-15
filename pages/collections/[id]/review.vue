<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
  <button class="text-gray-500 hover:text-gray-700" :aria-label="$t('common.backButton')" @click="goBack">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="text-xs text-gray-400 font-medium">{{ collection?.name }}</div>
      <div class="text-sm text-gray-600 font-semibold">{{ currentIndex + 1 }} / {{ total }}</div>
    </div>

    <!-- Main review area -->
    <div class="flex-1 flex flex-col items-center justify-center">
      <transition name="fade" mode="out-in">
        <div v-if="!sessionFinished" :key="currentIndex" class="w-full flex flex-col items-center">
                    <ReviewCard
            :current-card="currentCard"
            :is-back-visible="isBackVisible"
            :collection-name="collection?.name"
            @show-back="isBackVisible = true"
            @answer="answer"
          />
        </div>
        <!-- End of session -->
        <ReviewSessionEnd
          v-else
          key="end"
          :count="total"
          :percent="Math.round((goodCount / total) * 100)"
          @back="goToCollections"
        />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCollections } from '~/composables/useCollections'
import { useCards } from '~/composables/useCards'
import type { Collection, Card } from '~/lib/types'

const route = useRoute()
const router = useRouter()
const { getCollection } = useCollections()
const { getAllCards, applyAnswer } = useCards()

const collectionId = String(route.params.id)
const collection = ref<Collection | null>(null)
const cards = ref<Card[]>([])
const currentIndex = ref(0)
const isBackVisible = ref(false)
const sessionFinished = ref(false)
const goodCount = ref(0)
const total = ref(0)

const currentCard = computed(() => cards.value[currentIndex.value])

function goBack() {
  router.push(`/collections/${collectionId}/cards`)
}
function goToCollections() {
  router.push('/')
}

async function answer(resp: 'true' | 'almost' | 'false') {
  if (!currentCard.value) return
  await applyAnswer(currentCard.value, resp)
  if (resp === 'true') goodCount.value += 1
  // Animation/transition vers la carte suivante
  isBackVisible.value = false
  if (currentIndex.value < cards.value.length - 1) {
  currentIndex.value += 1
  } else {
    sessionFinished.value = true
  }
}

onMounted(async () => {
  collection.value = getCollection(collectionId)
  cards.value = await getAllCards(collectionId)
  total.value = cards.value.length
})
defineOptions({ name: 'ReviewSessionPage' })
</script>

<style scoped>
.flip-card {
  perspective: 1000px;
  width: 100%;
  height: 100%;
  position: relative;
}
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.flip-card-inner.back-visible {
  transform: rotateY(-180deg);
}
.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  top: 0;
  left: 0;
}
.flip-card-front {
  z-index: 2;
}
.flip-card-back {
  transform: rotateY(-180deg);
  z-index: 3;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
