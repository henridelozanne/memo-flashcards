import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCards } from '~/composables/useCards'
import { useStreak } from '~/composables/useStreak'

// Mock Capacitor to simulate web environment
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false
  }
}))

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Daily Review Functions', () => {
  beforeEach(() => {
    const { resetCards } = useCards()
    const { resetStreak } = useStreak()
    resetCards()
    resetStreak()
    // Clear localStorage
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('getCardsDueToday', () => {
    it('retourne toutes les cartes dues de toutes les collections', async () => {
      const { createCard, getCardsDueToday } = useCards()
      
      // Créer des cartes dans différentes collections
      await createCard('Q1', 'A1', 'collection1')
      await createCard('Q2', 'A2', 'collection2')
      await createCard('Q3', 'A3', 'collection1')
      
      const dueCards = await getCardsDueToday()
      expect(dueCards).toHaveLength(3)
      // Vérifier que toutes les questions sont présentes (sans se soucier de l'ordre)
      const questions = dueCards.map(c => c.question).sort()
      expect(questions).toEqual(['Q1', 'Q2', 'Q3'])
    })

    it('exclut les cartes du compartiment 6', async () => {
      const { createCard, getCardsDueToday, applyAnswer } = useCards()
      
      await createCard('Q1', 'A1', 'collection1')
      await createCard('Q2', 'A2', 'collection1')
      
      const cards = await getCardsDueToday()
      expect(cards).toHaveLength(2)
      
      // Faire passer une carte au compartiment 6
      const cardToPromote = cards[0]
      // Répondre correctement 6 fois pour faire passer la carte au compartiment 6
      await Promise.all(
        Array.from({ length: 6 }, () => applyAnswer(cardToPromote, 'true'))
      )
      
      const remainingCards = await getCardsDueToday()
      expect(remainingCards).toHaveLength(1)
      // Vérifier que c'est l'autre carte qui reste
      expect(remainingCards[0].question).toBe(cards[1].question)
    })

    it('trie par next_review_at puis created_at', async () => {
      const { createCard, getCardsDueToday, applyAnswer } = useCards()
      
      // Créer deux cartes
      await createCard('Q1', 'A1', 'collection1')
      await new Promise(resolve => setTimeout(resolve, 10))
      await createCard('Q2', 'A2', 'collection1')
      
      // Les deux cartes sont initialement dues maintenant
      let dueCards = await getCardsDueToday()
      expect(dueCards).toHaveLength(2)
      
      // Faire une mauvaise réponse sur Q1 pour la remettre en compartiment 1 (due immédiatement)
  const q1Card = dueCards.find(c => c.question === 'Q1')
  if (!q1Card) throw new Error('Q1 introuvable')
  await applyAnswer(q1Card, 'false')
      
      // Faire une bonne réponse sur Q2 pour la retarder
  const q2Card = dueCards.find(c => c.question === 'Q2')
  if (!q2Card) throw new Error('Q2 introuvable')
  await applyAnswer(q2Card, 'true')
      
      // Maintenant seule Q1 devrait être due (compartiment 1)
      dueCards = await getCardsDueToday()
      expect(dueCards).toHaveLength(1)
      expect(dueCards[0].question).toBe('Q1')
    })
  })

  describe('Streak System', () => {
    it('valide le streak automatiquement à la fin de session', () => {
      const { incrementTodayCards, validateTodayStreak } = useStreak()
      
      // Réviser quelques cartes (peu importe le nombre)
      incrementTodayCards()
      incrementTodayCards()
      incrementTodayCards()
      
      // Terminer la session quotidienne valide automatiquement le streak
      expect(validateTodayStreak()).toBe(true)
    })

    it('valide le streak même avec une seule carte', () => {
      const { incrementTodayCards, validateTodayStreak } = useStreak()
      
      // Réviser une seule carte
      incrementTodayCards()
      
      // Terminer la session valide le streak
      expect(validateTodayStreak()).toBe(true)
    })

    it('track le streak actuel', () => {
      const { validateTodayStreak, getCurrentStreakLength, incrementTodayCards } = useStreak()
      
      expect(getCurrentStreakLength()).toBe(0)
      
      // Simuler une validation aujourd'hui
      incrementTodayCards()
      validateTodayStreak()
      
      expect(getCurrentStreakLength()).toBe(1)
    })

    it('sauvegarde et charge depuis localStorage', () => {
      const { incrementTodayCards, loadStreak, todayCardsCount } = useStreak()
      
      incrementTodayCards()
      incrementTodayCards()
      expect(todayCardsCount.value).toBe(2)
      
      // Simuler un rechargement
      loadStreak()
      expect(todayCardsCount.value).toBe(2)
    })

    it('détecte si le streak est déjà validé aujourd\'hui', () => {
      const { incrementTodayCards, validateTodayStreak, isTodayStreakValidated } = useStreak()
      
      expect(isTodayStreakValidated()).toBe(false)
      
      incrementTodayCards()
      validateTodayStreak()
      
      expect(isTodayStreakValidated()).toBe(true)
    })
  })

  describe('Daily Review Integration', () => {
    it('termine la session et valide le streak automatiquement', async () => {
      const { createCard, getCardsDueToday, applyAnswer } = useCards()
      const { incrementTodayCards, validateTodayStreak, isTodayStreakValidated } = useStreak()
      
      // Créer quelques cartes
      await createCard('Q1', 'A1', 'collection1')
      await createCard('Q2', 'A2', 'collection1')
      
      const dueCards = await getCardsDueToday()
      expect(dueCards).toHaveLength(2)
      expect(isTodayStreakValidated()).toBe(false)
      
      // Simuler la révision de toutes les cartes
      await Promise.all(
        dueCards.map(async (card) => {
          await applyAnswer(card, 'true')
          incrementTodayCards()
        })
      )
      
      // Terminer la session valide le streak
      const streakValidated = validateTodayStreak()
      expect(streakValidated).toBe(true)
      expect(isTodayStreakValidated()).toBe(true)
    })

    it('fonctionne même avec une seule carte due', async () => {
      const { createCard, getCardsDueToday, applyAnswer } = useCards()
      const { incrementTodayCards, validateTodayStreak } = useStreak()
      
      // Créer une seule carte
      await createCard('Q1', 'A1', 'collection1')
      
      const dueCards = await getCardsDueToday()
      expect(dueCards).toHaveLength(1)
      
      // Réviser cette unique carte
      await applyAnswer(dueCards[0], 'true')
      incrementTodayCards()
      
      // Le streak est validé même avec une seule carte
      const streakValidated = validateTodayStreak()
      expect(streakValidated).toBe(true)
    })
  })
})