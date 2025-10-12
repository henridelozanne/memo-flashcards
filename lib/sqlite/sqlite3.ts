import { Database } from 'sqlite'
import type { SqliteConnection, SqlParams } from './types'

export default class Sqlite3Connection implements SqliteConnection {
  private readonly db: Database

  constructor(db: Database) {
    this.db = db
  }

  async exec(sql: string): Promise<void> {
    await this.db.exec(sql)
  }

  async run(sql: string, params: SqlParams = []): Promise<void> {
    await this.db.run(sql, ...params)
  }

  async get<T>(sql: string, params: SqlParams = []): Promise<T | undefined> {
    return this.db.get<T>(sql, ...params)
  }

  async all<T>(sql: string, params: SqlParams = []): Promise<T[]> {
    return this.db.all<T[]>(sql, ...params)
  }

  async close(): Promise<void> {
    await this.db.close()
  }
}