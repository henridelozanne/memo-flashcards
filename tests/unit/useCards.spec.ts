import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCards } from '~/composables/useCards'

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

// Mock UUID
let mockUuidCounter = 0
vi.mock('uuid', () => ({
  v4: () => {
    mockUuidCounter += 1
    return `mock-uuid-${mockUuidCounter}`
  }
}))

describe('useCards', () => {
  let composable: ReturnType<typeof useCards>

  beforeEach(() => {
    // Reset UUID counter
    mockUuidCounter = 0
    
    // Créer une nouvelle instance du composable pour chaque test
    composable = useCards()
    // Reset les données mockées
    composable.resetCards()
    
    // Setup default SQLite mocks
    vi.clearAllMocks()
    mockSqliteConnection.exec.mockResolvedValue(undefined)
    mockSqliteConnection.run.mockResolvedValue(undefined)
    mockSqliteConnection.get.mockResolvedValue(undefined)
    mockSqliteConnection.all.mockResolvedValue([])
    mockSqliteConnection.close.mockResolvedValue(undefined)
  })

  describe('createCard', () => {
    it('should create a new card', async () => {
      // Mock successful creation
      const now = Date.now()
      const mockCard = {
        id: 'mock-uuid-1',
        user_id: 'default-user',
        question: 'Test Question',
        answer: 'Test Answer',
        collection_id: 'test-collection',
        created_at: now,
        updated_at: now,
        compartment: 1,
        next_review_at: now,
        archived: false
      }
      
      mockSqliteConnection.all.mockResolvedValue([mockCard])
      
      const card = await composable.createCard('Test Question', 'Test Answer', 'test-collection')

      expect(card).toEqual({
        id: 'mock-uuid-1',
        user_id: 'default-user',
        question: 'Test Question',
        answer: 'Test Answer',
        collection_id: 'test-collection',
        created_at: expect.any(Number),
        updated_at: expect.any(Number),
        compartment: 1,
        next_review_at: expect.any(Number),
        archived: false
      })

      // Verify SQLite calls
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cards'),
        expect.arrayContaining(['mock-uuid-1', 'default-user', 'test-collection', 'Test Question', 'Test Answer', 1])
      )
    })

    it('should throw error for empty question', async () => {
      await expect(composable.createCard('', 'Test Answer', 'test-collection')).rejects.toThrow(
        'Le recto de la carte est obligatoire'
      )
    })

    it('should throw error for empty answer', async () => {
      await expect(composable.createCard('Test Question', '', 'test-collection')).rejects.toThrow(
        'Le verso de la carte est obligatoire'
      )
    })

    it('should trim whitespace from question and answer', async () => {
      const now = Date.now()
      const mockCard = {
        id: 'mock-uuid-1',
        question: 'Trimmed Question',
        answer: 'Trimmed Answer',
        collection_id: 'test-collection'
      }
      
      mockSqliteConnection.all.mockResolvedValue([mockCard])
      
      await composable.createCard('  Trimmed Question  ', '  Trimmed Answer  ', 'test-collection')

      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cards'),
        expect.arrayContaining([
          'mock-uuid-1', 'default-user', 'test-collection', 'Trimmed Question', 'Trimmed Answer'
        ])
      )
    })
  })

  describe('loadCards', () => {
    it('should load cards for a collection', async () => {
      const mockCards = [
        {
          id: 'card-1',
          question: 'Q1',
          answer: 'A1',
          collection_id: 'test-collection',
          created_at: Date.now(),
          deleted_at: null
        },
        {
          id: 'card-2',
          question: 'Q2',
          answer: 'A2',
          collection_id: 'test-collection',
          created_at: Date.now(),
          deleted_at: null
        }
      ]
      
      mockSqliteConnection.all.mockResolvedValue(mockCards)
      
      await composable.loadCards('test-collection')
      
      expect(composable.cards.value).toEqual(mockCards)
      expect(mockSqliteConnection.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM cards'),
        ['test-collection']
      )
    })

    it('should handle loading errors gracefully', async () => {
      mockSqliteConnection.all.mockRejectedValue(new Error('Database error'))
      
      await composable.loadCards('test-collection')
      
      expect(composable.error.value).toBe('Database error')
      expect(composable.cards.value).toEqual([])
    })
  })

  describe('updateCard', () => {
    it('should update an existing card', async () => {
      const existingCard = {
        id: 'test-id',
        collection_id: 'test-collection',
        question: 'Old Question',
        answer: 'Old Answer'
      }
      
      mockSqliteConnection.get.mockResolvedValue(existingCard)
      mockSqliteConnection.all.mockResolvedValue([{
        ...existingCard,
        question: 'New Question',
        answer: 'New Answer'
      }])
      
      await composable.updateCard('test-id', 'New Question', 'New Answer')
      
      // Verify card existence check
      expect(mockSqliteConnection.get).toHaveBeenCalledWith(
        'SELECT * FROM cards WHERE id = ? AND deleted_at IS NULL',
        ['test-id']
      )
      
      // Verify update SQL
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cards'),
        expect.arrayContaining(['New Question', 'New Answer'])
      )
    })

    it('should throw error if card not found', async () => {
      mockSqliteConnection.get.mockResolvedValue(undefined)
      
      await expect(composable.updateCard('nonexistent-id', 'Q', 'A')).rejects.toThrow(
        'Carte introuvable'
      )
    })
  })

  describe('deleteCard', () => {
    it('should soft delete a card', async () => {
      const existingCard = {
        id: 'test-id',
        collection_id: 'test-collection'
      }
      
      mockSqliteConnection.get.mockResolvedValue(existingCard)
      mockSqliteConnection.all.mockResolvedValue([])
      
      await composable.deleteCard('test-id')
      
      // Verify soft delete SQL
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cards'),
        expect.arrayContaining(['test-id'])
      )
    })

    it('should throw error if card not found', async () => {
      mockSqliteConnection.get.mockResolvedValue(undefined)
      
      await expect(composable.deleteCard('nonexistent-id')).rejects.toThrow(
        'Carte introuvable'
      )
    })
  })

  describe('getCardsCount', () => {
    it('should return count of cards in collection', async () => {
      mockSqliteConnection.get.mockResolvedValue({ count: 5 })
      
      const count = await composable.getCardsCount('test-collection')
      
      expect(count).toBe(5)
      expect(mockSqliteConnection.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM cards WHERE collection_id = ? AND deleted_at IS NULL',
        ['test-collection']
      )
    })

    it('should return 0 if no result', async () => {
      mockSqliteConnection.get.mockResolvedValue(undefined)
      
      const count = await composable.getCardsCount('test-collection')
      
      expect(count).toBe(0)
    })
  })

  describe('countCardsPerCompartment', () => {
    it('should count cards in specific compartment', async () => {
      mockSqliteConnection.get.mockResolvedValue({ count: 3 })
      
      const count = await composable.countCardsPerCompartment('test-collection', 2)
      
      expect(count).toBe(3)
      expect(mockSqliteConnection.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM cards WHERE collection_id = ? AND deleted_at IS NULL AND compartment = ?',
        ['test-collection', 2]
      )
    })
  })

  describe('getCard', () => {
    it('should return card by id from loaded cards', async () => {
      const mockCards = [
        { id: 'card-1', question: 'Q1', deleted_at: null },
        { id: 'card-2', question: 'Q2', deleted_at: null }
      ]
      
      mockSqliteConnection.all.mockResolvedValue(mockCards)
      
      // First load cards to populate the internal state
      await composable.loadCards('test-collection')
      
      const card = composable.getCard('card-1')
      
      expect(card).toEqual(mockCards[0])
    })

    it('should return null if card not found', async () => {
      mockSqliteConnection.all.mockResolvedValue([])
      
      await composable.loadCards('test-collection')
      
      const card = composable.getCard('nonexistent-id')
      
      expect(card).toBeNull()
    })

    it('should return null if card is deleted', async () => {
      const mockCards = [
        { id: 'card-1', question: 'Q1', deleted_at: Date.now() }
      ]
      
      mockSqliteConnection.all.mockResolvedValue(mockCards)
      
      await composable.loadCards('test-collection')
      
      const card = composable.getCard('card-1')
      
      expect(card).toBeNull()
    })
  })
})