import { ref, readonly } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Collection } from '~/lib/types'
import { useDatabase } from './useDatabase'
import { syncCollectionsToRemote } from '~/lib/sync'
import useSupabaseAuth from './useSupabaseAuth'
import { usePosthog } from './usePosthog'

const collections = ref<Collection[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const { getDbConnection } = useDatabase()

export const useCollections = () => {
  const loadCollections = async () => {
    isLoading.value = true
    error.value = null
    try {
      const db = await getDbConnection()
      const result = (await db.all(
        'SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY updated_at DESC'
      )) as Collection[]
      collections.value = result
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des collections'
    } finally {
      isLoading.value = false
    }
  }

  const getCollection = (id: string): Collection | null =>
    collections.value.find((c) => c.id === id && !c.deleted_at) ?? null

  const createCollection = async (name: string): Promise<Collection> => {
    error.value = null
    try {
      const { getCurrentUserId } = useSupabaseAuth()
      const userId = await getCurrentUserId()

      const newCollection: Collection = {
        id: uuidv4(),
        user_id: userId,
        name: name.trim(),
        created_at: Date.now(),
        updated_at: Date.now(),
      }

      const db = await getDbConnection()

      // Check if collection already exists
      const existing = (await db.get(
        'SELECT COUNT(*) as count FROM collections WHERE name = ? AND deleted_at IS NULL',
        [name.trim()]
      )) as { count: number } | undefined
      if (existing && existing.count > 0) {
        throw new Error(`Collection "${name}" already exists`)
      }

      await db.run('INSERT INTO collections (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [
        newCollection.id,
        newCollection.user_id,
        newCollection.name,
        newCollection.created_at,
        newCollection.updated_at,
      ])

      // Sync to Supabase (non-blocking)
      syncCollectionsToRemote().catch((err) => {
        console.error('Failed to sync collection creation to remote:', err)
      })

      await loadCollections()

      // Track event
      const posthog = usePosthog()
      posthog.capture('collection_created', {
        collection_id: newCollection.id,
        collection_name_length: newCollection.name.length,
      })

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
      const existing = (await db.get(
        'SELECT COUNT(*) as count FROM collections WHERE name = ? AND id != ? AND deleted_at IS NULL',
        [name.trim(), id]
      )) as { count: number } | undefined
      if (existing && existing.count > 0) {
        throw new Error(`Collection "${name}" already exists`)
      }

      await db.run('UPDATE collections SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL', [
        name.trim(),
        Date.now(),
        id,
      ])

      // Sync to Supabase (non-blocking)
      syncCollectionsToRemote().catch((err) => {
        console.error('Failed to sync collection update to remote:', err)
      })

      await loadCollections()

      // Track event
      const posthog = usePosthog()
      posthog.capture('collection_updated', {
        collection_id: id,
        new_name_length: name.length,
      })
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
      await db.run('UPDATE cards SET deleted_at = ?, updated_at = ? WHERE collection_id = ? AND deleted_at IS NULL', [
        now,
        now,
        id,
      ])

      // Puis supprimer la collection
      await db.run('UPDATE collections SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL', [
        now,
        now,
        id,
      ])

      // Sync to Supabase (non-blocking)
      syncCollectionsToRemote().catch((err) => {
        console.error('Failed to sync collection deletion to remote:', err)
      })

      await loadCollections()

      // Track event
      const posthog = usePosthog()
      posthog.capture('collection_deleted', {
        collection_id: id,
      })
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
    resetCollections,
  }
}
