import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useDeleteData() {
  const router = useRouter()
  const showDeleteConfirm = ref(false)
  const isDeleting = ref(false)

  function openDeleteConfirm() {
    showDeleteConfirm.value = true
  }

  function closeDeleteConfirm() {
    showDeleteConfirm.value = false
  }

  async function handleDeleteData() {
    isDeleting.value = true
    try {
      // 1. Get database connection
      const { useDatabase } = await import('~/composables/useDatabase')
      const { getDbConnection } = useDatabase()
      const db = await getDbConnection()

      // 2. Get current user ID
      const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
      const { getCurrentUserId } = useSupabaseAuth()
      const userId = await getCurrentUserId()

      // 3. Delete all data from SQLite (respecter l'ordre des foreign keys)
      // Supprimer d'abord les review_logs liées aux cards de l'utilisateur
      // (même si leur user_id est NULL à cause de la migration)
      await db.run('DELETE FROM review_logs WHERE card_id IN (SELECT id FROM cards WHERE user_id = ?)', [userId])
      await db.run('DELETE FROM review_sessions WHERE user_id = ?', [userId])
      await db.run('DELETE FROM cards WHERE user_id = ?', [userId])
      await db.run('DELETE FROM collections WHERE user_id = ?', [userId])
      await db.run('DELETE FROM user_profiles WHERE user_id = ?', [userId])

      // 4. Delete all data from Supabase
      const { supabase } = await import('~/lib/supabase')

      // Delete cards first (foreign key constraint)
      await supabase.from('cards').delete().eq('user_id', userId)

      // Delete collections
      await supabase.from('collections').delete().eq('user_id', userId)

      // Delete user profile
      await supabase.from('user_profiles').delete().eq('id', userId)

      // 5. Sign out user
      await supabase.auth.signOut()

      // 6. Clear all stores
      const { useUserProfileStore } = await import('~/store/userProfile')
      const { useOnboardingStore } = await import('~/store/onboarding')
      const userProfileStore = useUserProfileStore()
      const onboardingStore = useOnboardingStore()

      // Detect system language before resetting
      const { detectSystemLanguage } = await import('~/utils/language')
      const systemLanguage = detectSystemLanguage()

      userProfileStore.$reset()
      onboardingStore.resetOnboarding()

      // Set language to system language
      userProfileStore.language = systemLanguage

      // 7. Clear Capacitor Preferences cache
      const { Preferences } = await import('@capacitor/preferences')
      await Preferences.clear()

      // 8. Redirect to onboarding
      closeDeleteConfirm()
      router.push('/onboarding/welcome')
    } catch (error) {
      console.error('Error deleting data:', error)
      closeDeleteConfirm()
      throw error
    } finally {
      isDeleting.value = false
    }
  }

  return {
    showDeleteConfirm,
    isDeleting,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteData,
  }
}
