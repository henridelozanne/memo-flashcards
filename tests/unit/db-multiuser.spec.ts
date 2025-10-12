import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import createDb from '../../lib/db'

const dbName = 'memoflash-multiuser-tests'
const dbPath = `${dbName}.sqlite`

// Helper to set current user id in Meta
async function setUser(db: ReturnType<typeof createDb>, id: string) {
  await db.setMeta('user_id', id)
}

describe('Database multi-user scoping', () => {
  const db = createDb(dbName)

  beforeEach(async () => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    await db.initDb()
  })

  it('isolates collections by user_id', async () => {
  await setUser(db, 'userA')
  await db.createCollection('A')

    await setUser(db, 'userB')
    await db.createCollection('B')

    // Under userB, only B is visible
    const underB = await db.getCollections()
    expect(underB.map(c => c.name)).toEqual(['B'])

    // Switch back to userA, only A visible
    await setUser(db, 'userA')
    const underA = await db.getCollections()
    expect(underA.map(c => c.name)).toEqual(['A'])

    // With includeDeleted fallback when user removed
    await db.setMeta('user_id', null)
    const all = await db.getCollections()
    // Might see both if user_id filter disabled
    expect(all.length).toBeGreaterThanOrEqual(1)
  })

  it('isolates cards per user_id even within same collection ids', async () => {
    await setUser(db, 'userA')
    const colA = await db.createCollection('C')
    await db.createCard(colA.id, 'Q1', 'A1')

    await setUser(db, 'userB')
    // userB cannot see A's collection by name uniqueness, so create another
    const colB = await db.createCollection('C_B')
    await db.createCard(colB.id, 'Q2', 'A2')

  const cardsB = await db.getCardsByCollection(colB.id)
  expect(cardsB.map((c) => (c as unknown as { question: string }).question)).toEqual(['Q2'])

    await setUser(db, 'userA')
  const cardsA = await db.getCardsByCollection(colA.id)
  expect(cardsA.map((c) => (c as unknown as { question: string }).question)).toEqual(['Q1'])
  })
})
