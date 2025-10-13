import { ref, readonly } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Collection } from '~/lib/types'

const collections = ref<Collection[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Shared database connection
let dbConnection: any = null

// Helper function to get DB connection
async function getDbConnection() {
  // Use existing connection if available
  if (dbConnection) {
    return dbConnection
  }
  
  const { default: openDatabase } = await import('~/lib/sqlite')
  dbConnection = await openDatabase('memoflash')
  
  // Initialize tables if needed
  await dbConnection.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default-user',
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER
    )
  `)
  
  return dbConnection
}

export const useCollections = () => {
  const loadCollections = async () => {
    isLoading.value = true
    error.value = null
    try {
      const db = await getDbConnection()
      const result = await db.all('SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY updated_at DESC') as Collection[]
      collections.value = result
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des collections'
    } finally {
      isLoading.value = false
    }
  }

  const getCollection = (id: string): Collection | null => (
    collections.value.find(c => c.id === id && !c.deleted_at) ?? null
  )

  const createCollection = async (name: string): Promise<Collection> => {
    error.value = null
    try {
      const newCollection: Collection = {
        id: uuidv4(),
        user_id: 'default-user',
        name: name.trim(),
        created_at: Date.now(),
        updated_at: Date.now(),
      }

      const db = await getDbConnection()
      
      // Check if collection already exists
      const existing = await db.get(
        'SELECT COUNT(*) as count FROM collections WHERE name = ? AND deleted_at IS NULL', 
        [name.trim()]
      ) as { count: number } | undefined
      if (existing && existing.count > 0) {
        throw new Error(`Collection "${name}" already exists`)
      }

      await db.run(
        'INSERT INTO collections (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [newCollection.id, newCollection.user_id, newCollection.name, newCollection.created_at, newCollection.updated_at]
      )
      
      await loadCollections()
      return newCollection
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la création'
      throw e
    }
  }

  const updateCollection = async (id: string, name: string): Promise<void> => {
    error.value = null
    try {
      const db = await getDbConnection()
      
      // Check if another collection with this name exists
      const existing = await db.get(
        'SELECT COUNT(*) as count FROM collections WHERE name = ? AND id != ? AND deleted_at IS NULL', 
        [name.trim(), id]
      ) as { count: number } | undefined
      if (existing && existing.count > 0) {
        throw new Error(`Collection "${name}" already exists`)
      }

      await db.run(
        'UPDATE collections SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
        [name.trim(), Date.now(), id]
      )
      
      await loadCollections()
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à jour'
      throw e
    }
  }

  const deleteCollection = async (id: string): Promise<void> => {
    error.value = null
    try {
      const db = await getDbConnection()
      const now = Date.now()
      
      // Supprimer d'abord toutes les cartes de la collection
      await db.run(
        'UPDATE cards SET deleted_at = ? WHERE collection_id = ? AND deleted_at IS NULL',
        [now, id]
      )
      
      // Puis supprimer la collection
      await db.run(
        'UPDATE collections SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL',
        [now, id]
      )
      
      await loadCollections()
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la suppression'
      throw e
    }
  }

  // Reset function for testing
  const resetCollections = () => {
    collections.value = []
    error.value = null
    isLoading.value = false
  }

  return {
    collections: readonly(collections),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    resetCollections
  }
}