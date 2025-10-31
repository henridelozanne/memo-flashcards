import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDatabase } from '~/composables/useDatabase'

// Mock the sqlite library
const mockConnection = {
  exec: vi.fn(),
  close: vi.fn(),
}

const mockOpenDatabase = vi.fn()

vi.mock('~/lib/sqlite', () => ({
  default: mockOpenDatabase,
}))

describe('useDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks
    mockOpenDatabase.mockResolvedValue(mockConnection)
    mockConnection.exec.mockResolvedValue(undefined)
    mockConnection.close.mockResolvedValue(undefined)
  })

  describe('getDbConnection', () => {
    it('should initialize database connection and create tables', async () => {
      const { getDbConnection } = useDatabase()
      const connection = await getDbConnection()

      expect(mockOpenDatabase).toHaveBeenCalledWith('memoflash')
      expect(mockConnection.exec).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS collections')
      )
      expect(mockConnection.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS cards'))
      expect(connection).toBe(mockConnection)
    })
  })

  describe('closeConnection', () => {
    it('should close the database connection', async () => {
      const { getDbConnection, closeConnection } = useDatabase()

      // First get a connection
      await getDbConnection()

      // Then close it
      await closeConnection()

      expect(mockConnection.close).toHaveBeenCalled()
    })

    it('should handle close when no connection exists', async () => {
      const { closeConnection } = useDatabase()

      // Should not throw when no connection exists
      await expect(closeConnection()).resolves.toBeUndefined()
    })
  })
})
