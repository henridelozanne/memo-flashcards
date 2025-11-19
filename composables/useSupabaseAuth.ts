import { ref } from 'vue'
import { useOnboardingStore } from '~/store/onboarding'

// Lazy import de supabase pour éviter les erreurs process côté client
let supabaseInstance: any = null

async function getSupabase() {
  if (!supabaseInstance) {
    const { supabase } = await import('../lib/supabase')
    supabaseInstance = supabase
  }
  return supabaseInstance
}

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
      } else {
        userId.value = session.user.id
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown auth error')
      // Fall back to generating a local ID if auth fails
      userId.value = crypto.randomUUID()
    } finally {
      isLoading.value = false
    }
  }

  async function getCurrentUserId(): Promise<string> {
    // Try to get from Supabase session first
    if (userId.value) return userId.value

    // Initialize auth if no userId yet
    await initAuth()
    if (!userId.value) {
      throw new Error('Unable to resolve user id after initAuth')
    }
    return userId.value
  }

  async function saveUserProfile() {
    if (!userId.value) {
      throw new Error('User ID not available')
    }

    try {
      const onboardingStore = useOnboardingStore()
      const supabase = await getSupabase()

      const { error: upsertError } = await supabase.from('user_profiles').upsert({
        id: userId.value,
        first_name: onboardingStore.firstName,
        goal: onboardingStore.goal,
        situation: onboardingStore.situation,
        notification_hour: onboardingStore.notificationHour,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (upsertError) throw upsertError
    } catch (e) {
      // Don't throw - allow onboarding to complete even if save fails
      console.error('Error saving user profile:', e)
    }
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
    saveUserProfile,
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
