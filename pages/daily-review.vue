<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <button class="text-gray-500 hover:text-gray-700" :aria-label="$t('common.backButton')" @click="$router.push('/')">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="text-sm text-gray-600 font-semibold">{{ currentIndex + 1 }} / {{ totalCards }}</div>
    </div>

    <!-- Main review area -->
    <div class="flex-1 flex flex-col items-center justify-center">
      <!-- Loading state -->
      <div v-if="isLoadingCards" class="flex flex-col items-center space-y-4">
        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-600">{{ $t('review.loadingCards') }}</p>
      </div>
      
      <!-- Review cards -->
      <transition v-else name="slide" mode="out-in">
        <div v-if="!sessionFinished && currentCard" :key="currentIndex" class="w-full flex flex-col items-center">
          <ReviewCard
            :current-card="currentCard"
            :show-back="showBack"
            :responses="responses"
            :collection-name="currentCard.collection_name"
            @show-back="showBack = true"
            @answer="answer"
          />
        </div>
        <!-- End of session -->
        <DailyReviewEnd
          v-else-if="sessionFinished"
          key="end"
          :cards-reviewed="cardsReviewed"
          :success-rate="successRate"
          @back="$router.push('/')"
        />
        <!-- No cards available -->
        <div v-else class="text-center text-gray-600">
          <p>{{ $t('review.noCardsAvailable') }}</p>
          <button 
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="$router.push('/')"
          >
            {{ $t('common.backButton') }}
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCards } from '~/composables/useCards'
import { useCollections } from '~/composables/useCollections'
import type { Card } from '~/lib/types'

const router = useRouter()
const { getCardsDueToday, applyAnswer } = useCards()
const { collections, loadCollections } = useCollections()

const dueCards = ref<Card[]>([])
const currentIndex = ref(0)
const showBack = ref(false)
const sessionFinished = ref(false)
const goodCount = ref(0)
const cardsReviewed = ref(0)
const isLoadingCards = ref(true)

const responses = [
  { value: 'false', label: 'review.again' },
  { value: 'almost', label: 'review.almost' },
  { value: 'true', label: 'review.good' },
]

const currentCard = computed(() => {
  const card = dueCards.value[currentIndex.value]
  if (!card) return null
  
  // Enrichir avec le nom de la collection
  const collection = collections.value.find(c => c.id === card.collection_id)
  return {
    ...card,
    collection_name: collection?.name || 'Collection'
  }
})

const totalCards = computed(() => dueCards.value.length)
const successRate = computed(() => 
  cardsReviewed.value > 0 ? Math.round((goodCount.value / cardsReviewed.value) * 100) : 0
)

async function answer(resp: 'true' | 'almost' | 'false') {
  if (!currentCard.value) return
  
  // Appliquer la réponse Leitner
  await applyAnswer(currentCard.value, resp)
  
  // Compter les statistiques
  cardsReviewed.value += 1
  if (resp === 'true') goodCount.value += 1
  
  // Animation/transition vers la carte suivante
  showBack.value = false
  if (currentIndex.value < dueCards.value.length - 1) {
    currentIndex.value += 1
  } else {
    // Fin de session
    sessionFinished.value = true
  }
}

onMounted(async () => {
  try {
    isLoadingCards.value = true
    
    // Charger les collections pour avoir les noms
    await loadCollections()
    
    // Récupérer les cartes dues aujourd'hui
    dueCards.value = await getCardsDueToday()
    
    // Si aucune carte, retourner à l'accueil
    if (dueCards.value.length === 0) {
      router.push('/')
    }
  } catch (error) {
    console.error('Erreur lors du chargement des cartes:', error)
    router.push('/')
  } finally {
    isLoadingCards.value = false
  }
})

defineOptions({ name: 'DailyReviewPage' })
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease-in-out;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}
</style>