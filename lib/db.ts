import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import openDatabase from './sqlite'
import type { SqliteConnection } from './sqlite'
import type { Collection, Card, ReviewSession, Meta } from '~/types'

const DB_NAME = 'memoflash'
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations')

function ensureDb(db: SqliteConnection | null): asserts db is SqliteConnection {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
}

// Default export for simpler imports
export default function createDb() {
  let db: SqliteConnection | null = null

  async function initDb(): Promise<void> {
    // Close any existing connection
    if (db) {
      try {
        await db.close()
      } catch (e) {
        // ignore
      }
      db = null
    }

    // Open fresh DB connection
    db = await openDatabase(DB_NAME)

    // Run migrations if they exist
    if (fs.existsSync(MIGRATIONS_DIR)) {
      ensureDb(db)
      // Load and run migrations in order
      const migrationDb = db
      await Promise.all(
        fs.readdirSync(MIGRATIONS_DIR)
          .filter((f) => f.endsWith('.sql'))
          .sort()
          .map(f => fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf-8'))
          .map(sql => migrationDb.exec(sql))
      )
    }
  }

  // Meta
  async function getMeta(key: string): Promise<unknown> {
    ensureDb(db)
    const row = await db.get<Meta>('SELECT value FROM Meta WHERE key = ?', [key])
    return row ? JSON.parse(row.value) : null
  }

  async function setMeta(key: string, value: unknown): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    await db.run(
      'INSERT OR REPLACE INTO Meta (key, value, updated_at) VALUES (?, ?, ?)',
      [key, JSON.stringify(value), now]
    )
  }

  // Collections
  async function createCollection(name: string): Promise<Collection> {
    ensureDb(db)
    
    // Check unique
    const exist = await db.get<Collection>(
      'SELECT * FROM Collection WHERE name = ? AND deleted_at IS NULL',
      [name]
    )
    if (exist) throw new Error('Collection with this name already exists')

    const now = Date.now()
    const id = uuidv4()
    await db.run(
      'INSERT INTO Collection (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [id, name, now, now]
    )

    return { id, name, created_at: now, updated_at: now }
  }

  async function getCollections(includeDeleted = false): Promise<Collection[]> {
    ensureDb(db)
    return db.all<Collection>(
      includeDeleted 
        ? 'SELECT * FROM Collection ORDER BY updated_at DESC'
        : 'SELECT * FROM Collection WHERE deleted_at IS NULL ORDER BY updated_at DESC'
    )
  }

  async function updateCollection(id: string, data: Partial<Collection>): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    const sets: string[] = []
    const params: (string | number)[] = []

    if (data.name) {
      sets.push('name = ?')
      params.push(data.name)
    }
    
    sets.push('updated_at = ?')
    params.push(now)
    params.push(id)

    await db.run(
      `UPDATE Collection SET ${sets.join(', ')} WHERE id = ?`,
      params
    )
  }

  async function softDeleteCollection(id: string): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    await db.run(
      'UPDATE Collection SET deleted_at = ? WHERE id = ?',
      [now, id]
    )
    // Soft-delete associated cards
    await db.run(
      'UPDATE Card SET deleted_at = ? WHERE collection_id = ?',
      [now, id]
    )
  }

  // Cards
  async function createCard(
    collectionId: string,
    question: string,
    answer: string
  ): Promise<Card> {
    ensureDb(db)
    const now = Date.now()
    const id = uuidv4()
    
    await db.run(
      'INSERT INTO Card (id, collection_id, question, answer, format, compartment, next_review_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, collectionId, question, answer, 'text', 1, now, now, now]
    )

    const row = await db.get<Card>('SELECT * FROM Card WHERE id = ?', [id])
    if (!row) throw new Error('Failed to create card')
    return row
  }

  async function getCardsByCollection(collectionId: string): Promise<Card[]> {
    ensureDb(db)
    return db.all<Card>(
      'SELECT * FROM Card WHERE collection_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC',
      [collectionId]
    )
  }

  async function updateCard(id: string, data: Partial<Card>): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    const sets: string[] = []
    const params: (string | number)[] = []

    if (data.question !== undefined) {
      sets.push('question = ?')
      params.push(data.question)
    }
    if (data.answer !== undefined) {
      sets.push('answer = ?')
      params.push(data.answer)
    }
    if (data.compartment !== undefined) {
      sets.push('compartment = ?')
      params.push(data.compartment)
    }
    
    sets.push('updated_at = ?')
    params.push(now)
    params.push(id)

    await db.run(
      `UPDATE Card SET ${sets.join(', ')} WHERE id = ?`,
      params
    )
  }

  async function softDeleteCard(id: string): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    await db.run(
      'UPDATE Card SET deleted_at = ? WHERE id = ?',
      [now, id]
    )
  }

  // Review sessions
  async function createReviewSession(): Promise<ReviewSession> {
    ensureDb(db)
    const now = Date.now()
    const id = uuidv4()
    
    await db.run(
      'INSERT INTO ReviewSession (id, started_at) VALUES (?, ?)',
      [id, now]
    )

    const row = await db.get<ReviewSession>(
      'SELECT * FROM ReviewSession WHERE id = ?',
      [id]
    )
    if (!row) throw new Error('Failed to create review session')
    return row
  }

  async function endReviewSession(
    id: string,
    stats: { correct: number; wrong: number; total: number }
  ): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    await db.run(
      'UPDATE ReviewSession SET ended_at = ?, cards_reviewed = ?, correct_count = ?, wrong_count = ? WHERE id = ?',
      [now, stats.total, stats.correct, stats.wrong, id]
    )
  }

  // Logs
  async function addReviewLog(
    cardId: string,
    sessionId: string,
    result: string
  ): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    const id = uuidv4()
    await db.run(
      'INSERT INTO ReviewLog (id, card_id, session_id, result, reviewed_at) VALUES (?, ?, ?, ?, ?)',
      [id, cardId, sessionId, result, now]
    )
  }

  return {
    initDb,
    createCollection,
    getCollections,
    updateCollection,
    softDeleteCollection,
    createCard,
    getCardsByCollection,
    updateCard,
    softDeleteCard,
    createReviewSession,
    endReviewSession,
    addReviewLog,
    getMeta,
    setMeta
  }
}
