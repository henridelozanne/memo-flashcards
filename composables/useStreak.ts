import { ref, readonly } from 'vue'

// Types pour le streak
interface StreakDay {
  date: string // YYYY-MM-DD
}

const STORAGE_KEY = 'memo-flashcards-streak'
const MAX_STREAK_HISTORY = 90 // 90 jours glissants

// État réactif
const streakHistory = ref<StreakDay[]>([])

export const useStreak = () => {
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
   * Charge l'historique du streak depuis localStorage
   */
  const loadStreak = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        streakHistory.value = data.history || []
        cleanOldHistory()
      }
    } catch (error) {
      console.error('Erreur lors du chargement du streak:', error)
      streakHistory.value = []
    }
  }

  /**
   * Sauvegarde l'historique dans localStorage
   */
  const saveStreak = () => {
    try {
      const data = {
        history: streakHistory.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du streak:', error)
    }
  }

  

  /**
   * Retourne la date d'aujourd'hui au format YYYY-MM-DD
   */
  const getTodayString = () => new Date().toISOString().split('T')[0]

  /**
   * Valide le streak du jour (session quotidienne terminée)
   */
  const validateTodayStreak = () => {
    const today = getTodayString()
    const existingDay = streakHistory.value.find(day => day.date === today)
    
    if (!existingDay) {
      streakHistory.value.push({
        date: today
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
    for (let i = 0; i < MAX_STREAK_HISTORY; i += 1) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateString = checkDate.toISOString().split('T')[0]
      if (streakHistory.value.some(day => day.date === dateString)) {
        streakLength += 1
      } else {
        break
      }
    }
    return streakLength
  }

  /**
   * Remet à zéro tout l'historique (pour les tests)
   */
  const resetStreak = () => {
    streakHistory.value = []
    saveStreak()
  }

  // Charger les données au premier accès
  if (typeof window !== 'undefined') {
    loadStreak()
  }

  return {
    streakHistory: readonly(streakHistory),
    loadStreak,
    validateTodayStreak,
    isTodayStreakValidated,
    getCurrentStreakLength,
    resetStreak
  }
}