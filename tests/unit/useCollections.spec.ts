import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCollections } from '~/composables/useCollections'

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

// Mock UUID pour des tests déterministes
vi.mock('uuid', () => ({
  v4: vi.fn(() => `mock-uuid-${Date.now()}`)
}))

describe('useCollections', () => {
  let composable: ReturnType<typeof useCollections>

  beforeEach(() => {
    // Créer une nouvelle instance du composable pour chaque test
    composable = useCollections()
    // Reset les données mockées
    composable.resetCollections()
    // Clear localStorage
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      const collection = await composable.createCollection('Test Collection')

      expect(collection).toEqual({
        id: expect.stringMatching(/^mock-uuid-/),
        user_id: 'default-user',
        name: 'Test Collection',
        created_at: expect.any(Number),
        updated_at: expect.any(Number)
      })

      expect(composable.collections.value).toHaveLength(1)
    })

    it('should throw error for duplicate collection names', async () => {
      await composable.createCollection('Duplicate')
      
      await expect(composable.createCollection('Duplicate')).rejects.toThrow(
        'Collection "Duplicate" already exists'
      )
    })
  })

  describe('updateCollection', () => {
    it('should update an existing collection', async () => {
      const collection = await composable.createCollection('Original')
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))
      
      await composable.updateCollection(collection.id, 'Updated')
      
      const updated = composable.getCollection(collection.id)
      expect(updated?.name).toBe('Updated')
      expect(updated?.updated_at).toBeGreaterThan(collection.created_at)
    })
  })

  describe('deleteCollection', () => {
    it('should soft delete a collection', async () => {
      const collection = await composable.createCollection('To Delete')
      
      await composable.deleteCollection(collection.id)
      
      expect(composable.collections.value).toHaveLength(0)
      expect(composable.getCollection(collection.id)).toBeNull()
    })
  })
})