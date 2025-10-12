import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

let db: any = null

export async function useSqliteDb() {
  if (!db) {
    db = await open({
      filename: './memo-flashcards.sqlite',
      driver: sqlite3.Database
    })
  }
  return db
}
