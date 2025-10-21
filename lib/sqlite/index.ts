import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import CapacitorSqliteConnection from './capacitor'
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

    let db
    if (isConn.result) {
      // Réutiliser la connexion existante
      db = await sqlite.retrieveConnection(name, false)
    } else {
      // Créer une nouvelle connexion
      await sqlite.createConnection(name, false, 'no-encryption', 1, false)
      db = await sqlite.retrieveConnection(name, false)
      // Important: Open the database before using it
      await db.open()
    }

    return new CapacitorSqliteConnection(db)
  }

  // Dev/Test: use sqlite3 (dynamic import to avoid Node.js dependencies on mobile)
  const { open } = await import('sqlite')
  const sqlite3 = await import('sqlite3')
  const Sqlite3Connection = (await import('./sqlite3')).default

  const db = await open({
    filename: `${name}.sqlite`,
    driver: sqlite3.default.Database,
    mode: sqlite3.default.OPEN_READWRITE + sqlite3.default.OPEN_CREATE,
  })
  return new Sqlite3Connection(db)
}
