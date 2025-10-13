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

describe('useCards - Leitner System', () => {
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

  describe('getDueCards', () => {
    it('should return cards due for review', async () => {
      const now = Date.now()
      const mockDueCards = [
        {
          id: 'card-1',
          question: 'Q1',
          answer: 'A1',
          compartment: 1,
          next_review_at: now - 1000, // Due
          collection_id: 'test-collection'
        },
        {
          id: 'card-2',
          question: 'Q2',
          answer: 'A2',
          compartment: 2,
          next_review_at: now - 2000, // Due
          collection_id: 'test-collection'
        }
      ]
      
      mockSqliteConnection.all.mockResolvedValue(mockDueCards)
      
      const dueCards = await composable.getDueCards('test-collection')
      
      expect(dueCards).toEqual(mockDueCards)
      expect(mockSqliteConnection.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM cards'),
        ['test-collection', expect.any(Number)]
      )
    })

    it('should return empty array if no due cards', async () => {
      mockSqliteConnection.all.mockResolvedValue([])
      
      const dueCards = await composable.getDueCards('test-collection')
      
      expect(dueCards).toEqual([])
    })
  })

  describe('getCardsDueToday', () => {
    it('should return cards due today', async () => {
      const mockCardsToday = [
        {
          id: 'card-1',
          question: 'Q1',
          answer: 'A1',
          compartment: 1,
          next_review_at: Date.now() - 1000
        }
      ]
      
      mockSqliteConnection.all.mockResolvedValue(mockCardsToday)
      
      const cardsToday = await composable.getCardsDueToday()
      
      expect(cardsToday).toEqual(mockCardsToday)
      
      // Verify SQL query looks for cards due now (no collection filter)
      const callArgs = mockSqliteConnection.all.mock.calls[0]
      expect(callArgs[0]).toContain('next_review_at <= ?')
      expect(callArgs[1]).toHaveLength(1) // just the current timestamp
    })
  })

  describe('applyAnswer', () => {
    it('should promote card to next compartment on correct answer', async () => {
      const card = {
        id: 'test-card',
        compartment: 1,
        next_review_at: Date.now() - 1000,
        question: 'Test Q',
        answer: 'Test A',
        collection_id: 'test-collection',
        user_id: 'test-user',
        created_at: Date.now(),
        updated_at: Date.now(),
        archived: false
      }
      
      await composable.applyAnswer(card, 'true')
      
      // Verify card was promoted to compartment 2
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cards'),
        expect.arrayContaining([2, expect.any(Number), expect.any(Number), 'test-card'])
      )
    })

    it('should demote card to compartment 1 on incorrect answer', async () => {
      const card = {
        id: 'test-card',
        compartment: 3,
        next_review_at: Date.now() - 1000,
        question: 'Test Q',
        answer: 'Test A',
        collection_id: 'test-collection',
        user_id: 'test-user',
        created_at: Date.now(),
        updated_at: Date.now(),
        archived: false
      }
      
      await composable.applyAnswer(card, 'false')
      
      // Verify card was demoted to compartment 1
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cards'),
        expect.arrayContaining([1, expect.any(Number), expect.any(Number), 'test-card'])
      )
    })

    it('should keep card in compartment 6 on correct answer at max level', async () => {
      const card = {
        id: 'test-card',
        compartment: 6,
        next_review_at: Date.now() - 1000,
        question: 'Test Q',
        answer: 'Test A',
        collection_id: 'test-collection',
        user_id: 'test-user',
        created_at: Date.now(),
        updated_at: Date.now(),
        archived: false
      }
      
      await composable.applyAnswer(card, 'true')
      
      // Verify card stays in compartment 6 (max level)
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cards'),
        expect.arrayContaining([6, expect.any(Number), expect.any(Number), 'test-card'])
      )
    })

    it('should handle almost correct answer', async () => {
      const card = {
        id: 'test-card',
        compartment: 2,
        next_review_at: Date.now() - 1000,
        question: 'Test Q',
        answer: 'Test A',
        collection_id: 'test-collection',
        user_id: 'test-user',
        created_at: Date.now(),
        updated_at: Date.now(),
        archived: false
      }
      
      await composable.applyAnswer(card, 'almost')
      
      // Verify card was promoted to compartment 3
      expect(mockSqliteConnection.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cards'),
        expect.arrayContaining([3, expect.any(Number), expect.any(Number), 'test-card'])
      )
    })
  })

  describe('Leitner System Integration', () => {
    it('should correctly apply Leitner intervals through applyAnswer', async () => {
      const card = {
        id: 'test-card',
        compartment: 2,
        next_review_at: Date.now() - 1000,
        question: 'Test Q',
        answer: 'Test A',
        collection_id: 'test-collection',
        user_id: 'test-user',
        created_at: Date.now(),
        updated_at: Date.now(),
        archived: false
      }
      
      const before = Date.now()
      await composable.applyAnswer(card, 'true')
      
      // Verify SQL was called with promoted compartment
      const updateCall = mockSqliteConnection.run.mock.calls.find(call => 
        call[0].includes('UPDATE cards')
      )
      
      expect(updateCall).toBeTruthy()
      const [, params] = updateCall
      const [compartment, nextReviewAt] = params
      
      // Should be promoted to compartment 3
      expect(compartment).toBe(3)
      
      // Next review should be in the future (3 days for compartment 3)
      expect(nextReviewAt).toBeGreaterThan(before)
    })
  })
})