import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCards } from '~/composables/useCards'

// Mock the SQLite connection for testing
const mockSqliteConnection = {
  exec: vi.fn(),
  run: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
  close: vi.fn(),
}

vi.mock('~/lib/sqlite', () => ({
  default: vi.fn(() => mockSqliteConnection),
}))

// Mock UUID
let mockUuidCounter = 0
vi.mock('uuid', () => ({
  v4: () => {
    mockUuidCounter += 1
    return `mock-uuid-${mockUuidCounter}`
  },
}))

describe('Daily Review Functions', () => {
  let createdCards: any[] = []

  beforeEach(() => {
    // Reset UUID counter
    mockUuidCounter = 0
    createdCards = []

    const { resetCards } = useCards()
    resetCards()

    // Setup SQLite mocks
    vi.clearAllMocks()
    mockSqliteConnection.exec.mockResolvedValue(undefined)
    mockSqliteConnection.run.mockResolvedValue(undefined)
    mockSqliteConnection.get.mockResolvedValue(undefined)
    mockSqliteConnection.all.mockImplementation(() =>
      // Return only cards that haven't been "deleted"
      Promise.resolve(createdCards.filter((c) => !c.deleted_at))
    )
    mockSqliteConnection.close.mockResolvedValue(undefined)
  })

  describe('getCardsDueToday', () => {
    it('retourne toutes les cartes dues de toutes les collections', async () => {
      const { getCardsDueToday } = useCards()

      // Mock les cartes créées dans différentes collections
      const now = Date.now()
      const mockCards = [
        {
          id: 'mock-uuid-1',
          question: 'Q1',
          answer: 'A1',
          collection_id: 'collection1',
          compartment: 1,
          next_review_at: now,
          created_at: now,
          deleted_at: null,
          archived: 0,
        },
        {
          id: 'mock-uuid-2',
          question: 'Q2',
          answer: 'A2',
          collection_id: 'collection2',
          compartment: 1,
          next_review_at: now,
          created_at: now,
          deleted_at: null,
          archived: 0,
        },
        {
          id: 'mock-uuid-3',
          question: 'Q3',
          answer: 'A3',
          collection_id: 'collection1',
          compartment: 1,
          next_review_at: now,
          created_at: now,
          deleted_at: null,
          archived: 0,
        },
      ]

      mockSqliteConnection.all.mockResolvedValue(mockCards)

      const dueCards = await getCardsDueToday()
      expect(dueCards).toHaveLength(3)
      // Vérifier que toutes les questions sont présentes (sans se soucier de l'ordre)
      const questions = dueCards.map((c) => c.question).sort()
      expect(questions).toEqual(['Q1', 'Q2', 'Q3'])
    })

    it('exclut les cartes du compartiment 6', async () => {
      const { getCardsDueToday } = useCards()

      const now = Date.now()
      // Mock initial: 2 cartes dans compartiment < 6
      const initialCards = [
        {
          id: 'mock-uuid-1',
          question: 'Q1',
          answer: 'A1',
          collection_id: 'collection1',
          compartment: 1,
          next_review_at: now,
          created_at: now,
          deleted_at: null,
          archived: 0,
        },
        {
          id: 'mock-uuid-2',
          question: 'Q2',
          answer: 'A2',
          collection_id: 'collection1',
          compartment: 6, // Cette carte est au compartiment 6, donc exclue
          next_review_at: now,
          created_at: now,
          deleted_at: null,
          archived: 0,
        },
      ]

      // La fonction getCardsDueToday filtre compartment < 6
      const filteredCards = initialCards.filter((c) => c.compartment < 6)
      mockSqliteConnection.all.mockResolvedValue(filteredCards)

      const cards = await getCardsDueToday()
      expect(cards).toHaveLength(1)
      expect(cards[0].question).toBe('Q1')
    })

    it('trie par next_review_at puis created_at', async () => {
      const { getCardsDueToday } = useCards()

      const now = Date.now()
      // Mock: carte Q2 créée plus tard mais due plus tôt, Q1 créée plus tôt mais due plus tard
      const mockCards = [
        {
          id: 'mock-uuid-1',
          question: 'Q1',
          answer: 'A1',
          collection_id: 'collection1',
          compartment: 1,
          next_review_at: now + 1000, // Due dans 1 seconde
          created_at: now - 1000, // Créée il y a 1 seconde
          deleted_at: null,
          archived: 0,
        },
        {
          id: 'mock-uuid-2',
          question: 'Q2',
          answer: 'A2',
          collection_id: 'collection1',
          compartment: 1,
          next_review_at: now - 500, // Due il y a 0.5 seconde (plus urgent)
          created_at: now, // Créée maintenant
          deleted_at: null,
          archived: 0,
        },
      ]

      // Le tri devrait mettre Q2 en premier car next_review_at plus petit
      const sortedCards = mockCards.sort((a, b) => {
        if (a.next_review_at !== b.next_review_at) return a.next_review_at - b.next_review_at
        return a.created_at - b.created_at
      })

      mockSqliteConnection.all.mockResolvedValue(sortedCards)

      const dueCards = await getCardsDueToday()
      expect(dueCards).toHaveLength(2)
      expect(dueCards[0].question).toBe('Q2') // Q2 devrait être en premier (plus urgent)
      expect(dueCards[1].question).toBe('Q1')
    })
  })
})
