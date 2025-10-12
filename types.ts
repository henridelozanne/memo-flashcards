export interface Collection {
  id: string
  user_id: string
  name: string
  created_at: number
  updated_at: number
  deleted_at?: number | null
}

export interface Card {
  id: string
  front: string
  back: string
  collection_id: string
  user_id: string
  created_at: number
  updated_at: number
  format: 'text'
  compartment: number
  due_at: number
  ease: number
  interval: number
  deleted_at?: number | null
}

export interface ReviewSession {
  id: string
  started_at: number
  ended_at?: number | null
  cards_reviewed: number
  correct_count: number
  wrong_count: number
}

export interface ReviewLog {
  id: string
  card_id: string
  session_id: string
  result: 'correct' | 'wrong' | 'almost'
  reviewed_at: number
}

export interface Meta {
  key: string
  value: string
  updated_at: number
}
