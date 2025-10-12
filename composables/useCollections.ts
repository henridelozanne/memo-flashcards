import { ref, readonly } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Collection } from '~/lib/types'

// Mock in-memory DB
let mockCollections: Collection[] = []

const collections = ref<Collection[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

export const useCollections = () => {
  const loadCollections = async () => {
    isLoading.value = true
    error.value = null
    // Simule un chargement réseau
    await new Promise((resolve) => setTimeout(resolve, 200))
    collections.value = [...mockCollections].filter(c => !c.deleted_at).sort((a, b) => b.updated_at - a.updated_at)
    isLoading.value = false
  }

  const getCollection = (id: string): Collection | null => (
    collections.value.find(c => c.id === id && !c.deleted_at) ?? null
  )

  const createCollection = async (name: string): Promise<Collection> => {
    error.value = null
    // Unicité du nom
    if (mockCollections.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase() && !c.deleted_at)) {
      throw new Error('Collection with this name already exists')
    }
    const now = Date.now()
    const newCollection: Collection = {
      id: uuidv4(),
      user_id: 'mock-user',
      name: name.trim(),
      created_at: now,
      updated_at: now
    }
    mockCollections.unshift(newCollection)
    collections.value = [...mockCollections].filter(c => !c.deleted_at).sort((a, b) => b.updated_at - a.updated_at)
    return newCollection
  }

  const updateCollection = async (id: string, name: string): Promise<void> => {
    error.value = null
    const idx = mockCollections.findIndex(c => c.id === id && !c.deleted_at)
    if (idx === -1) throw new Error('Collection not found')
    if (mockCollections.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase() && c.id !== id && !c.deleted_at)) {
      throw new Error('Collection with this name already exists')
    }
    mockCollections[idx].name = name.trim()
    mockCollections[idx].updated_at = Date.now()
    collections.value = [...mockCollections].filter(c => !c.deleted_at).sort((a, b) => b.updated_at - a.updated_at)
  }

  const deleteCollection = async (id: string): Promise<void> => {
    error.value = null
    const idx = mockCollections.findIndex(c => c.id === id && !c.deleted_at)
    if (idx === -1) throw new Error('Collection not found')
    mockCollections[idx].deleted_at = Date.now()
    collections.value = [...mockCollections].filter(c => !c.deleted_at).sort((a, b) => b.updated_at - a.updated_at)
  }

  // Reset function for testing
  const resetCollections = () => {
    mockCollections = []
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