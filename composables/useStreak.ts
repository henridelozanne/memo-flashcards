import { ref, readonly } from 'vue'

// Types pour le streak
interface StreakDay {
  date: string // YYYY-MM-DD
  cardsReviewed: number
}

const STORAGE_KEY = 'memo-flashcards-streak'
const MIN_CARDS_FOR_STREAK = 10
const MAX_STREAK_HISTORY = 90 // 90 jours glissants

// État réactif
const streakHistory = ref<StreakDay[]>([])
const todayCardsCount = ref(0)

export const useStreak = () => {
  /**
   * Charge l'historique du streak depuis localStorage
   */
  const loadStreak = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        streakHistory.value = data.history || []
        todayCardsCount.value = data.todayCount || 0
        cleanOldHistory()
      }
    } catch (error) {
      console.error('Erreur lors du chargement du streak:', error)
      streakHistory.value = []
      todayCardsCount.value = 0
    }
  }

  /**
   * Sauvegarde l'historique dans localStorage
   */
  const saveStreak = () => {
    try {
      const data = {
        history: streakHistory.value,
        todayCount: todayCardsCount.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du streak:', error)
    }
  }

  /**
   * Nettoie l'historique des jours trop anciens (> 90 jours)
   */
  const cleanOldHistory = () => {
    const today = new Date()
    const cutoffDate = new Date(today.getTime() - MAX_STREAK_HISTORY * 24 * 60 * 60 * 1000)
    const cutoffString = cutoffDate.toISOString().split('T')[0]
    
    streakHistory.value = streakHistory.value.filter(day => day.date >= cutoffString)
  }

  /**
   * Retourne la date d'aujourd'hui au format YYYY-MM-DD
   */
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0]
  }

  /**
   * Incrémente le compteur de cartes révisées aujourd'hui
   */
  const incrementTodayCards = () => {
    todayCardsCount.value++
    saveStreak()
  }

  /**
   * Valide le streak du jour (session quotidienne terminée)
   */
  const validateTodayStreak = () => {
    const today = getTodayString()
    const existingDay = streakHistory.value.find(day => day.date === today)
    
    if (existingDay) {
      existingDay.cardsReviewed = todayCardsCount.value
    } else {
      streakHistory.value.push({
        date: today,
        cardsReviewed: todayCardsCount.value
      })
    }
    
    cleanOldHistory()
    saveStreak()
    return true
  }

  /**
   * Vérifie si le streak d'aujourd'hui est validé
   */
  const isTodayStreakValidated = () => {
    const today = getTodayString()
    return streakHistory.value.some(day => day.date === today)
  }

  /**
   * Calcule la longueur du streak actuel (jours consécutifs)
   */
  const getCurrentStreakLength = () => {
    const today = new Date()
    let streakLength = 0
    
    for (let i = 0; i < MAX_STREAK_HISTORY; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateString = checkDate.toISOString().split('T')[0]
      
      if (streakHistory.value.some(day => day.date === dateString)) {
        streakLength++
      } else {
        break
      }
    }
    
    return streakLength
  }

  /**
   * Vérifie si l'utilisateur doit réviser pour maintenir son streak
   */
  const shouldValidateStreak = () => {
    return todayCardsCount.value >= MIN_CARDS_FOR_STREAK
  }

  /**
   * Remet à zéro le compteur quotidien (pour les tests)
   */
  const resetTodayCount = () => {
    todayCardsCount.value = 0
    saveStreak()
  }

  /**
   * Remet à zéro tout l'historique (pour les tests)
   */
  const resetStreak = () => {
    streakHistory.value = []
    todayCardsCount.value = 0
    saveStreak()
  }

  // Charger les données au premier accès
  if (typeof window !== 'undefined') {
    loadStreak()
  }

  return {
    streakHistory: readonly(streakHistory),
    todayCardsCount: readonly(todayCardsCount),
    loadStreak,
    incrementTodayCards,
    validateTodayStreak,
    isTodayStreakValidated,
    getCurrentStreakLength,
    shouldValidateStreak,
    resetTodayCount,
    resetStreak,
    MIN_CARDS_FOR_STREAK
  }
}