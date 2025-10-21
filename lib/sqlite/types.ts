// Common types for SQLite parameters
export type SqlParam = string | number | boolean | null | Buffer
export type SqlParams = SqlParam[]

// Common interface for both sqlite3 and Capacitor SQLite
export interface SqliteConnection {
  exec(sql: string): Promise<void>
  run(sql: string, params?: SqlParams): Promise<void>
  get<T>(sql: string, params?: SqlParams): Promise<T | undefined>
  all<T>(sql: string, params?: SqlParams): Promise<T[]>
  close(): Promise<void>
}
