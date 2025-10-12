import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import createDb from '../../lib/db'

const dbPath = 'memoflash.sqlite'

describe('Database', () => {
  const db = createDb()

  beforeEach(async () => {
    // Clean up test database before each test
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
    }
    await db.initDb()
  })

  describe('Collections', () => {
    it('creates and retrieves collections', async () => {
      const collection = await db.createCollection('Test Collection')
      expect(collection.name).toBe('Test Collection')
      expect(collection.id).toBeDefined()

      const collections = await db.getCollections()
      expect(collections).toHaveLength(1)
      expect(collections[0].name).toBe('Test Collection')
    })

    it('prevents duplicate collection names', async () => {
      await db.createCollection('Test Collection')
      await expect(db.createCollection('Test Collection')).rejects.toThrow()
    })

    it('soft deletes collections', async () => {
      const collection = await db.createCollection('Test')
      await db.softDeleteCollection(collection.id)

      const visible = await db.getCollections(false)
      expect(visible).toHaveLength(0)

      const all = await db.getCollections(true)
      expect(all).toHaveLength(1)
      expect(all[0].deleted_at).toBeDefined()
    })
  })

  describe('Cards', () => {
    let testCollectionId: string

    beforeEach(async () => {
      const collection = await db.createCollection('Test Collection')
      testCollectionId = collection.id
    })

    it('creates and retrieves cards', async () => {
      const card = await db.createCard(testCollectionId, 'Question', 'Answer')
      expect(card.question).toBe('Question')
      expect(card.answer).toBe('Answer')
      expect(card.collection_id).toBe(testCollectionId)

      const cards = await db.getCardsByCollection(testCollectionId)
      expect(cards).toHaveLength(1)
      expect(cards[0].id).toBe(card.id)
    })

    it('updates card details', async () => {
      const card = await db.createCard(testCollectionId, 'Original', 'Answer')
      await db.updateCard(card.id, {
        question: 'Updated',
        answer: 'New Answer',
        compartment: 2
      })

      const cards = await db.getCardsByCollection(testCollectionId)
      expect(cards[0].question).toBe('Updated')
      expect(cards[0].answer).toBe('New Answer')
      expect(cards[0].compartment).toBe(2)
    })

    it('soft deletes cards', async () => {
      const card = await db.createCard(testCollectionId, 'Q', 'A')
      await db.softDeleteCard(card.id)

      const cards = await db.getCardsByCollection(testCollectionId)
      expect(cards).toHaveLength(0)
    })
  })

  describe('Review Sessions', () => {
    it('creates and updates review sessions', async () => {
      const session = await db.createReviewSession()
      expect(session.id).toBeDefined()
      expect(session.started_at).toBeDefined()
      expect(session.ended_at).toBeNull()

      const stats = { total: 10, correct: 7, wrong: 3 }
      await db.endReviewSession(session.id, stats)
      
      // Add log entry
      const collection = await db.createCollection('Test')
      const card = await db.createCard(collection.id, 'Q', 'A')
      await db.addReviewLog(card.id, session.id, 'correct')
    })
  })

  describe('Meta', () => {
    it('stores and retrieves meta values', async () => {
      const testData = { test: 'value', num: 42 }
      await db.setMeta('test_key', testData)
      const retrieved = await db.getMeta('test_key')
      expect(retrieved).toEqual(testData)
    })

    it('returns null for missing meta keys', async () => {
      const value = await db.getMeta('missing')
      expect(value).toBeNull()
    })
  })
})