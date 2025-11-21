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
      console.log('Syncing local profile to Supabase (local is newer)')

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
      console.log('Profile synced to Supabase successfully')
    } else {
      console.log('Remote profile is up to date, no sync needed')
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
      console.log('No remote profile found')
      return
    }

    // 4. Compare timestamps
    const remoteUpdatedAt = new Date(remoteProfile.updated_at).getTime()
    const localUpdatedAt = localProfile?.updated_at || 0

    if (remoteUpdatedAt > localUpdatedAt) {
      // Remote is more recent → pull to SQLite
      console.log('Syncing remote profile to local (remote is newer)')

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

      console.log('Profile synced from Supabase successfully')
    } else {
      console.log('Local profile is up to date, no sync needed')
    }
  } catch (error) {
    console.error('Error syncing profile from remote:', error)
    throw error // This one is blocking, so we throw
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
