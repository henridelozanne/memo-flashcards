interface SyncStats {
  collections: number
  cards: number
  sessions: number
  logs: number
}

export async function syncLocalToRemote(): Promise<SyncStats> {
  // Will be implemented when remote sync is ready
  return {
    collections: 0,
    cards: 0,
    sessions: 0,
    logs: 0,
  }
}

export async function syncRemoteToLocal(): Promise<SyncStats> {
  // Will be implemented when remote sync is ready
  return {
    collections: 0,
    cards: 0,
    sessions: 0,
    logs: 0,
  }
}

export async function isSyncNeeded(): Promise<boolean> {
  // Will compare local and remote updated_at timestamps
  return false
}
