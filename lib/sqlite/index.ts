import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import CapacitorSqliteConnection from './capacitor'
import Sqlite3Connection from './sqlite3'
import type { SqliteConnection } from './types'

// Re-export types
export * from './types'

export type { SqliteConnection, SqlParam, SqlParams } from './types'

export default async function openDatabase(name: string): Promise<SqliteConnection> {
  if (Capacitor.isNativePlatform()) {
    // Mobile: use Capacitor SQLite
    const sqlite = new SQLiteConnection(CapacitorSQLite)
    await sqlite.checkConnectionsConsistency()
    const isConn = await sqlite.isConnection(name, false)
    if (isConn.result) {
      await sqlite.closeConnection(name, false)
    }
    await sqlite.createConnection(name, false, 'no-encryption', 1, false)
    const db = await sqlite.retrieveConnection(name, false)
    return new CapacitorSqliteConnection(db)
  }
  
  // Dev/Test: use sqlite3
  const db = await open({
    filename: `${name}.sqlite`, 
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READWRITE + sqlite3.OPEN_CREATE
  })
  return new Sqlite3Connection(db)
}