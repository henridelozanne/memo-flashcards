import { describe, it, expect } from 'vitest'
import { syncLocalToRemote, syncRemoteToLocal, isSyncNeeded } from '../../lib/sync'

describe('Sync module contract', () => {
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
