interface SyncStats {
  collections: number
  cards: number
  sessions: number
  logs: number
}

/**
 * Sync user profile from SQLite local to Supabase remote
 * Non-blocking: catches errors and logs them without throwing
 */
export async function syncUserProfileToRemote(): Promise<void> {
  try {
    // Lazy imports to avoid circular dependencies
    const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
    const { getCurrentUserId } = useSupabaseAuth()
    const userId = await getCurrentUserId()

    const { useUserProfile } = await import('~/composables/useUserProfile')
    const { loadUserProfile } = useUserProfile()

    // 1. Load local profile from SQLite
    const localProfile = await loadUserProfile(userId)
    if (!localProfile) {
      return
    }

    // 2. Get Supabase instance
    const { supabase } = await import('./supabase')

    // 3. Load remote profile from Supabase
    const { data: remoteProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is ok
      throw fetchError
    }

    // 4. Compare timestamps and decide what to do
    if (!remoteProfile || localProfile.updated_at > new Date(remoteProfile.updated_at).getTime()) {
      // Local is more recent or remote doesn't exist → push to Supabase
      const { error: upsertError } = await supabase.from('user_profiles').upsert({
        id: userId,
        first_name: localProfile.first_name,
        goal: localProfile.goal,
        situation: localProfile.situation,
        notification_hour: localProfile.notification_hour,
        language: localProfile.language,
        onboarding_completed_at: localProfile.onboarding_completed_at
          ? new Date(localProfile.onboarding_completed_at).toISOString()
          : null,
        updated_at: new Date(localProfile.updated_at).toISOString(),
      })

      if (upsertError) throw upsertError
    } 
  } catch (error) {
    console.error('Error syncing profile to remote (non-blocking):', error)
    // Don't throw - this is non-blocking
  }
}

/**
 * Sync user profile from Supabase remote to SQLite local
 * Blocking: should be awaited at app startup
 */
export async function syncUserProfileFromRemote(): Promise<void> {
  try {
    // Lazy imports
    const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
    const { getCurrentUserId } = useSupabaseAuth()
    const userId = await getCurrentUserId()

    const { useUserProfile } = await import('~/composables/useUserProfile')
    const { loadUserProfile, saveUserProfile } = useUserProfile()

    // 1. Load local profile from SQLite
    const localProfile = await loadUserProfile(userId)

    // 2. Get Supabase instance
    const { supabase } = await import('./supabase')

    // 3. Load remote profile from Supabase
    const { data: remoteProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (!remoteProfile) {
      return
    }

    // 4. Compare timestamps
    const remoteUpdatedAt = new Date(remoteProfile.updated_at).getTime()
    const localUpdatedAt = localProfile?.updated_at || 0

    if (remoteUpdatedAt > localUpdatedAt) {
      // Remote is more recent → pull to SQLite
      await saveUserProfile({
        userId,
        firstName: remoteProfile.first_name || '',
        goal: remoteProfile.goal || '',
        situation: remoteProfile.situation || '',
        notificationHour: remoteProfile.notification_hour || '20:00',
        language: remoteProfile.language || 'en',
        onboardingCompletedAt: remoteProfile.onboarding_completed_at
          ? new Date(remoteProfile.onboarding_completed_at).getTime()
          : undefined,
      })

    }
  } catch (error) {
    throw error // This one is blocking, so we throw
  }
}

/**
 * Sync collections from SQLite local to Supabase remote
 * Non-blocking: catches errors and logs them without throwing
 */
export async function syncCollectionsToRemote(): Promise<void> {
  try {
    const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
    const { getCurrentUserId } = useSupabaseAuth()
    const userId = await getCurrentUserId()

    const { useDatabase } = await import('~/composables/useDatabase')
    const { getDbConnection } = useDatabase()

    // 1. Load local collections from SQLite
    const db = await getDbConnection()
    const localCollections = await db.all<any>('SELECT * FROM collections WHERE user_id = ?', [userId])

    if (!localCollections || localCollections.length === 0) {
      return
    }

    // 2. Get Supabase instance
    const { supabase } = await import('./supabase')

    // 3. Load remote collections from Supabase
    const { data: remoteCollections, error: fetchError } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) throw fetchError

    const remoteMap = new Map((remoteCollections || []).map((c: any) => [c.id, c]))

    // 4. Sync each local collection to remote if newer or missing
    const toUpsert: any[] = []

    for (const local of localCollections) {
      const remote = remoteMap.get(local.id)
      const localUpdatedAt = local.updated_at
      const remoteUpdatedAt = remote ? new Date(remote.updated_at).getTime() : 0

      if (!remote || localUpdatedAt > remoteUpdatedAt) {
        toUpsert.push({
          id: local.id,
          user_id: local.user_id,
          name: local.name,
          created_at: new Date(local.created_at).toISOString(),
          updated_at: new Date(local.updated_at).toISOString(),
          deleted_at: local.deleted_at ? new Date(local.deleted_at).toISOString() : null,
        })
      }
    }

    if (toUpsert.length > 0) {
      const { error: upsertError } = await supabase.from('collections').upsert(toUpsert)
      if (upsertError) throw upsertError
    }
  } catch (error) {
    console.error('Error syncing collections to remote (non-blocking):', error)
  }
}

