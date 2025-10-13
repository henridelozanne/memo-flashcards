import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCards } from '~/composables/useCards'
import { getReviewSessions, getReviewLogs } from '~/composables/useStatsDb'

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

vi.mock('~/composables/useStatsDb', () => ({
  getReviewSessions: vi.fn(),
  getReviewLogs: vi.fn()
}))

describe('Statistiques utilisateur', () => {
  beforeEach(() => {
    // Reset UUID counter
    mockUuidCounter = 0
    
    // Setup SQLite mocks
    vi.clearAllMocks()
    mockSqliteConnection.exec.mockResolvedValue(undefined)
    mockSqliteConnection.run.mockResolvedValue(undefined)
    mockSqliteConnection.close.mockResolvedValue(undefined)
  })

  it('compte les cartes par compartiment', async () => {
    const { countCardsPerCompartment } = useCards()
    
    // Mock les résultats de comptage pour différents compartiments
    mockSqliteConnection.get
      .mockResolvedValueOnce({ count: 3 }) // compartiment 1: 3 cartes
      .mockResolvedValueOnce({ count: 2 }) // compartiment 2: 2 cartes
    
    expect(await countCardsPerCompartment('col1', 1)).toBe(3)
    expect(await countCardsPerCompartment('col1', 2)).toBe(2)
  })

  it('calcule le taux de réussite global', async () => {
    // Simule 8 bonnes réponses, 2 mauvaises
  (getReviewLogs as unknown as { mockResolvedValue: (v: Array<{ response: 'true' | 'false' | 'almost' }>) => void }).mockResolvedValue([
      { response: 'true' }, { response: 'true' }, { response: 'true' },
      { response: 'true' }, { response: 'true' }, { response: 'true' },
      { response: 'true' }, { response: 'true' },
      { response: 'false' }, { response: 'false' }
    ])
    const logs = await getReviewLogs() as Array<{ response: 'true' | 'false' | 'almost' }>
    const total = logs.length
    const good = logs.filter((l) => l.response === 'true').length
    const rate = total > 0 ? Math.round((good / total) * 100) : 0
    expect(rate).toBe(80)
  })

  it('récupère les sessions de révision pour le calendrier', async () => {
    (getReviewSessions as unknown as { mockResolvedValue: (v: Array<{ date: string; cardsReviewed: number }>) => void }).mockResolvedValue([
      { date: '2025-10-10', cardsReviewed: 12 },
      { date: '2025-10-11', cardsReviewed: 15 }
    ])
    const sessions = await getReviewSessions()
    expect(sessions).toHaveLength(2)
    expect(sessions[0].date).toBe('2025-10-10')
    expect(sessions[1].cardsReviewed).toBe(15)
  })
})
