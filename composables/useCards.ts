import { ref, readonly } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Card } from '~/lib/types'
import { useDatabase } from './useDatabase'

const cards = ref<Card[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const { getDbConnection } = useDatabase()

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
const getDueCards = async (collectionId: string) => {
  const now = Date.now()
  try {
    const db = await getDbConnection()
    const result = await db.all<Card>(`
      SELECT * FROM cards 
      WHERE collection_id = ?
      AND deleted_at IS NULL 
      AND next_review_at <= ? 
      AND compartment < 6
      AND archived = 0
      ORDER BY next_review_at ASC, created_at ASC
    `, [collectionId, now])
    return result
  } catch (e: any) {
    console.error('Erreur lors du chargement des cartes dues:', e)
    return []
  }
}

/**
 * Retourne toutes les cartes d'une collection (pour révision libre, indépendamment des intervalles).
 * @param collectionId string
 */
const getAllCards = async (collectionId: string) => {
  try {
    const db = await getDbConnection()
    const result = await db.all<Card>(`
      SELECT * FROM cards 
      WHERE collection_id = ?
      AND deleted_at IS NULL 
      AND archived = 0
      ORDER BY created_at ASC
    `, [collectionId])
    return result
  } catch (e: any) {
    console.error('Erreur lors du chargement de toutes les cartes:', e)
    return []
  }
}

/**
 * Retourne toutes les cartes dues aujourd'hui (toutes collections confondues).
 */
const getCardsDueToday = async () => {
  const now = Date.now()
  
  try {
    const db = await getDbConnection()
    const result = await db.all<Card>(`
      SELECT * FROM cards 
      WHERE deleted_at IS NULL 
      AND next_review_at <= ? 
      AND compartment < 6
      AND archived = 0
      ORDER BY next_review_at ASC, created_at ASC
    `, [now])
    return result
  } catch (e: any) {
    console.error('Erreur lors du chargement des cartes:', e)
    return []
  }
}

/**
 * Applique la réponse Leitner à une carte et met à jour son état.
 * @param card Card
 * @param response 'false' | 'almost' | 'true'
 */
const applyAnswer = async (card: Card, response: 'false' | 'almost' | 'true') => {
  const db = await getDbConnection()
  
  // Calculer le nouveau compartiment
  let compartment = card.compartment ?? 1
  if (response === 'false') {
    compartment = 1
  } else if (response === 'almost') {
    compartment = Math.min(compartment + 1, 6)
  } else if (response === 'true') {
    compartment = Math.min(compartment + 1, 6)
  }
  
  // Calculer la prochaine révision
  const now = Date.now()
  const intervalDays = LEITNER_INTERVALS[compartment] ?? 0
  const nextReviewAt = now + intervalDays * 24 * 60 * 60 * 1000
  
  // Mettre à jour en base
  await db.run(`
    UPDATE cards 
    SET compartment = ?, next_review_at = ?, updated_at = ?
    WHERE id = ? AND deleted_at IS NULL
  `, [compartment, nextReviewAt, now, card.id])
}

export const useCards = () => {
  const loadCards = async (collectionId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const db = await getDbConnection()
      const result = await db.all<Card>(`
        SELECT * FROM cards 
        WHERE collection_id = ? AND deleted_at IS NULL 
        ORDER BY created_at DESC
      `, [collectionId])
      cards.value = result
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des cartes'
    } finally {
      isLoading.value = false
    }
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
    const card: Card = {
      id: uuidv4(),
      question: front.trim(), // front -> question pour compatibilité
      answer: back.trim(), // back -> answer pour compatibilité
      collection_id: collectionId,
      user_id: 'default-user',
      created_at: now,
      updated_at: now,
      compartment: 1,
      next_review_at: now,
      archived: false
    }
    
    const db = await getDbConnection()
    await db.run(`
      INSERT INTO cards (id, user_id, collection_id, question, answer, compartment, next_review_at, created_at, updated_at, archived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [card.id, card.user_id, card.collection_id, card.question, card.answer, card.compartment, card.next_review_at, card.created_at, card.updated_at, card.archived ? 1 : 0])
      
    // Recharger les cartes depuis la base pour mettre à jour la liste réactive
    const result = await db.all<Card>(`
      SELECT * FROM cards 
      WHERE collection_id = ? AND deleted_at IS NULL 
      ORDER BY created_at DESC
    `, [collectionId])
    cards.value = result
    
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
    
    let db = await getDbConnection()
    
    // Vérifier que la carte existe
    const existing = await db.get<Card>(
      'SELECT * FROM cards WHERE id = ? AND deleted_at IS NULL',
      [id]
    )
    if (!existing) throw new Error('Carte introuvable')
    
    // Fermer et rouvrir la connexion pour éviter les conflits
    await db.close()
    db = await getDbConnection()
    
    // Mettre à jour la carte
    await db.run(`
      UPDATE cards 
      SET question = ?, answer = ?, updated_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `, [front.trim(), back.trim(), Date.now(), id])
    
    // Fermer et rouvrir encore pour le rechargement
    await db.close()
    db = await getDbConnection()
    
    // Recharger les cartes pour la collection
    const result = await db.all<Card>(`
      SELECT * FROM cards 
      WHERE collection_id = ? AND deleted_at IS NULL 
      ORDER BY created_at DESC
    `, [existing.collection_id])
    cards.value = result
    
    // Fermer la connexion finale
    await db.close()
  }

  const deleteCard = async (id: string): Promise<void> => {
    error.value = null
    
    let db = await getDbConnection()
    
    // Vérifier que la carte existe et récupérer la collection_id
    const existing = await db.get<Card>(
      'SELECT * FROM cards WHERE id = ? AND deleted_at IS NULL',
      [id]
    )
    if (!existing) throw new Error('Carte introuvable')
    
    // Fermer et rouvrir la connexion
    await db.close()
    db = await getDbConnection()
    
    // Marquer comme supprimée (soft delete)
    await db.run(`
      UPDATE cards 
      SET deleted_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `, [Date.now(), id])
    
    // Fermer et rouvrir pour le rechargement
    await db.close()
    db = await getDbConnection()
    
    // Recharger les cartes pour la collection
    const result = await db.all<Card>(`
      SELECT * FROM cards 
      WHERE collection_id = ? AND deleted_at IS NULL 
      ORDER BY created_at DESC
    `, [existing.collection_id])
    cards.value = result
    
    // Fermer la connexion finale
    await db.close()
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

  /**
   * Compte le nombre de cartes dans un compartiment donné pour une collection.
   * @param collectionId string
   * @param compartment number (1-6)
   */
  const countCardsPerCompartment = async (collectionId: string, compartment: number): Promise<number> => {
    try {
      const db = await getDbConnection()
      const result = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM cards WHERE collection_id = ? AND deleted_at IS NULL AND compartment = ?',
        [collectionId, compartment]
      )
      return result?.count || 0
    } catch (e) {
      console.error('Erreur lors du comptage des cartes par compartiment:', e)
      return 0
    }
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
    getAllCards,
    getCardsDueToday,
    applyAnswer,
    countCardsPerCompartment,
    resetCards
  }
}