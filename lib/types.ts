export interface Collection {
  id: string;
  user_id: string;
  name: string;
  created_at: number;
  updated_at: number;
  deleted_at?: number;
}

export interface Card {
  id: string;
  user_id: string;
  collection_id: string;
  question: string;
  answer: string;
  compartment: number;
  next_review_at: number;
  created_at: number;
  updated_at: number;
  archived?: boolean;
  deleted_at?: number;
}

export interface ReviewSession {
  id: string;
  user_id: string;
  started_at: number;
  ended_at: number | null;
  total?: number;
  correct?: number;
  wrong?: number;
}

export interface ReviewLog {
  id: string;
  user_id: string;
  card_id: string;
  session_id: string;
  result: 'correct' | 'wrong' | 'almost';
  created_at: number;
}

// Meta key-value store
export interface Meta {
  key: string;
  value: unknown;
}

// DB operations result types
export type CreateCollectionParams = Pick<Collection, 'name'>;
export type UpdateCollectionParams = Partial<Pick<Collection, 'name'>>;

export type CreateCardParams = Pick<Card, 'collection_id' | 'question' | 'answer'>;
export type UpdateCardParams = Partial<Pick<Card, 'question' | 'answer' | 'compartment' | 'next_review_at' | 'archived'>>;

export type ReviewSessionStats = Pick<ReviewSession, 'total' | 'correct' | 'wrong'>;