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

  // Charger toutes les données utilisateur depuis Supabase
  async function loadUserData(): Promise<void> {
    // Only run once
    if (hasCompletedOnboarding.value !== null) return

    try {
      // Lazy import to avoid circular dependencies
      const useSupabaseAuth = (await import('~/composables/useSupabaseAuth')).default
      const { loadUserProfile } = useSupabaseAuth()
      const profile = await loadUserProfile()

      if (profile) {
        // Populate all fields from Supabase
        firstName.value = profile.firstName
        goal.value = profile.goal
        situation.value = profile.situation
        notificationHour.value = profile.notificationHour
        language.value = profile.language || detectSystemLanguage()
        hasCompletedOnboarding.value = profile.hasCompletedOnboarding
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