/**
 * Sync collections from Supabase remote to SQLite local
 * Blocking: should be awaited at app startup
 */
export async function syncCollectionsFromRemote(): Promise<void> {
  try {
    const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
    const { getCurrentUserId } = useSupabaseAuth()
    const userId = await getCurrentUserId()

    const { useDatabase } = await import('~/composables/useDatabase')
    const { getDbConnection } = useDatabase()

    // 1. Get Supabase instance
    const { supabase } = await import('./supabase')

    // 2. Load remote collections from Supabase
    const { data: remoteCollections, error: fetchError } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) throw fetchError
    if (!remoteCollections || remoteCollections.length === 0) {
      return
    }

    // 3. Load local collections from SQLite
    const db = await getDbConnection()
    const localCollections = await db.all<any>('SELECT * FROM collections WHERE user_id = ?', [userId])

    const localMap = new Map((localCollections || []).map((c: any) => [c.id, c]))

    // 4. Sync each remote collection to local if newer or missing
    for (const remote of remoteCollections) {
      const local = localMap.get(remote.id)
      const remoteUpdatedAt = new Date(remote.updated_at).getTime()
      const localUpdatedAt = local?.updated_at || 0

      if (!local || remoteUpdatedAt > localUpdatedAt) {
        // Upsert to local SQLite
        const existingCount = await db.get<{ count: number }>(
          'SELECT COUNT(*) as count FROM collections WHERE id = ?',
          [remote.id]
        )

        if (existingCount && existingCount.count > 0) {
          await db.run(
            `UPDATE collections 
             SET user_id = ?, name = ?, created_at = ?, updated_at = ?, deleted_at = ?
             WHERE id = ?`,
            [
              remote.user_id,
              remote.name,
              new Date(remote.created_at).getTime(),
              remoteUpdatedAt,
              remote.deleted_at ? new Date(remote.deleted_at).getTime() : null,
              remote.id,
            ]
          )
        } else {
          await db.run(
            `INSERT INTO collections (id, user_id, name, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              remote.id,
              remote.user_id,
              remote.name,
              new Date(remote.created_at).getTime(),
              remoteUpdatedAt,
              remote.deleted_at ? new Date(remote.deleted_at).getTime() : null,
            ]
          )
        }
      }
    }

  } catch (error) {
    console.error('Error syncing collections from remote:', error)
    throw error
  }
}

/**
 * Sync cards from SQLite local to Supabase remote
 * Non-blocking: catches errors and logs them without throwing
 */
export async function syncCardsToRemote(): Promise<void> {
  try {
    const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
    const { getCurrentUserId } = useSupabaseAuth()
    const userId = await getCurrentUserId()

    const { useDatabase } = await import('~/composables/useDatabase')
    const { getDbConnection } = useDatabase()

    // 1. Load local cards from SQLite
    const db = await getDbConnection()
    const localCards = await db.all<any>('SELECT * FROM cards WHERE user_id = ?', [userId])

    if (!localCards || localCards.length === 0) {
      return
    }

    // 2. Get Supabase instance
    const { supabase } = await import('./supabase')

    // 3. Load remote cards from Supabase
    const { data: remoteCards, error: fetchError } = await supabase.from('cards').select('*').eq('user_id', userId)

    if (fetchError) throw fetchError

    const remoteMap = new Map((remoteCards || []).map((c: any) => [c.id, c]))

    // 4. Sync each local card to remote if newer or missing
    const toUpsert: any[] = []

    for (const local of localCards) {
      const remote = remoteMap.get(local.id)
      const localUpdatedAt = local.updated_at
      const remoteUpdatedAt = remote ? new Date(remote.updated_at).getTime() : 0

      if (!remote || localUpdatedAt > remoteUpdatedAt) {
        toUpsert.push({
          id: local.id,
          user_id: local.user_id,
          collection_id: local.collection_id,
          question: local.question,
          answer: local.answer,
          compartment: local.compartment,
          next_review_at: new Date(local.next_review_at).toISOString(),
          created_at: new Date(local.created_at).toISOString(),
          updated_at: new Date(local.updated_at).toISOString(),
          archived: local.archived || false,
          deleted_at: local.deleted_at ? new Date(local.deleted_at).toISOString() : null,
          correct_answers: local.correct_answers || 0,
          total_reviews: local.total_reviews || 0,
        })
      }
    }

    if (toUpsert.length > 0) {
      const { error: upsertError } = await supabase.from('cards').upsert(toUpsert)
      if (upsertError) throw upsertError
    }
  } catch (error) {
    console.error('Error syncing cards to remote (non-blocking):', error)
  }
}

/**
 * Sync cards from Supabase remote to SQLite local
 * Blocking: should be awaited at app startup
 */
export async function syncCardsFromRemote(): Promise<void> {
  try {
    const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
    const { getCurrentUserId } = useSupabaseAuth()
    const userId = await getCurrentUserId()

    const { useDatabase } = await import('~/composables/useDatabase')
    const { getDbConnection } = useDatabase()

    // 1. Get Supabase instance
    const { supabase } = await import('./supabase')

    // 2. Load remote cards from Supabase
    const { data: remoteCards, error: fetchError } = await supabase.from('cards').select('*').eq('user_id', userId)

    if (fetchError) throw fetchError
    if (!remoteCards || remoteCards.length === 0) {
      return
    }

    // 3. Load local cards from SQLite
    const db = await getDbConnection()
    const localCards = await db.all<any>('SELECT * FROM cards WHERE user_id = ?', [userId])

    const localMap = new Map((localCards || []).map((c: any) => [c.id, c]))

    // 4. Sync each remote card to local if newer or missing
    for (const remote of remoteCards) {
      const local = localMap.get(remote.id)
      const remoteUpdatedAt = new Date(remote.updated_at).getTime()
      const localUpdatedAt = local?.updated_at || 0

      if (!local || remoteUpdatedAt > localUpdatedAt) {
        // Upsert to local SQLite
        const existingCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM cards WHERE id = ?', [
          remote.id,
        ])

        if (existingCount && existingCount.count > 0) {
          await db.run(
            `UPDATE cards 
             SET user_id = ?, collection_id = ?, question = ?, answer = ?, 
                 compartment = ?, next_review_at = ?, created_at = ?, updated_at = ?, 
                 archived = ?, deleted_at = ?, correct_answers = ?, total_reviews = ?
             WHERE id = ?`,
            [
              remote.user_id,
              remote.collection_id,
              remote.question,
              remote.answer,
              remote.compartment,
              new Date(remote.next_review_at).getTime(),
              new Date(remote.created_at).getTime(),
              remoteUpdatedAt,
              remote.archived ? 1 : 0,
              remote.deleted_at ? new Date(remote.deleted_at).getTime() : null,
              remote.correct_answers || 0,
              remote.total_reviews || 0,
              remote.id,
            ]
          )
        } else {
          await db.run(
            `INSERT INTO cards 
             (id, user_id, collection_id, question, answer, compartment, next_review_at, 
              created_at, updated_at, archived, deleted_at, correct_answers, total_reviews)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              remote.id,
              remote.user_id,
              remote.collection_id,
              remote.question,
              remote.answer,
              remote.compartment,
              new Date(remote.next_review_at).getTime(),
              new Date(remote.created_at).getTime(),
              remoteUpdatedAt,
              remote.archived ? 1 : 0,
              remote.deleted_at ? new Date(remote.deleted_at).getTime() : null,
              remote.correct_answers || 0,
              remote.total_reviews || 0,
            ]
          )
        }
      }
    }

  } catch (error) {
    console.error('Error syncing cards from remote:', error)
    throw error
  }
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
