import { defineStore } from 'pinia'
import { ref } from 'vue'
import { detectSystemLanguage } from '~/utils/language'

export const useUserProfileStore = defineStore('userProfile', () => {
  // Données du profil utilisateur
  const firstName = ref<string>('')
  const goal = ref<string>('')
  const situation = ref<string>('')
  const notificationHour = ref<string>('')
  const language = ref<string>('en')
  const hasCompletedOnboarding = ref<boolean | null>(null) // null = not checked yet

  // Charger toutes les données utilisateur depuis SQLite local
  async function loadUserData(): Promise<void> {
    // Only run once
    if (hasCompletedOnboarding.value !== null) return

    try {
      // Lazy import to avoid circular dependencies
      const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
      const { getCurrentUserId } = useSupabaseAuth()
      const currentUserId = await getCurrentUserId()

      const { useUserProfile } = await import('~/composables/useUserProfile')
      const { loadUserProfile } = useUserProfile()
      const profile = await loadUserProfile(currentUserId)

      if (profile) {
        // Populate all fields from SQLite
        firstName.value = profile.first_name
        goal.value = profile.goal
        situation.value = profile.situation
        notificationHour.value = profile.notification_hour
        language.value = profile.language || detectSystemLanguage()
        hasCompletedOnboarding.value = !!profile.onboarding_completed_at
      } else {
        // Premier lancement : détecter la langue du système
        language.value = detectSystemLanguage()
        hasCompletedOnboarding.value = false
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      language.value = detectSystemLanguage()
      hasCompletedOnboarding.value = false
    }
  }

  // Réinitialiser le profil utilisateur
  function resetProfile() {
    firstName.value = ''
    goal.value = ''
    situation.value = ''
    notificationHour.value = ''
    language.value = 'en'
    hasCompletedOnboarding.value = false
  }

  // Marquer l'onboarding comme terminé
  function completeOnboarding() {
    hasCompletedOnboarding.value = true
  }

  return {
    // État
    firstName,
    goal,
    situation,
    notificationHour,
    language,
    hasCompletedOnboarding,

    // Actions
    loadUserData,
    resetProfile,
    completeOnboarding,
  }
})
