import { ref, readonly } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Card } from '~/lib/types'
import { useDatabase } from './useDatabase'
import { useDailyReview } from './useDailyReview'
import { syncCardsToRemote } from '~/lib/sync'
import useSupabaseAuth from './useSupabaseAuth'
import { appConfig } from '~/config/app'

const cards = ref<Card[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Intervalles Leitner en jours (compartiment 1 à 5)
const LEITNER_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
}

export const useCards = () => {
  const { getDbConnection } = useDatabase()

  const loadCards = async (collectionId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const db = await getDbConnection()
      const result = await db.all<Card>(
        `
        SELECT * FROM cards 
        WHERE collection_id = ? AND deleted_at IS NULL 
        ORDER BY created_at DESC
      `,
        [collectionId]
      )
      cards.value = result
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des cartes'
    } finally {
      isLoading.value = false
    }
  }

  const getCard = (id: string): Card | null => cards.value.find((c) => c.id === id && !c.deleted_at) ?? null

  const createCard = async (front: string, back: string, collectionId: string): Promise<Card> => {
    error.value = null

    // Validation
    if (!front.trim()) {
      throw new Error('Le recto de la carte est obligatoire')
    }
    if (!back.trim()) {
      throw new Error('Le verso de la carte est obligatoire')
    }

    const { getCurrentUserId } = useSupabaseAuth()
    const userId = await getCurrentUserId()

    const now = Date.now()
    const card: Card = {
      id: uuidv4(),
      question: front.trim(),
      answer: back.trim(),
      collection_id: collectionId,
      user_id: userId,
      created_at: now,
      updated_at: now,
      compartment: 1,
      // Si immediateReviewForNewCards est activé, la prochaine révision est maintenant, sinon demain
      next_review_at: appConfig.immediateReviewForNewCards ? now : now + 24 * 60 * 60 * 1000,
      archived: false,
      correct_answers: 0,
      total_reviews: 0,
    }

    const db = await getDbConnection()
    await db.run(
      `
      INSERT INTO cards (id, user_id, collection_id, question, answer, compartment, next_review_at, created_at, updated_at, archived, correct_answers, total_reviews)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        card.id,
        card.user_id,
        card.collection_id,
        card.question,
        card.answer,
        card.compartment,
        card.next_review_at,
        card.created_at,
        card.updated_at,
        card.archived ? 1 : 0,
        card.correct_answers ?? 0,
        card.total_reviews ?? 0,
      ]
    )

    // Recharger les cartes depuis la base pour mettre à jour la liste réactive
    const result = await db.all<Card>(
      `
      SELECT * FROM cards 
      WHERE collection_id = ? AND deleted_at IS NULL 
      ORDER BY created_at DESC
    `,
      [collectionId]
    )
    cards.value = result

    // Sync to Supabase (non-blocking)
    syncCardsToRemote().catch((err) => {
      console.error('Failed to sync card creation to remote:', err)
    })

    return card
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

    const db = await getDbConnection()

    // Vérifier que la carte existe
    const existing = await db.get<Card>('SELECT * FROM cards WHERE id = ? AND deleted_at IS NULL', [id])
    if (!existing) throw new Error('Carte introuvable')

    // Mettre à jour la carte
    await db.run(
      `
      UPDATE cards 
      SET question = ?, answer = ?, updated_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `,
      [front.trim(), back.trim(), Date.now(), id]
    )

    // Recharger les cartes pour la collection
    const result = await db.all<Card>(
      `
      SELECT * FROM cards 
      WHERE collection_id = ? AND deleted_at IS NULL 
      ORDER BY created_at DESC
    `,
      [existing.collection_id]
    )
    cards.value = result

    // Sync to Supabase (non-blocking)
    syncCardsToRemote().catch((err) => {
      console.error('Failed to sync card update to remote:', err)
    })
  }

  const deleteCard = async (id: string): Promise<void> => {
    error.value = null

    const db = await getDbConnection()

    // Vérifier que la carte existe et récupérer la collection_id
    const existing = await db.get<Card>('SELECT * FROM cards WHERE id = ? AND deleted_at IS NULL', [id])
    if (!existing) throw new Error('Carte introuvable')

    // Marquer comme supprimée (soft delete)
    const now = Date.now()
    await db.run(
      `
      UPDATE cards 
      SET deleted_at = ?, updated_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `,
      [now, now, id]
    )

    // Recharger les cartes pour la collection
    const result = await db.all<Card>(
      `
      SELECT * FROM cards 
      WHERE collection_id = ? AND deleted_at IS NULL 
      ORDER BY created_at DESC
    `,
      [existing.collection_id]
    )
    cards.value = result

    // Sync to Supabase (non-blocking)
    syncCardsToRemote().catch((err) => {
      console.error('Failed to sync card deletion to remote:', err)
    })
  }

  const getDueCards = async (collectionId: string) => {
    const now = Date.now()
    try {
      const db = await getDbConnection()
      const result = await db.all<Card>(
        `
      SELECT * FROM cards 
      WHERE collection_id = ?
      AND deleted_at IS NULL 
      AND next_review_at <= ? 
      AND compartment < 5
      AND archived = 0
      ORDER BY next_review_at ASC, created_at ASC
    `,
        [collectionId, now]
      )
      return result
    } catch (e: any) {
      console.error('Erreur lors du chargement des cartes dues:', e)
      return []
    }
  }

  const getAllCardsFromCollection = async (collectionId: string) => {
    try {
      const db = await getDbConnection()
      const result = await db.all<Card>(
        `
      SELECT * FROM cards 
      WHERE collection_id = ?
      AND deleted_at IS NULL 
      AND archived = 0
      ORDER BY created_at ASC
    `,
        [collectionId]
      )
      return result
    } catch (e: any) {
      console.error('Erreur lors du chargement de toutes les cartes:', e)
      return []
    }
  }

  const getCardsDueToday = async () => {
    const now = Date.now()

    try {
      const db = await getDbConnection()
      const result = await db.all<Card>(
        `
      SELECT * FROM cards 
      WHERE deleted_at IS NULL 
      AND next_review_at <= ? 
      AND compartment < 5
      AND archived = 0
      ORDER BY next_review_at ASC, created_at ASC
    `,
        [now]
      )
      return result
    } catch (e: any) {
      console.error('Erreur lors du chargement des cartes:', e)
      return []
    }
  }

  const applyAnswer = async (card: Card, response: boolean) => {
    const db = await getDbConnection()

    // Calculer le nouveau compartiment
    let compartment = card.compartment ?? 1
    if (response === false) {
      compartment = 1
    } else {
      compartment = Math.min(compartment + 1, 5)
    }

    // Calculer la prochaine révision
    const now = Date.now()
    const intervalDays = LEITNER_INTERVALS[compartment] ?? 1
    const nextReviewAt = now + intervalDays * 24 * 60 * 60 * 1000

    // Mettre à jour en base
    await db.run(
      `
    UPDATE cards 
    SET compartment = ?, next_review_at = ?, updated_at = ?, correct_answers = correct_answers + ?, total_reviews = total_reviews + 1
    WHERE id = ? AND deleted_at IS NULL
  `,
      [compartment, nextReviewAt, now, response ? 1 : 0, card.id]
    )

    // Incrémenter le compteur de cartes répondues
    const { incrementAnsweredCardsCount } = useDailyReview()
    await incrementAnsweredCardsCount()

    // Sync to Supabase (non-blocking)
    syncCardsToRemote().catch((err) => {
      console.error('Failed to sync card review to remote:', err)
    })
  }

  const getCardsCount = async (collectionId: string): Promise<number> => {
    try {
      const db = await getDbConnection()
      const result = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM cards WHERE collection_id = ? AND deleted_at IS NULL',
        [collectionId]
      )
      return result?.count || 0
    } catch (e) {
      console.error('Erreur lors du comptage des cartes:', e)
      return 0
    }
  }

  const getLastCardDate = async (collectionId: string): Promise<Date | null> => {
    try {
      const db = await getDbConnection()
      const result = await db.get<{ created_at: number }>(
        'SELECT created_at FROM cards WHERE collection_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1',
        [collectionId]
      )
      return result ? new Date(result.created_at) : null
    } catch (e) {
      console.error('Erreur lors de la récupération de la dernière carte:', e)
      return null
    }
  }

  // Reset function for testing
  const resetCards = () => {
    cards.value = []
    error.value = null
    isLoading.value = false
  }

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
    getDueCards,
    getAllCardsFromCollection,
    getCardsDueToday,
    applyAnswer,
    resetCards,
  }
}
