import { Preferences } from '@capacitor/preferences'
import { useDailyReviewStore } from '~/store/dailyReview'
import { useCards } from '~/composables/useCards'

export const useDailyReview = () => {
  const dailyReviewStore = useDailyReviewStore()
  const { getCardsDueToday } = useCards()

  // Fonction pour mettre à jour le total de cartes dues aujourd'hui
  const setCardsDueTotalCount = async () => {
    try {
      const today = new Date().toDateString()

      // Vérifier si les données existent déjà pour aujourd'hui
      const existingData = await Preferences.get({ key: 'dailyCardsDueTotal' })
      if (existingData.value) {
        const parsedData = JSON.parse(existingData.value)
        if (parsedData.date === today) {
          // Utiliser les données existantes
          dailyReviewStore.setTotalCardsDueCount(parsedData.count)
          return parsedData.count
        }
      }

      // Si pas de données ou date différente, recalculer
      const dueCards = await getCardsDueToday()
      const count = dueCards.length

      // Persister dans Preferences
      await Preferences.set({
        key: 'dailyCardsDueTotal',
        value: JSON.stringify({
          date: today,
          count: count,
        }),
      })

      dailyReviewStore.setTotalCardsDueCount(count)
      return count
    } catch (error) {
      console.error('Erreur lors de la mise à jour du total de cartes dues:', error)
      return 0
    }
  }

  // Fonction pour définir le nombre de cartes répondues aujourd'hui
  const setAnsweredCardsCount = async (count: number) => {
    try {
      const today = new Date().toDateString()

      // Persister dans Preferences
      await Preferences.set({
        key: 'dailyAnsweredCardsCount',
        value: JSON.stringify({
          date: today,
          count: count,
        }),
      })

      dailyReviewStore.setAnsweredCardsCount(count)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du nombre de cartes répondues:', error)
    }
  }

  // Fonction pour initialiser la revue quotidienne
  const initDailyReview = async () => {
    await setCardsDueTotalCount()

    // Vérifier s'il y a déjà des données pour aujourd'hui
    const today = new Date().toDateString()
    const existingData = await Preferences.get({ key: 'dailyAnsweredCardsCount' })

    if (existingData.value) {
      const parsedData = JSON.parse(existingData.value)
      if (parsedData.date !== today) {
        await setAnsweredCardsCount(0)
      }
    } else {
      await setAnsweredCardsCount(0)
    }
  }

  // Fonction pour incrémenter le nombre de cartes répondues
  const incrementAnsweredCardsCount = async () => {
    await setAnsweredCardsCount(dailyReviewStore.answeredCardsCount + 1)
  }

  // Fonction pour invalider le cache (utile après sync ou modifications)
  const invalidateCache = async () => {
    try {
      await Preferences.remove({ key: 'dailyCardsDueTotal' })
    } catch (error) {
      console.error('Error invalidating cache:', error)
    }
  }

  return {
    initDailyReview,
    incrementAnsweredCardsCount,
    invalidateCache,
    setCardsDueTotalCount,
  }
}
