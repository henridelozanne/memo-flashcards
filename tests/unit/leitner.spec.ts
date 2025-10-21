import { describe, it, expect } from 'vitest'
import {
  COMPARTMENT_INTERVALS_DAYS,
  DAY_MS,
  MAINTENANCE_ALMOST_DAYS,
  MAINTENANCE_CORRECT_DAYS,
  MIN_ALMOST_HOURS,
  intervalDaysForCompartment,
  scheduleAfterReview,
  selectDueCards,
  sortDueCardsDeterministically,
  type CardLike,
} from '../../app/lib/leitner'

describe('intervalDaysForCompartment', () => {
  it('returns correct mapping for 1..6', () => {
    expect(intervalDaysForCompartment(1)).toBe(0)
    expect(intervalDaysForCompartment(2)).toBe(1)
    expect(intervalDaysForCompartment(3)).toBe(3)
    expect(intervalDaysForCompartment(4)).toBe(7)
    expect(intervalDaysForCompartment(5)).toBe(14)
    expect(intervalDaysForCompartment(6)).toBe(30)
  })

  it('returns 0 for out of range', () => {
    expect(intervalDaysForCompartment(0)).toBe(0)
    expect(intervalDaysForCompartment(7)).toBe(0)
  })
})

describe('scheduleAfterReview', () => {
  const now = 1_000_000_000_000
  const base: CardLike = {
    id: 'c1',
    collectionId: 'col',
    compartment: 1,
    nextReviewAt: now - DAY_MS,
    updatedAt: now - DAY_MS,
  }

  it('Correct: moves compartments up to 6 and uses intervals', () => {
    const c1: CardLike = { ...base, compartment: 1 }
    const r1 = scheduleAfterReview(c1, 'correct', now)
    expect(r1.compartment).toBe(2)
    expect(r1.nextReviewAt).toBe(now + COMPARTMENT_INTERVALS_DAYS[2] * DAY_MS)

    const c5: CardLike = { ...base, compartment: 5 }
    const r5 = scheduleAfterReview(c5, 'correct', now)
    expect(r5.compartment).toBe(6)
    expect(r5.nextReviewAt).toBe(now + COMPARTMENT_INTERVALS_DAYS[6] * DAY_MS)

    const c6: CardLike = { ...base, compartment: 6 }
    const r6 = scheduleAfterReview(c6, 'correct', now)
    expect(r6.compartment).toBe(6)
    expect(r6.nextReviewAt).toBe(now + MAINTENANCE_CORRECT_DAYS * DAY_MS)
  })

  it('Almost: halves interval (min 1d) and 12h for compartment 1', () => {
    const c2: CardLike = { ...base, compartment: 2 }
    const r2 = scheduleAfterReview(c2, 'almost', now)
    const halfMs = Math.round((COMPARTMENT_INTERVALS_DAYS[2] * DAY_MS) / 2)
    expect(r2.compartment).toBe(2)
    expect(r2.nextReviewAt).toBe(now + Math.max(DAY_MS, halfMs))

    const c1: CardLike = { ...base, compartment: 1 }
    const r1 = scheduleAfterReview(c1, 'almost', now)
    expect(r1.compartment).toBe(1)
    expect(r1.nextReviewAt).toBe(now + MIN_ALMOST_HOURS * 3_600_000)

    const c6: CardLike = { ...base, compartment: 6 }
    const r6 = scheduleAfterReview(c6, 'almost', now)
    expect(r6.compartment).toBe(6)
    expect(r6.nextReviewAt).toBe(now + MAINTENANCE_ALMOST_DAYS * DAY_MS)
  })

  it('Wrong: resets to 1 day or to 3 for compartment 6', () => {
    const c4: CardLike = { ...base, compartment: 4 }
    const r4 = scheduleAfterReview(c4, 'wrong', now)
    expect(r4.compartment).toBe(1)
    expect(r4.nextReviewAt).toBe(now + DAY_MS)

    const c6: CardLike = { ...base, compartment: 6 }
    const r6 = scheduleAfterReview(c6, 'wrong', now)
    expect(r6.compartment).toBe(3)
    expect(r6.nextReviewAt).toBe(now + 3 * DAY_MS)
  })

  it('does not mutate input and updates updatedAt', () => {
    const original: CardLike = { ...base, compartment: 2 }
    const copy = { ...original }
    const res = scheduleAfterReview(original, 'correct', now)
    expect(original).toEqual(copy)
    expect(res.updatedAt).toBe(now)
  })
})

describe('selectDueCards', () => {
  const now = 1_000_000_000_000
  const cards: CardLike[] = [
    {
      id: 'a',
      collectionId: 'c1',
      compartment: 1,
      nextReviewAt: now - 1,
      updatedAt: now - 10,
    },
    {
      id: 'b',
      collectionId: 'c1',
      compartment: 6,
      nextReviewAt: now - 1,
      updatedAt: now - 9,
    },
    {
      id: 'c',
      collectionId: 'c2',
      compartment: 2,
      nextReviewAt: now + 1,
      updatedAt: now - 8,
    },
    {
      id: 'd',
      collectionId: 'c2',
      compartment: 3,
      nextReviewAt: now - 1,
      updatedAt: now - 7,
      archived: true,
    },
  ]

  it('filters by nextReviewAt and archived', () => {
    const res = selectDueCards(cards, now)
    expect(res.map((r: CardLike) => r.id).sort()).toEqual(['a', 'b'].sort())
  })

  it('can exclude C6', () => {
    const res = selectDueCards(cards, now, { excludeC6: true })
    expect(res.map((r: CardLike) => r.id)).toEqual(['a'])
  })
})

describe('sortDueCardsDeterministically', () => {
  it('orders by collection createdAt then updatedAt then id', () => {
    const now = 1_000_000_000_000
    const collections = [
      { collectionId: 'A', createdAt: 1_000 },
      { collectionId: 'B', createdAt: 2_000 },
    ]

    const cards: CardLike[] = [
      {
        id: 'a1',
        collectionId: 'A',
        compartment: 1,
        nextReviewAt: now - 1,
        updatedAt: 100,
      },
      {
        id: 'a2',
        collectionId: 'A',
        compartment: 1,
        nextReviewAt: now - 1,
        updatedAt: 200,
      },
      {
        id: 'b1',
        collectionId: 'B',
        compartment: 1,
        nextReviewAt: now - 1,
        updatedAt: 50,
      },
      {
        id: 'a3',
        collectionId: 'A',
        compartment: 1,
        nextReviewAt: now - 1,
        updatedAt: 100,
      },
    ]

    const sorted = sortDueCardsDeterministically(cards, collections)
    // A before B
    expect(sorted[0].collectionId).toBe('A')
    expect(sorted[1].collectionId).toBe('A')
    expect(sorted[2].collectionId).toBe('A')
    expect(sorted[3].collectionId).toBe('B')

    // within A: updatedAt ascending, tie break by id
    const aOrder = sorted.filter((c: CardLike) => c.collectionId === 'A').map((c: CardLike) => c.id)
    expect(aOrder).toEqual(['a1', 'a3', 'a2'])
  })
})
