import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import openDatabase from './sqlite'
import type { SqliteConnection } from './sqlite'
import type { Collection, Card, ReviewSession, Meta } from '~/lib/types'

const DEFAULT_DB_NAME = 'memoflash'
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations')

function ensureDb(db: SqliteConnection | null): asserts db is SqliteConnection {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
}

// Default export for simpler imports
export default function createDb(dbName: string = DEFAULT_DB_NAME) {
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
    db = await openDatabase(dbName)

    // Run migrations if they exist (with tracking to avoid reapplying)
    if (fs.existsSync(MIGRATIONS_DIR)) {
      ensureDb(db)
      const migrationDb = db
      await migrationDb.run(
        'CREATE TABLE IF NOT EXISTS Migrations (file TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)'
      )

      const files = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith('.sql'))
        .sort()

      for (const file of files) {
        const applied = await migrationDb.get<{ file: string }>('SELECT file FROM Migrations WHERE file = ? LIMIT 1', [
          file,
        ])
        if (!applied) {
          const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')
          await migrationDb.exec(sql)
          await migrationDb.run('INSERT INTO Migrations (file, applied_at) VALUES (?, ?)', [file, Date.now()])
        }
      }
    }
  }

  // Meta
  async function getMeta(key: string): Promise<unknown> {
    ensureDb(db)
    const row = await db.get<Meta>('SELECT value FROM Meta WHERE key = ?', [key])
    if (!row) return null
    const raw = row.value as unknown
    const str = typeof raw === 'string' ? raw : String(raw)
    return JSON.parse(str)
  }

  async function setMeta(key: string, value: unknown): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    await db.run('INSERT OR REPLACE INTO Meta (key, value, updated_at) VALUES (?, ?, ?)', [
      key,
      JSON.stringify(value),
      now,
    ])
  }

  // Collections
  async function createCollection(name: string): Promise<Collection> {
    ensureDb(db)
    // Get current user id if present in Meta (fallback to null)
    const currentUserId = (await getMeta('user_id')) as string | null

    // Check unique
    const exist = await db.get<Collection>('SELECT * FROM Collection WHERE name = ? AND deleted_at IS NULL', [name])
    if (exist) throw new Error('Collection with this name already exists')

    const now = Date.now()
    const id = uuidv4()
    await db.run(
      // user_id column may not exist on older DBs; use a flexible insert
      'INSERT INTO Collection (id, name, created_at, updated_at, user_id) VALUES (?, ?, ?, ?, ?)',
      [id, name, now, now, currentUserId ?? null]
    )

    return {
      id,
      name,
      created_at: now,
      updated_at: now,
      user_id: currentUserId ?? '',
    }
  }

  async function getCollections(includeDeleted = false): Promise<Collection[]> {
    ensureDb(db)
    const currentUserId = (await getMeta('user_id')) as string | null
    if (currentUserId) {
      return db.all<Collection>(
        includeDeleted
          ? 'SELECT * FROM Collection WHERE user_id = ? ORDER BY updated_at DESC'
          : 'SELECT * FROM Collection WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC',
        [currentUserId]
      )
    }
    // Fallback if user_id not set (pre-auth dbs)
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
    const currentUserId = (await getMeta('user_id')) as string | null

    if (data.name) {
      sets.push('name = ?')
      params.push(data.name)
    }

    sets.push('updated_at = ?')
    params.push(now)
    params.push(id)
    if (currentUserId) {
      await db.run(`UPDATE Collection SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, [...params, currentUserId])
    } else {
      await db.run(`UPDATE Collection SET ${sets.join(', ')} WHERE id = ?`, params)
    }
  }

  async function softDeleteCollection(id: string): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    const currentUserId = (await getMeta('user_id')) as string | null
    if (currentUserId) {
      await db.run('UPDATE Collection SET deleted_at = ? WHERE id = ? AND user_id = ?', [now, id, currentUserId])
    } else {
      await db.run('UPDATE Collection SET deleted_at = ? WHERE id = ?', [now, id])
    }
    // Soft-delete associated cards
    if (currentUserId) {
      await db.run('UPDATE Card SET deleted_at = ? WHERE collection_id = ? AND user_id = ?', [now, id, currentUserId])
    } else {
      await db.run('UPDATE Card SET deleted_at = ? WHERE collection_id = ?', [now, id])
    }
  }

  // Cards
  async function createCard(collectionId: string, question: string, answer: string): Promise<Card> {
    ensureDb(db)
    const now = Date.now()
    const id = uuidv4()
    const currentUserId = (await getMeta('user_id')) as string | null

    await db.run(
      'INSERT INTO Card (id, collection_id, question, answer, format, compartment, next_review_at, created_at, updated_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, collectionId, question, answer, 'text', 1, now, now, now, currentUserId ?? null]
    )

    const row = await db.get<Card>('SELECT * FROM Card WHERE id = ?', [id])
    if (!row) throw new Error('Failed to create card')
    return row
  }

  async function getCardsByCollection(collectionId: string): Promise<Card[]> {
    ensureDb(db)
    const currentUserId = (await getMeta('user_id')) as string | null
    if (currentUserId) {
      return db.all<Card>(
        'SELECT * FROM Card WHERE collection_id = ? AND user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC',
        [collectionId, currentUserId]
      )
    }
    return db.all<Card>('SELECT * FROM Card WHERE collection_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC', [
      collectionId,
    ])
  }

  async function updateCard(id: string, data: Partial<Card>): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    const sets: string[] = []
    const params: (string | number)[] = []
    const currentUserId = (await getMeta('user_id')) as string | null

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
    if (currentUserId) {
      await db.run(`UPDATE Card SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, [...params, currentUserId])
    } else {
      await db.run(`UPDATE Card SET ${sets.join(', ')} WHERE id = ?`, params)
    }
  }

  async function softDeleteCard(id: string): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    const currentUserId = (await getMeta('user_id')) as string | null
    if (currentUserId) {
      await db.run('UPDATE Card SET deleted_at = ? WHERE id = ? AND user_id = ?', [now, id, currentUserId])
    } else {
      await db.run('UPDATE Card SET deleted_at = ? WHERE id = ?', [now, id])
    }
  }

  // Review sessions
  async function createReviewSession(): Promise<ReviewSession> {
    ensureDb(db)
    const now = Date.now()
    const id = uuidv4()
    const currentUserId = (await getMeta('user_id')) as string | null

    await db.run('INSERT INTO ReviewSession (id, started_at, user_id) VALUES (?, ?, ?)', [
      id,
      now,
      currentUserId ?? null,
    ])

    const row = await db.get<ReviewSession>('SELECT * FROM ReviewSession WHERE id = ?', [id])
    if (!row) throw new Error('Failed to create review session')
    return row
  }

  async function endReviewSession(id: string, stats: { correct: number; wrong: number; total: number }): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    const currentUserId = (await getMeta('user_id')) as string | null
    if (currentUserId) {
      await db.run(
        'UPDATE ReviewSession SET ended_at = ?, cards_reviewed = ?, correct_count = ?, wrong_count = ? WHERE id = ? AND user_id = ?',
        [now, stats.total, stats.correct, stats.wrong, id, currentUserId]
      )
    } else {
      await db.run(
        'UPDATE ReviewSession SET ended_at = ?, cards_reviewed = ?, correct_count = ?, wrong_count = ? WHERE id = ?',
        [now, stats.total, stats.correct, stats.wrong, id]
      )
    }
  }

  // Logs
  async function addReviewLog(cardId: string, sessionId: string, result: string): Promise<void> {
    ensureDb(db)
    const now = Date.now()
    const id = uuidv4()
    const currentUserId = (await getMeta('user_id')) as string | null
    await db.run(
      'INSERT INTO ReviewLog (id, card_id, session_id, result, reviewed_at, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, cardId, sessionId, result, now, currentUserId ?? null]
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
    setMeta,
  }
}
