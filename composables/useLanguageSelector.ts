import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserProfileStore } from '~/store/userProfile'
import useSupabaseAuth from '~/composables/useSupabaseAuth'
import { useUserProfile } from '~/composables/useUserProfile'
import { syncUserProfileToRemote } from '~/lib/sync'
import { usePosthog } from '~/composables/usePosthog'

export function useLanguageSelector() {
  const { t, locale } = useI18n()
  const userProfileStore = useUserProfileStore()
  const { getCurrentUserId } = useSupabaseAuth()
  const { updateLanguage: updateLanguageLocal } = useUserProfile()

  const languageSelect = ref<HTMLSelectElement | null>(null)
  const selectedLanguage = ref<string>('')
  const initialLanguage = ref<string>('')
  const statusMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

  // Ouvrir le select natif
  async function openLanguageSelector() {
    selectedLanguage.value = userProfileStore.language || 'en'
    initialLanguage.value = selectedLanguage.value

    // Attendre que la valeur soit mise à jour dans le DOM avant d'ouvrir le select
    await nextTick()

    if (languageSelect.value) {
      languageSelect.value.style.pointerEvents = 'auto'
      languageSelect.value.focus()
      languageSelect.value.click()
      // Remettre pointer-events: none après
      setTimeout(() => {
        if (languageSelect.value) {
          languageSelect.value.style.pointerEvents = 'none'
        }
      }, 100)
    }
  }

  // Gérer le changement de langue
  async function handleLanguageChange() {
    if (!selectedLanguage.value) return

    // Ne sauvegarder que si la valeur a réellement changé
    if (selectedLanguage.value === initialLanguage.value) return

    try {
      const userId = await getCurrentUserId()

      // Update in SQLite local
      await updateLanguageLocal(userId, selectedLanguage.value)

      // Update store
      userProfileStore.language = selectedLanguage.value

      // Changer la locale de l'application
      locale.value = selectedLanguage.value

      // Sync to Supabase (non-blocking)
      syncUserProfileToRemote().catch((err) => {
        console.error('Failed to sync language to remote:', err)
      })

      statusMessage.value = {
        type: 'success',
        text: t('settings.languageUpdated'),
      }

      // Track event
      const posthog = usePosthog()
      posthog.capture('language_changed', {
        previous_language: initialLanguage.value,
        new_language: selectedLanguage.value,
      })

      // Masquer le message après 3 secondes
      setTimeout(() => {
        statusMessage.value = null
      }, 3000)
    } catch (error) {
      statusMessage.value = {
        type: 'error',
        text: t('settings.languageError'),
      }

      // Masquer le message après 5 secondes
      setTimeout(() => {
        statusMessage.value = null
      }, 5000)
    }
  }

  return {
    languageSelect,
    selectedLanguage,
    statusMessage,
    openLanguageSelector,
    handleLanguageChange,
  }
}
