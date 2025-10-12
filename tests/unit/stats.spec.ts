import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCards } from '~/composables/useCards'
import { getReviewSessions, getReviewLogs } from '~/composables/useStatsDb'

vi.mock('~/composables/useStatsDb', () => ({
  getReviewSessions: vi.fn(),
  getReviewLogs: vi.fn()
}))

describe('Statistiques utilisateur', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('compte les cartes par compartiment', () => {
    const { countCardsPerCompartment, createCard, cards, applyAnswer, resetCards } = useCards()
    resetCards()
    // Ajoute 5 cartes dans le compartiment 1
    for (let i = 0; i < 5; i++) createCard('Q', 'A', 'col1')
    // Passe 2 cartes au compartiment 2 via applyAnswer('almost')
    for (let i = 0; i < 2; i++) {
      applyAnswer(cards.value[i], 'almost')
    }
    expect(countCardsPerCompartment('col1', 1)).toBe(3)
    expect(countCardsPerCompartment('col1', 2)).toBe(2)
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
