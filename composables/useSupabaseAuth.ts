import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

// Lazy import de supabase pour éviter les erreurs process côté client
let supabaseInstance: any = null

async function getSupabase() {
  if (!supabaseInstance) {
    const { supabase } = await import('../lib/supabase')
    supabaseInstance = supabase
  }
  return supabaseInstance
}

// Clés pour Preferences
const USER_ID_KEY = 'memo_user_id'

export default function useSupabaseAuth() {
  const userId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function initAuth() {
    isLoading.value = true
    error.value = null

    try {
      const supabase = await getSupabase()

      // Check existing session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // Sign in anonymously if no session exists
        const {
          data: { user },
          error: signInError,
        } = await supabase.auth.signInAnonymously()

        if (signInError) throw signInError
        if (!user?.id) throw new Error('Failed to get user ID after anonymous sign in')
        userId.value = user.id

        // Persister le userId
        await Preferences.set({ key: USER_ID_KEY, value: user.id })
      } else {
        userId.value = session.user.id

        // Persister le userId
        await Preferences.set({ key: USER_ID_KEY, value: session.user.id })
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown auth error')

      // Try to get persisted userId first
      try {
        const { value } = await Preferences.get({ key: USER_ID_KEY })
        if (value) {
          userId.value = value
          console.log('[Auth] Using persisted userId:', value)
          return
        }
      } catch (prefError) {
        console.error('[Auth] Failed to get persisted userId:', prefError)
      }

      // Fall back to generating a local ID if auth fails and no persisted ID
      const newId = crypto.randomUUID()
      userId.value = newId

      // Persister le userId généré
      try {
        await Preferences.set({ key: USER_ID_KEY, value: newId })
        console.log('[Auth] Generated and persisted new userId:', newId)
      } catch (prefError) {
        console.error('[Auth] Failed to persist generated userId:', prefError)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function getCurrentUserId(): Promise<string> {
    // Try to get from memory first
    if (userId.value) return userId.value

    // Try to get from persistent storage
    try {
      const { value } = await Preferences.get({ key: USER_ID_KEY })
      if (value) {
        userId.value = value
        return value
      }
    } catch (e) {
      console.error('[Auth] Failed to get persisted userId:', e)
    }

    // Initialize auth if no userId yet
    await initAuth()
    if (!userId.value) {
      throw new Error('Unable to resolve user id after initAuth')
    }
    return userId.value
  }

  async function loadUserProfile() {
    try {
      const supabase = await getSupabase()

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.id) return null

      // Load full user profile
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single()

      if (error || !data) return null

      return {
        firstName: data.first_name || '',
        goal: data.goal || '',
        situation: data.situation || '',
        notificationHour: data.notification_hour || '20:00',
        language: data.language || 'en',
        hasCompletedOnboarding: !!data.onboarding_completed_at,
      }
    } catch (e) {
      console.error('Error loading user profile:', e)
      return null
    }
  }

  return {
    userId,
    initAuth,
    loadUserProfile,
    getCurrentUserId,
  }
}

// Types for Supabase Auth
declare module '@supabase/supabase-js' {
  interface User {
    id: string
  }
}
