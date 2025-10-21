import { ref, computed } from 'vue'
import { useCards } from './useCards'
import type { Card } from '~/lib/types'

interface ReviewSessionConfig {
  getCards: () => Promise<Card[]>
  onBack: () => void
  onFinish: () => void
}

export function useReviewSession(config: ReviewSessionConfig) {
  const { applyAnswer } = useCards()

  const cards = ref<Card[]>([])
  const currentIndex = ref(0)
  const isBackVisible = ref(false)
  const sessionFinished = ref(false)
  const goodCount = ref(0)
  const cardsReviewedCount = ref(0)
  const total = ref(0)
  const isLoading = ref(true)

  const currentCard = computed(() => cards.value[currentIndex.value])
  const successRate = computed(() =>
    cardsReviewedCount.value > 0 ? Math.round((goodCount.value / cardsReviewedCount.value) * 100) : 0
  )

  async function initializeSession() {
    try {
      isLoading.value = true
      cards.value = await config.getCards()
      total.value = cards.value.length
    } finally {
      isLoading.value = false
    }
  }

  async function answer(choice: boolean) {
    if (!currentCard.value) return

    // Appliquer la réponse Leitner
    await applyAnswer(currentCard.value, choice)

    // Compter les statistiques
    cardsReviewedCount.value += 1
    if (choice === true) goodCount.value += 1

    // Animation/transition vers la carte suivante
    isBackVisible.value = false
    if (currentIndex.value < cards.value.length - 1) {
      currentIndex.value += 1
    } else {
      // Fin de session
      sessionFinished.value = true
    }
  }

  function goBack() {
    config.onBack()
  }

  function goToFinish() {
    config.onFinish()
  }

  return {
    // State
    cards,
    currentIndex,
    isBackVisible,
    sessionFinished,
    goodCount,
    cardsReviewedCount,
    total,
    isLoading,

    // Computed
    currentCard,
    successRate,

    // Methods
    initializeSession,
    answer,
    goBack,
    goToFinish,
  }
}
