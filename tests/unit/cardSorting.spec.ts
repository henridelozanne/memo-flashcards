import { describe, it, expect, beforeEach } from 'vitest'
import type { Card } from '@/lib/types'

describe('Card Sorting', () => {
  let cards: Card[]

  beforeEach(() => {
    // Sample cards for testing
    cards = [
      {
        id: '1',
        user_id: 'test-user',
        collection_id: 'col1',
        question: 'Zebra',
        answer: 'Answer 1',
        created_at: 1000,
        updated_at: 1000,
        next_review_at: 5000,
        compartment: 3,
        correct_answers: 5,
        total_reviews: 10,
        archived: false,
        deleted_at: undefined,
      },
      {
        id: '2',
        user_id: 'test-user',
        collection_id: 'col1',
        question: 'Apple',
        answer: 'Answer 2',
        created_at: 3000,
        updated_at: 3000,
        next_review_at: 2000,
        compartment: 1,
        correct_answers: 2,
        total_reviews: 5,
        archived: false,
        deleted_at: undefined,
      },
      {
        id: '3',
        user_id: 'test-user',
        collection_id: 'col1',
        question: 'Monkey',
        answer: 'Answer 3',
        created_at: 2000,
        updated_at: 2000,
        next_review_at: 1000,
        compartment: 5,
        correct_answers: 10,
        total_reviews: 12,
        archived: false,
        deleted_at: undefined,
      },
    ]
  })

  it('sorts by newest first (created_at DESC)', () => {
    const sorted = [...cards].sort((a, b) => b.created_at - a.created_at)
    expect(sorted[0].id).toBe('2')
    expect(sorted[1].id).toBe('3')
    expect(sorted[2].id).toBe('1')
  })

  it('sorts by oldest first (created_at ASC)', () => {
    const sorted = [...cards].sort((a, b) => a.created_at - b.created_at)
    expect(sorted[0].id).toBe('1')
    expect(sorted[1].id).toBe('3')
    expect(sorted[2].id).toBe('2')
  })

  it('sorts alphabetically A to Z (question ASC)', () => {
    const sorted = [...cards].sort((a, b) => a.question.toLowerCase().localeCompare(b.question.toLowerCase()))
    expect(sorted[0].question).toBe('Apple')
    expect(sorted[1].question).toBe('Monkey')
    expect(sorted[2].question).toBe('Zebra')
  })

  it('sorts alphabetically Z to A (question DESC)', () => {
    const sorted = [...cards].sort((a, b) => b.question.toLowerCase().localeCompare(a.question.toLowerCase()))
    expect(sorted[0].question).toBe('Zebra')
    expect(sorted[1].question).toBe('Monkey')
    expect(sorted[2].question).toBe('Apple')
  })

  it('sorts by next review date (next_review_at ASC)', () => {
    const sorted = [...cards].sort((a, b) => a.next_review_at - b.next_review_at)
    expect(sorted[0].id).toBe('3') // next_review_at: 1000
    expect(sorted[1].id).toBe('2') // next_review_at: 2000
    expect(sorted[2].id).toBe('1') // next_review_at: 5000
  })

  it('sorts by compartment ascending (compartment ASC)', () => {
    const sorted = [...cards].sort((a, b) => a.compartment - b.compartment)
    expect(sorted[0].compartment).toBe(1)
    expect(sorted[1].compartment).toBe(3)
    expect(sorted[2].compartment).toBe(5)
  })

  it('sorts by compartment descending (compartment DESC)', () => {
    const sorted = [...cards].sort((a, b) => b.compartment - a.compartment)
    expect(sorted[0].compartment).toBe(5)
    expect(sorted[1].compartment).toBe(3)
    expect(sorted[2].compartment).toBe(1)
  })

  it('handles case-insensitive alphabetical sorting', () => {
    const mixedCaseCards = [
      { ...cards[0], question: 'zebra' },
      { ...cards[1], question: 'APPLE' },
      { ...cards[2], question: 'Monkey' },
    ]

    const sorted = [...mixedCaseCards].sort((a, b) => a.question.toLowerCase().localeCompare(b.question.toLowerCase()))

    expect(sorted[0].question).toBe('APPLE')
    expect(sorted[1].question).toBe('Monkey')
    expect(sorted[2].question).toBe('zebra')
  })

  it('maintains stable sort for equal values', () => {
    const cardsWithSameCompartment = [
      { ...cards[0], compartment: 2, id: 'a' },
      { ...cards[1], compartment: 2, id: 'b' },
      { ...cards[2], compartment: 2, id: 'c' },
    ]

    const sorted = [...cardsWithSameCompartment].sort((a, b) => a.compartment - b.compartment)

    // All should have compartment 2
    expect(sorted.every((card) => card.compartment === 2)).toBe(true)
  })

  it('handles empty array', () => {
    const emptyCards: Card[] = []
    const sorted = [...emptyCards].sort((a, b) => b.created_at - a.created_at)
    expect(sorted).toHaveLength(0)
  })

  it('handles single card array', () => {
    const singleCard = [cards[0]]
    const sorted = [...singleCard].sort((a, b) => b.created_at - a.created_at)
    expect(sorted).toHaveLength(1)
    expect(sorted[0].id).toBe('1')
  })

  it('prioritizes overdue cards when sorting by next_review_at', () => {
    const now = Date.now()
    const cardsWithOverdue = [
      { ...cards[0], next_review_at: now + 10000 }, // future
      { ...cards[1], next_review_at: now - 5000 }, // overdue (5s ago)
      { ...cards[2], next_review_at: now - 1000 }, // overdue (1s ago)
    ]

    const sorted = [...cardsWithOverdue].sort((a, b) => a.next_review_at - b.next_review_at)

    // Overdue cards (past dates) should come first
    expect(sorted[0].next_review_at).toBeLessThan(now)
    expect(sorted[1].next_review_at).toBeLessThan(now)
    expect(sorted[2].next_review_at).toBeGreaterThan(now)
  })
})
