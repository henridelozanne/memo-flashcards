import { ref, readonly } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Collection } from '~/lib/types'
import { Capacitor } from '@capacitor/core'

const collections = ref<Collection[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Helper function to get DB connection (only on native platform)
async function getDbConnection() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Database only available on native platform')
  }
  
  const { default: openDatabase } = await import('~/lib/sqlite')
  const db = await openDatabase('memoflash')
  
  // Initialize tables if needed
  await db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default-user',
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER
    )
  `)
  
  return db
}

export const useCollections = () => {
  const loadCollections = async () => {
    isLoading.value = true
    error.value = null
    try {
      if (Capacitor.isNativePlatform()) {
        // Mode natif - utiliser SQLite
        const db = await getDbConnection()
        const result = await db.all<Collection>('SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY updated_at DESC')
        collections.value = result
      } else {
        // Mode web - utiliser localStorage comme fallback temporaire
        const stored = localStorage.getItem('memo_collections')
        collections.value = stored ? JSON.parse(stored) : []
      }
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

      if (Capacitor.isNativePlatform()) {
        // Mode natif - utiliser SQLite
        const db = await getDbConnection()
        
        // Check if collection already exists
        const existing = await db.get<{ count: number }>(
          'SELECT COUNT(*) as count FROM collections WHERE name = ? AND deleted_at IS NULL', 
          [name.trim()]
        )
        if (existing && existing.count > 0) {
          throw new Error(`Collection "${name}" already exists`)
        }

        await db.run(
          'INSERT INTO collections (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [newCollection.id, newCollection.user_id, newCollection.name, newCollection.created_at, newCollection.updated_at]
        )
      } else {
        // Mode web - utiliser localStorage
        const stored = localStorage.getItem('memo_collections')
        const existing = stored ? JSON.parse(stored) : []
        
        // Check duplicates
        if (existing.some((c: Collection) => c.name.toLowerCase() === name.trim().toLowerCase() && !c.deleted_at)) {
          throw new Error(`Collection "${name}" already exists`)
        }
        
        existing.unshift(newCollection)
        localStorage.setItem('memo_collections', JSON.stringify(existing))
      }
      
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
      if (Capacitor.isNativePlatform()) {
        // Mode natif - utiliser SQLite
        const db = await getDbConnection()
        
        // Check if another collection with this name exists
        const existing = await db.get<{ count: number }>(
          'SELECT COUNT(*) as count FROM collections WHERE name = ? AND id != ? AND deleted_at IS NULL', 
          [name.trim(), id]
        )
        if (existing && existing.count > 0) {
          throw new Error(`Collection "${name}" already exists`)
        }

        await db.run(
          'UPDATE collections SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
          [name.trim(), Date.now(), id]
        )
      } else {
        // Mode web - utiliser localStorage
        const stored = localStorage.getItem('memo_collections')
        const collections = stored ? JSON.parse(stored) : []
        
        const idx = collections.findIndex((c: Collection) => c.id === id && !c.deleted_at)
        if (idx === -1) throw new Error('Collection not found')
        
        // Check duplicates
        if (collections.some((c: Collection) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== id && !c.deleted_at)) {
          throw new Error(`Collection "${name}" already exists`)
        }
        
        collections[idx].name = name.trim()
        collections[idx].updated_at = Date.now()
        localStorage.setItem('memo_collections', JSON.stringify(collections))
      }
      
      await loadCollections()
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à jour'
      throw e
    }
  }

  const deleteCollection = async (id: string): Promise<void> => {
    error.value = null
    try {
      if (Capacitor.isNativePlatform()) {
        // Mode natif - utiliser SQLite
        const db = await getDbConnection()
        await db.run(
          'UPDATE collections SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL',
          [Date.now(), id]
        )
      } else {
        // Mode web - utiliser localStorage
        const stored = localStorage.getItem('memo_collections')
        const collections = stored ? JSON.parse(stored) : []
        
        const idx = collections.findIndex((c: Collection) => c.id === id && !c.deleted_at)
        if (idx === -1) throw new Error('Collection not found')
        
        collections[idx].deleted_at = Date.now()
        localStorage.setItem('memo_collections', JSON.stringify(collections))
      }
      
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