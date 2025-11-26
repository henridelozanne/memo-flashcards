import { ref, computed } from 'vue'
import { useCards } from './useCards'
import { useDatabase } from './useDatabase'
import type { Card } from '~/lib/types'
import { v4 as uuidv4 } from 'uuid'

interface ReviewSessionConfig {
  getCards: () => Promise<Card[]>
  onBack: () => void
  onFinish: () => void
  isPracticeMode?: boolean
}

export function useReviewSession(config: ReviewSessionConfig) {
  const { applyAnswer } = useCards()
  const { getDbConnection } = useDatabase()

  const cards = ref<Card[]>([])
  const currentIndex = ref(0)
  const isBackVisible = ref(false)
  const sessionFinished = ref(false)
  const goodCount = ref(0)
  const cardsReviewedCount = ref(0)
  const total = ref(0)
  const isLoading = ref(true)
  const sessionId = ref<string | null>(null)
  const isPracticeMode = config.isPracticeMode ?? false

  const currentCard = computed(() => cards.value[currentIndex.value])
  const successRate = computed(() =>
    cardsReviewedCount.value > 0 ? Math.round((goodCount.value / cardsReviewedCount.value) * 100) : 0
  )

  async function initializeSession() {
    try {
      isLoading.value = true
      cards.value = await config.getCards()
      total.value = cards.value.length

      // Créer une session de révision uniquement si ce n'est pas le mode practice
      if (!isPracticeMode) {
        const db = await getDbConnection()
        const id = uuidv4()
        const now = Date.now()
        await db.run('INSERT INTO review_sessions (id, user_id, started_at) VALUES (?, ?, ?)', [
          id,
          'default-user',
          now,
        ])
        sessionId.value = id
      }
    } finally {
      isLoading.value = false
    }
  }

  async function answer(choice: boolean) {
    if (!currentCard.value) return

    // Appliquer la réponse Leitner uniquement si ce n'est pas le mode practice
    if (!isPracticeMode) {
      await applyAnswer(currentCard.value, choice)

      // Logger la réponse
      if (sessionId.value) {
        const db = await getDbConnection()
        const logId = uuidv4()
        const now = Date.now()
        const result = choice ? 'correct' : 'wrong'
        await db.run(
          'INSERT INTO review_logs (id, user_id, card_id, session_id, result, reviewed_at) VALUES (?, ?, ?, ?, ?, ?)',
          [logId, 'default-user', currentCard.value.id, sessionId.value, result, now]
        )
      }
    }

    // Compter les statistiques (même en mode practice pour l'affichage)
    cardsReviewedCount.value += 1
    if (choice === true) goodCount.value += 1

    // Animation/transition vers la carte suivante
    isBackVisible.value = false
    if (currentIndex.value < cards.value.length - 1) {
      currentIndex.value += 1
    } else {
      // Fin de session
      sessionFinished.value = true

      // Terminer la session dans la base de données uniquement si ce n'est pas le mode practice
      if (!isPracticeMode && sessionId.value) {
        const db = await getDbConnection()
        const endedAt = Date.now()
        const wrongCount = cardsReviewedCount.value - goodCount.value
        await db.run(
          'UPDATE review_sessions SET ended_at = ?, cards_reviewed = ?, correct_count = ?, wrong_count = ? WHERE id = ?',
          [endedAt, cardsReviewedCount.value, goodCount.value, wrongCount, sessionId.value]
        )
      }
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
