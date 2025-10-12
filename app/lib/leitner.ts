/* Leitner spaced repetition logic - pure functions, fully testable */

export const COMPARTMENT_INTERVALS_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
  6: 30,
};

export const MAINTENANCE_CORRECT_DAYS = 90;
export const MAINTENANCE_ALMOST_DAYS = 30;
export const MIN_ALMOST_HOURS = 12; // if interval is 0d (compartment 1)
export const DAY_MS = 86_400_000;

export type ReviewResult = 'correct' | 'almost' | 'wrong';

export interface CardLike {
  id: string;
  collectionId: string;
  compartment: number; // 1..6
  nextReviewAt: number; // epoch ms
  updatedAt: number; // epoch ms
  archived?: boolean;
}

export interface CollectionOrder {
  collectionId: string;
  createdAt: number; // epoch ms
}

export function intervalDaysForCompartment(compartment: number): number {
  return COMPARTMENT_INTERVALS_DAYS[compartment] ?? 0;
}

function daysToMs(days: number): number {
  return Math.round(days * DAY_MS);
}

export function scheduleAfterReview(
  card: CardLike,
  result: ReviewResult,
  nowMs = Date.now(),
): CardLike {
  const { compartment } = card;
  let newCompartment = compartment;
  let nextReviewAt: number;

  if (result === 'correct') {
    if (compartment === 6) {
      newCompartment = 6;
      nextReviewAt = nowMs + daysToMs(MAINTENANCE_CORRECT_DAYS);
    } else {
      newCompartment = Math.min(compartment + 1, 6);
      const intervalDays = intervalDaysForCompartment(newCompartment);
      nextReviewAt = nowMs + daysToMs(intervalDays);
    }
  } else if (result === 'almost') {
    // maintenance for compartment 6
    if (compartment === 6) {
      newCompartment = 6;
      nextReviewAt = nowMs + daysToMs(MAINTENANCE_ALMOST_DAYS);
    } else {
      newCompartment = compartment; // stays the same
      const intervalDays = intervalDaysForCompartment(compartment);
      if (intervalDays === 0) {
        // compartment 1 -> schedule at least MIN_ALMOST_HOURS
        nextReviewAt = nowMs + MIN_ALMOST_HOURS * 3_600_000;
      } else {
        const halfMs = (intervalDays * DAY_MS) / 2;
        const minMs = DAY_MS; // 1 day
        nextReviewAt = nowMs + Math.max(minMs, Math.round(halfMs));
      }
    }
  } else {
    // wrong
    newCompartment = compartment === 6 ? 3 : 1;
    nextReviewAt = nowMs + daysToMs(compartment === 6 ? 3 : 1);
  }

  return {
    ...card,
    compartment: newCompartment,
    nextReviewAt,
    updatedAt: nowMs,
  };
}

export function selectDueCards(
  cards: CardLike[],
  nowMs: number,
  options?: { excludeC6?: boolean },
): CardLike[] {
  const excludeC6 = options?.excludeC6 === true;
  return cards.filter((c) => {
    if (c.archived) return false;
    if (excludeC6 && c.compartment === 6) return false;
    return c.nextReviewAt <= nowMs;
  });
}

export function sortDueCardsDeterministically(
  cards: CardLike[],
  collectionsOrder: CollectionOrder[],
): CardLike[] {
  const map = new Map<string, number>();
  collectionsOrder
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((c, idx) => map.set(c.collectionId, idx));

  return [...cards].sort((a, b) => {
    const ai = map.get(a.collectionId) ?? Number.MAX_SAFE_INTEGER;
    const bi = map.get(b.collectionId) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    if (a.updatedAt !== b.updatedAt) return a.updatedAt - b.updatedAt;
    // stable fallback
    return a.id.localeCompare(b.id);
  });
}
