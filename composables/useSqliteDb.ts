import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

type SqlDb = {
  run: (...args: unknown[]) => Promise<unknown>
  get: <T = unknown>(...args: unknown[]) => Promise<T | undefined>
  all: <T = unknown>(...args: unknown[]) => Promise<T[]>
  exec: (...args: unknown[]) => Promise<unknown>
  close: () => Promise<void>
}

let db: SqlDb | null = null

export async function useSqliteDb(): Promise<SqlDb> {
  if (!db) {
    const opened = await open({
      filename: './memo-flashcards.sqlite',
      driver: sqlite3.Database
    })
    db = opened as unknown as SqlDb
  }
  return db
}
