/* @vitest-environment node */

import { describe, it, expect, afterEach } from 'vitest'
import fs from 'fs'
import openDatabase from '../../lib/sqlite'

describe('SQLite abstraction', () => {
  const DB_FILE = 'test.sqlite'

  afterEach(async () => {
    // Clean up test database file
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE)
    }
  })

  it('can open and close database', async () => {
    const db = await openDatabase('test')
    expect(db).toBeDefined()
    await db.close()
  })

  it('can execute SQL statements', async () => {
    const db = await openDatabase('test')
    await db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)')
    await db.run('INSERT INTO test (value) VALUES (?)', ['hello'])
    const result = await db.get<{ value: string }>('SELECT value FROM test')
    expect(result?.value).toBe('hello')
    await db.close()
  })

  it('supports parameterized queries', async () => {
    const db = await openDatabase('test')
    await db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)')

    // Use Promise.all instead of for...of
    await Promise.all(['one', 'two', 'three'].map((value) => db.run('INSERT INTO test (value) VALUES (?)', [value])))

    const rows = await db.all<{ value: string }>('SELECT value FROM test WHERE value != ? ORDER BY value', ['two'])
    expect(rows.length).toBe(2)
    expect(rows[0].value).toBe('one')
    expect(rows[1].value).toBe('three')
    await db.close()
  })

  it('handles transactions', async () => {
    const db = await openDatabase('test')
    await db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)')

    // Start transaction
    await db.exec('BEGIN TRANSACTION')

    try {
      // Add some data
      await db.run('INSERT INTO test (value) VALUES (?)', ['test1'])
      await db.run('INSERT INTO test (value) VALUES (?)', ['test2'])

      // Commit changes
      await db.exec('COMMIT')
    } catch (err) {
      // Rollback on error
      await db.exec('ROLLBACK')
      throw err
    }

    const rows = await db.all<{ value: string }>('SELECT value FROM test')
    expect(rows).toHaveLength(2)
    await db.close()
  })

  it('handles rollback on error', async () => {
    const db = await openDatabase('test')
    await db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)')

    // Start transaction
    await db.exec('BEGIN TRANSACTION')

    try {
      // Add some data
      await db.run('INSERT INTO test (value) VALUES (?)', ['test1'])
      // Force an error with invalid SQL
      await db.run('INSERT INVALID SQL')
      await db.exec('COMMIT')
    } catch (err) {
      // Rollback on error
      await db.exec('ROLLBACK')
    }

    const rows = await db.all<{ value: string }>('SELECT value FROM test')
    expect(rows).toHaveLength(0) // Nothing should have been committed
    await db.close()
  })

  it('supports all column types', async () => {
    const db = await openDatabase('test')
    await db.exec(`
      CREATE TABLE test (
        id INTEGER PRIMARY KEY,
        text_val TEXT,
        int_val INTEGER,
        real_val REAL,
        bool_val INTEGER,
        date_val INTEGER,
        blob_val BLOB
      )
    `)

    const now = Date.now()
    await db.run(
      'INSERT INTO test (text_val, int_val, real_val, bool_val, date_val, blob_val) VALUES (?, ?, ?, ?, ?, ?)',
      ['hello', 42, 3.14, 1, now, Buffer.from('binary data')]
    )

    type TestRow = {
      text_val: string
      int_val: number
      real_val: number
      bool_val: number
      date_val: number
      blob_val: Buffer
    }

    const row = await db.get<TestRow>('SELECT * FROM test')
    expect(row).toBeDefined()

    // Use optional chaining to avoid non-null assertions
    expect(row?.text_val).toBe('hello')
    expect(row?.int_val).toBe(42)
    expect(row?.real_val).toBe(3.14)
    expect(row?.bool_val).toBe(1)
    expect(row?.date_val).toBe(now)
    expect(Buffer.isBuffer(row?.blob_val)).toBe(true)
    expect(row?.blob_val.toString()).toBe('binary data')

    await db.close()
  })
})
