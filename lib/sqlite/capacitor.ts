import type { SQLiteDBConnection } from '@capacitor-community/sqlite'
import type { SqliteConnection, SqlParams } from './types'

export default class CapacitorSqliteConnection implements SqliteConnection {
  private readonly db: SQLiteDBConnection

  constructor(db: SQLiteDBConnection) {
    this.db = db
  }

  async exec(sql: string): Promise<void> {
    await this.db.execute(sql)
  }

  async run(sql: string, params: SqlParams = []): Promise<void> {
    await this.db.run(sql, params)
  }

  async get<T>(sql: string, params: SqlParams = []): Promise<T | undefined> {
    const res = await this.db.query(sql, params)
    return res.values?.[0] as T | undefined
  }

  async all<T>(sql: string, params: SqlParams = []): Promise<T[]> {
    const res = await this.db.query(sql, params)
    return (res.values || []) as T[]
  }

  async close(): Promise<void> {
    await this.db.close()
  }
}