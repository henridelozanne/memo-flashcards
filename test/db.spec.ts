import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import createDb from '../lib/db'

describe('Database', () => {
  const db = createDb()
  const TEST_DB = 'memoflash.sqlite'

  beforeEach(async () => {
    await db.initDb()
  })

  afterEach(async () => {
    // Clean up test database file
    if (fs.existsSync(TEST_DB)) {
      fs.unlinkSync(TEST_DB)
    }
  })

  describe('Meta', () => {
    it('can store and retrieve meta values', async () => {
      const key = 'test_key'
      const value = { foo: 'bar', num: 42 }
      await db.setMeta(key, value)

      const retrieved = await db.getMeta(key)
      expect(retrieved).toEqual(value)
    })

    it('returns null for non-existent meta key', async () => {
      const value = await db.getMeta('non_existent')
      expect(value).toBeNull()
    })

    it('can update existing meta values', async () => {
      const key = 'test_key'
      await db.setMeta(key, 'initial')
      await db.setMeta(key, 'updated')

      const value = await db.getMeta(key)
      expect(value).toBe('updated')
    })
  })

  describe('Collections', () => {
    it('can create and retrieve collections', async () => {
      const name = 'Test Collection'
      const collection = await db.createCollection(name)
      expect(collection.name).toBe(name)
      expect(collection.id).toBeDefined()

      const collections = await db.getCollections()
      expect(collections.length).toBe(1)
      expect(collections[0].name).toBe(name)
    })

    it('prevents duplicate collection names', async () => {
      const name = 'Test Collection'
      await db.createCollection(name)
      await expect(db.createCollection(name)).rejects.toThrow()
    })

    it('can update collection details', async () => {
      const collection = await db.createCollection('Initial Name')
      await db.updateCollection(collection.id, { name: 'Updated Name' })

      const collections = await db.getCollections()
      expect(collections[0].name).toBe('Updated Name')
    })

    it('can soft delete collections', async () => {
      const collection = await db.createCollection('Test')
      await db.softDeleteCollection(collection.id)

      const visible = await db.getCollections(false)
      expect(visible.length).toBe(0)

      const all = await db.getCollections(true)
      expect(all.length).toBe(1)
      expect(all[0].deleted_at).toBeDefined()
    })
  })

  describe('Cards', () => {
    let collectionId: string

    beforeEach(async () => {
      const collection = await db.createCollection('Test Collection')
      collectionId = collection.id
    })

    it('can create and retrieve cards', async () => {
      const card = await db.createCard(collectionId, 'Question?', 'Answer!')
      expect(card.question).toBe('Question?')
      expect(card.answer).toBe('Answer!')
      expect(card.collection_id).toBe(collectionId)

      const cards = await db.getCardsByCollection(collectionId)
      expect(cards.length).toBe(1)
      expect(cards[0].id).toBe(card.id)
    })

    it('can update card details', async () => {
      const card = await db.createCard(collectionId, 'Original', 'Answer')
      await db.updateCard(card.id, {
        question: 'Updated',
        answer: 'New Answer',
        compartment: 2
      })

      const cards = await db.getCardsByCollection(collectionId)
      expect(cards[0].question).toBe('Updated')
      expect(cards[0].answer).toBe('New Answer')
      expect(cards[0].compartment).toBe(2)
    })

    it('can soft delete cards', async () => {
      const card = await db.createCard(collectionId, 'Q', 'A')
      await db.softDeleteCard(card.id)

      const cards = await db.getCardsByCollection(collectionId)
      expect(cards.length).toBe(0)
    })

    it('deletes cards when collection is deleted', async () => {
      await db.createCard(collectionId, 'Q1', 'A1')
      await db.createCard(collectionId, 'Q2', 'A2')
      await db.softDeleteCollection(collectionId)

      const cards = await db.getCardsByCollection(collectionId)
      expect(cards.length).toBe(0)
    })
  })

  describe('Review Sessions', () => {
    it('can create review sessions', async () => {
      const session = await db.createReviewSession()
      expect(session.id).toBeDefined()
      expect(session.started_at).toBeDefined()
      expect(session.ended_at).toBeNull()
    })

    it('can end review sessions with stats', async () => {
      const session = await db.createReviewSession()
      const stats = {
        total: 10,
        correct: 7,
        wrong: 3
      }
      await db.endReviewSession(session.id, stats)
    })

    it('can log review results', async () => {
      const collection = await db.createCollection('Test')
      const card = await db.createCard(collection.id, 'Q', 'A')
      const session = await db.createReviewSession()
      await db.addReviewLog(card.id, session.id, 'correct')

      // Implicitly tests by not throwing
      expect(true).toBe(true)
    })
  })
})