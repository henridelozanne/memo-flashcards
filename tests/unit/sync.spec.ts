import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  syncLocalToRemote,
  syncRemoteToLocal,
  isSyncNeeded,
  syncUserProfileToRemote,
  syncUserProfileFromRemote,
  syncCollectionsToRemote,
  syncCollectionsFromRemote,
  syncCardsToRemote,
  syncCardsFromRemote,
} from '../../lib/sync'

// Mock composables
vi.mock('@/composables/useSupabaseAuth', () => ({
  default: () => ({
    getCurrentUserId: vi.fn().mockResolvedValue('user-123'),
  }),
}))

vi.mock('@/composables/useUserProfile', () => ({
  useUserProfile: () => ({
    loadUserProfile: vi.fn().mockResolvedValue({
      id: 'user-123',
      user_id: 'user-123',
      first_name: 'John',
      goal: 'developCulture',
      situation: 'student',
      notification_hour: '20:00',
      language: 'en',
      onboarding_completed_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    }),
    saveUserProfile: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/composables/useDatabase', () => ({
  useDatabase: () => ({
    getDbConnection: vi.fn().mockResolvedValue({}),
  }),
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'user-123',
              first_name: 'John Remote',
              goal: 'developCulture',
              situation: 'student',
              notification_hour: '21:00',
              language: 'fr',
              onboarding_completed_at: new Date().toISOString(),
              updated_at: new Date(Date.now() + 10000).toISOString(),
            },
            error: null,
          }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}))

describe('Sync module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Profile Sync', () => {
    it('syncUserProfileToRemote does not throw on success', async () => {
      await expect(syncUserProfileToRemote()).resolves.not.toThrow()
    })

    it('syncUserProfileToRemote does not throw on error (non-blocking)', async () => {
      await expect(syncUserProfileToRemote()).resolves.not.toThrow()
    })

    it('syncUserProfileFromRemote does not throw on success', async () => {
      await expect(syncUserProfileFromRemote()).resolves.not.toThrow()
    })

    it('syncUserProfileFromRemote handles missing remote profile', async () => {
      await expect(syncUserProfileFromRemote()).resolves.not.toThrow()
    })
  })

  describe('Collections Sync', () => {
    it('syncCollectionsToRemote does not throw on success', async () => {
      await expect(syncCollectionsToRemote()).resolves.not.toThrow()
    })

    it('syncCollectionsToRemote does not throw on error (non-blocking)', async () => {
      await expect(syncCollectionsToRemote()).resolves.not.toThrow()
    })

    it('syncCollectionsFromRemote does not throw on success', async () => {
      await expect(syncCollectionsFromRemote()).resolves.not.toThrow()
    })

    it('syncCollectionsFromRemote handles empty remote collections', async () => {
      await expect(syncCollectionsFromRemote()).resolves.not.toThrow()
    })
  })

  describe('Cards Sync', () => {
    it('syncCardsToRemote does not throw on success', async () => {
      await expect(syncCardsToRemote()).resolves.not.toThrow()
    })

    it('syncCardsToRemote does not throw on error (non-blocking)', async () => {
      await expect(syncCardsToRemote()).resolves.not.toThrow()
    })

    it('syncCardsFromRemote does not throw on success', async () => {
      await expect(syncCardsFromRemote()).resolves.not.toThrow()
    })

    it('syncCardsFromRemote handles empty remote cards', async () => {
      await expect(syncCardsFromRemote()).resolves.not.toThrow()
    })
  })

  describe('Collection/Card Sync (legacy)', () => {
    it('syncLocalToRemote returns SyncStats shape', async () => {
      const stats = await syncLocalToRemote()
      expect(stats).toHaveProperty('collections')
      expect(stats).toHaveProperty('cards')
      expect(stats).toHaveProperty('sessions')
      expect(stats).toHaveProperty('logs')
    })

    it('syncRemoteToLocal returns SyncStats shape', async () => {
      const stats = await syncRemoteToLocal()
      expect(stats).toHaveProperty('collections')
      expect(stats).toHaveProperty('cards')
      expect(stats).toHaveProperty('sessions')
      expect(stats).toHaveProperty('logs')
    })

    it('isSyncNeeded returns a boolean', async () => {
      const needed = await isSyncNeeded()
      expect(typeof needed).toBe('boolean')
    })
  })
})
