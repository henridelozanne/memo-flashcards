import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCollections } from '~/composables/useCollections'

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
  })

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      const collection = await composable.createCollection('Test Collection')

      expect(collection).toEqual({
        id: expect.stringMatching(/^mock-uuid-/),
        user_id: 'mock-user',
        name: 'Test Collection',
        created_at: expect.any(Number),
        updated_at: expect.any(Number)
      })

      expect(composable.collections.value).toHaveLength(1)
    })

    it('should throw error for duplicate collection names', async () => {
      await composable.createCollection('Duplicate')
      
      await expect(composable.createCollection('Duplicate')).rejects.toThrow(
        'Collection with this name already exists'
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