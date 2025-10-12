import { ref, readonly } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Card } from '~/lib/types'

// Mock in-memory DB for cards
let mockCards: Card[] = []

const cards = ref<Card[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Intervalles Leitner en jours (compartiment 1 à 6)
const LEITNER_INTERVALS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
  6: 30,
}

  /**
   * Retourne les cartes à réviser aujourd'hui pour une collection donnée (compartment < 6).
   * @param collectionId string
   */
  const getDueCards = (collectionId: string) => {
    const now = Date.now()
    return [...mockCards]
      .filter(card =>
        card.collection_id === collectionId &&
        !card.deleted_at &&
        card.next_review_at <= now &&
        (card.compartment ?? 1) < 6
      )
      .sort((a, b) => {
        if (a.next_review_at !== b.next_review_at) return a.next_review_at - b.next_review_at
        return a.created_at - b.created_at
      })
  }

  /**
   * Retourne toutes les cartes dues aujourd'hui (toutes collections confondues).
   */
  const getCardsDueToday = () => {
    const now = Date.now()
    return [...mockCards]
      .filter(card =>
        !card.deleted_at &&
        card.next_review_at <= now &&
        (card.compartment ?? 1) < 6
      )
      .sort((a, b) => {
        if (a.next_review_at !== b.next_review_at) return a.next_review_at - b.next_review_at
        return a.created_at - b.created_at
      })
  }

  /**
   * Applique la réponse Leitner à une carte et met à jour son état.
   * @param card Card
   * @param response 'false' | 'almost' | 'true'
   */
  const applyAnswer = (card: Card, response: 'false' | 'almost' | 'true') => {
    const idx = mockCards.findIndex(c => c.id === card.id && !c.deleted_at)
    if (idx === -1) throw new Error('Carte introuvable')
    let compartment = mockCards[idx].compartment ?? 1
    if (response === 'false') {
      compartment = 1
    } else if (response === 'almost') {
      compartment = Math.min(compartment + 1, 6)
    } else if (response === 'true') {
      compartment = Math.min(compartment + 1, 6)
    }
    mockCards[idx].compartment = compartment
    // next_review_at = now + interval[compartment] (en jours)
    const now = Date.now()
    const intervalDays = LEITNER_INTERVALS[compartment] ?? 0
    mockCards[idx].next_review_at = now + intervalDays * 24 * 60 * 60 * 1000
    mockCards[idx].updated_at = now
    // Met à jour la liste réactive
    const collectionId = mockCards[idx].collection_id
    cards.value = [...mockCards]
      .filter(c => c.collection_id === collectionId && !c.deleted_at)
      .sort((a, b) => b.created_at - a.created_at)
  }

export const useCards = () => {
  const loadCards = async (collectionId: string) => {
    isLoading.value = true
    error.value = null
    // Simule un chargement réseau
    await new Promise((resolve) => setTimeout(resolve, 100))
    cards.value = [...mockCards]
      .filter(c => c.collection_id === collectionId && !c.deleted_at)
      .sort((a, b) => b.created_at - a.created_at)
    isLoading.value = false
  }

  const getCard = (id: string): Card | null => (
    cards.value.find(c => c.id === id && !c.deleted_at) ?? null
  )

  const createCard = async (front: string, back: string, collectionId: string): Promise<Card> => {
    error.value = null
    
    // Validation
    if (!front.trim()) {
      throw new Error('Le recto de la carte est obligatoire')
    }
    if (!back.trim()) {
      throw new Error('Le verso de la carte est obligatoire')
    }
    
    const now = Date.now()
    const newCard: Card = {
      id: uuidv4(),
      question: front.trim(), // front -> question pour compatibilité
      answer: back.trim(), // back -> answer pour compatibilité
      collection_id: collectionId,
      user_id: 'mock-user',
      created_at: now,
      updated_at: now,
      compartment: 1,
      next_review_at: now,
      archived: false
    }
    
    mockCards.unshift(newCard)
    cards.value = [...mockCards]
      .filter(c => c.collection_id === collectionId && !c.deleted_at)
      .sort((a, b) => b.created_at - a.created_at)
    
    return newCard
  }

  const updateCard = async (id: string, front: string, back: string): Promise<void> => {
    error.value = null
    
    // Validation
    if (!front.trim()) {
      throw new Error('Le recto de la carte est obligatoire')
    }
    if (!back.trim()) {
      throw new Error('Le verso de la carte est obligatoire')
    }
    
    const idx = mockCards.findIndex(c => c.id === id && !c.deleted_at)
    if (idx === -1) throw new Error('Carte introuvable')
    
    mockCards[idx].question = front.trim() // front -> question pour compatibilité
    mockCards[idx].answer = back.trim() // back -> answer pour compatibilité
    mockCards[idx].updated_at = Date.now()
    
    const collectionId = mockCards[idx].collection_id
    cards.value = [...mockCards]
      .filter(c => c.collection_id === collectionId && !c.deleted_at)
      .sort((a, b) => b.created_at - a.created_at)
  }

  const deleteCard = async (id: string): Promise<void> => {
    error.value = null
    const idx = mockCards.findIndex(c => c.id === id && !c.deleted_at)
    if (idx === -1) throw new Error('Carte introuvable')
    
    mockCards[idx].deleted_at = Date.now()
    const collectionId = mockCards[idx].collection_id
    cards.value = [...mockCards]
      .filter(c => c.collection_id === collectionId && !c.deleted_at)
      .sort((a, b) => b.created_at - a.created_at)
  }

  const getCardsCount = (collectionId: string): number =>
    mockCards.filter(c => c.collection_id === collectionId && !c.deleted_at).length

  const getLastCardDate = (collectionId: string): Date | null => {
    const collectionCards = mockCards
      .filter(c => c.collection_id === collectionId && !c.deleted_at)
      .sort((a, b) => b.created_at - a.created_at)
    
    return collectionCards.length > 0 ? new Date(collectionCards[0].created_at) : null
  }

  // Reset function for testing
  const resetCards = () => {
    mockCards = []
    cards.value = []
    error.value = null
    isLoading.value = false
  }

  /**
   * Compte le nombre de cartes dans un compartiment donné pour une collection.
   * @param collectionId string
   * @param compartment number (1-6)
   */
  const countCardsPerCompartment = (collectionId: string, compartment: number): number =>
    mockCards.filter(c => c.collection_id === collectionId && !c.deleted_at && (c.compartment ?? 1) === compartment).length

  return {
    cards: readonly(cards),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadCards,
    getCard,
    createCard,
    updateCard,
    deleteCard,
    getCardsCount,
    getLastCardDate,
    resetCards,
    getDueCards,
    getCardsDueToday,
    applyAnswer,
    countCardsPerCompartment
  }
}