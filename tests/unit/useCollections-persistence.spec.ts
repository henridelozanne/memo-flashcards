import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
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

describe('useCollections Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSqliteConnection.exec.mockResolvedValue(undefined)
    mockSqliteConnection.run.mockResolvedValue(undefined)
    mockSqliteConnection.get.mockResolvedValue({ count: 0 })
    mockSqliteConnection.all.mockResolvedValue([])
  })

  it('should initialize database table on first load', async () => {
    const { loadCollections } = useCollections()
    
    await loadCollections()
    
    // Verify table creation SQL was executed
    expect(mockSqliteConnection.exec).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS collections')
    )
  })

  it('should create collection and persist to SQLite', async () => {
    const { createCollection } = useCollections()
    
    // Mock that collection doesn't exist
    mockSqliteConnection.get.mockResolvedValue({ count: 0 })
    
    const collectionName = 'Test Collection'
    await createCollection(collectionName)
    
    // Verify INSERT query was called
    expect(mockSqliteConnection.run).toHaveBeenCalledWith(
      'INSERT INTO collections (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      expect.arrayContaining([
        expect.any(String), // id (UUID)
        'default-user',     // user_id
        collectionName,     // name
        expect.any(Number), // created_at
        expect.any(Number)  // updated_at
      ])
    )
  })

  it('should load collections from SQLite database', async () => {
    const mockCollections = [
      {
        id: '1',
        user_id: 'default-user',
        name: 'Test Collection 1',
        created_at: Date.now(),
        updated_at: Date.now()
      },
      {
        id: '2',
        user_id: 'default-user', 
        name: 'Test Collection 2',
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ]
    
    mockSqliteConnection.all.mockResolvedValue(mockCollections)
    
    const { loadCollections, collections } = useCollections()
    await loadCollections()
    await nextTick()
    
    // Verify SELECT query was called
    expect(mockSqliteConnection.all).toHaveBeenCalledWith(
      'SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY updated_at DESC'
    )
    
    // Verify collections are loaded
    expect(collections.value).toEqual(mockCollections)
  })

  it('should update collection in SQLite', async () => {
    const { updateCollection } = useCollections()
    
    const collectionId = 'test-id'
    const newName = 'Updated Collection'
    
    // Mock no duplicate name exists
    mockSqliteConnection.get.mockResolvedValue({ count: 0 })
    
    await updateCollection(collectionId, newName)
    
    // Verify UPDATE query was called
    expect(mockSqliteConnection.run).toHaveBeenCalledWith(
      'UPDATE collections SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
      [newName, expect.any(Number), collectionId]
    )
  })

  it('should soft delete collection in SQLite', async () => {
    const { deleteCollection } = useCollections()
    
    const collectionId = 'test-id'
    await deleteCollection(collectionId)
    
    // Verify soft delete UPDATE query was called
    expect(mockSqliteConnection.run).toHaveBeenCalledWith(
      'UPDATE collections SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL',
      [expect.any(Number), collectionId]
    )
  })

  it('should prevent duplicate collection names', async () => {
    const { createCollection } = useCollections()
    
    // Mock that collection already exists
    mockSqliteConnection.get.mockResolvedValue({ count: 1 })
    
    await expect(createCollection('Existing Collection')).rejects.toThrow(
      'Collection "Existing Collection" already exists'
    )
  })
})