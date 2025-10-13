import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCollections } from '~/composables/useCollections'

// Mock the SQLite connection for testing
const mockSqliteConnection = {
  exec: vi.fn(),
  run: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
  close: vi.fn()
}

vi.mock('~/lib/sqlite', () => ({
  default: vi.fn(() => mockSqliteConnection)
}))

// Mock UUID pour des tests déterministes
let mockUuidCounter = 0
vi.mock('uuid', () => ({
  v4: () => {
    mockUuidCounter += 1
    return `mock-uuid-${mockUuidCounter}`
  }
}))

describe('useCollections', () => {
  let composable: ReturnType<typeof useCollections>

  beforeEach(() => {
    // Reset UUID counter
    mockUuidCounter = 0
    
    // Créer une nouvelle instance du composable pour chaque test
    composable = useCollections()
    // Reset les données mockées
    composable.resetCollections()
    
    // Setup default SQLite mocks
    vi.clearAllMocks()
    mockSqliteConnection.exec.mockResolvedValue(undefined)
    mockSqliteConnection.run.mockResolvedValue(undefined)
    mockSqliteConnection.get.mockResolvedValue({ count: 0 })
    mockSqliteConnection.all.mockResolvedValue([])
  })

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      // Mock successful creation
      mockSqliteConnection.get.mockResolvedValue({ count: 0 }) // No duplicate
      mockSqliteConnection.all.mockResolvedValue([{
        id: 'mock-uuid-1',
        user_id: 'default-user',
        name: 'Test Collection',
        created_at: expect.any(Number),
        updated_at: expect.any(Number)
      }])
      
      const collection = await composable.createCollection('Test Collection')

      expect(collection).toEqual({
        id: 'mock-uuid-1',
        user_id: 'default-user',
        name: 'Test Collection',
        created_at: expect.any(Number),
        updated_at: expect.any(Number)
      })

      // Verify SQLite calls
      expect(mockSqliteConnection.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM collections WHERE name = ? AND deleted_at IS NULL',
        ['Test Collection']
      )
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        'INSERT INTO collections (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        ['mock-uuid-1', 'default-user', 'Test Collection', expect.any(Number), expect.any(Number)]
      )
    })

    it('should throw error for duplicate collection names', async () => {
      // Mock duplicate found
      mockSqliteConnection.get.mockResolvedValue({ count: 1 })
      
      await expect(composable.createCollection('Duplicate')).rejects.toThrow(
        'Collection "Duplicate" already exists'
      )
    })
  })

  describe('updateCollection', () => {
    it('should update an existing collection', async () => {
      // Mock no duplicate for update
      mockSqliteConnection.get.mockResolvedValue({ count: 0 })
      
      await composable.updateCollection('test-id', 'Updated')
      
      // Verify SQLite calls
      expect(mockSqliteConnection.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM collections WHERE name = ? AND id != ? AND deleted_at IS NULL',
        ['Updated', 'test-id']
      )
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        'UPDATE collections SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
        ['Updated', expect.any(Number), 'test-id']
      )
    })
  })

  describe('deleteCollection', () => {
    it('should soft delete a collection', async () => {
      await composable.deleteCollection('test-id')
      
      // Verify SQLite calls
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        'UPDATE collections SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL',
        [expect.any(Number), 'test-id']
      )
    })
  })
})