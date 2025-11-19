import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserProfileStore } from '~/store/userProfile'
import useSupabaseAuth from '~/composables/useSupabaseAuth'

export function useNotificationTime() {
  const { t } = useI18n()
  const userProfileStore = useUserProfileStore()
  const { updateNotificationHour } = useSupabaseAuth()

  const timeInput = ref<HTMLInputElement | null>(null)
  const selectedTime = ref<string>('')
  const initialTime = ref<string>('')
  const statusMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

  // Ouvrir le time picker natif
  async function openTimePicker() {
    selectedTime.value = userProfileStore.notificationHour || '20:00'
    initialTime.value = selectedTime.value

    // Attendre que la valeur soit mise à jour dans le DOM avant d'ouvrir le picker
    await nextTick()

    if (timeInput.value) {
      timeInput.value.style.pointerEvents = 'auto'
      timeInput.value.focus()
      timeInput.value.click()
      // Remettre pointer-events: none après
      setTimeout(() => {
        if (timeInput.value) {
          timeInput.value.style.pointerEvents = 'none'
        }
      }, 100)
    }
  }

  // Gérer le changement d'heure
  async function handleTimeChange() {
    if (!selectedTime.value) return

    // Ne sauvegarder que si la valeur a réellement changé
    if (selectedTime.value === initialTime.value) return

    try {
      await updateNotificationHour(selectedTime.value)
      statusMessage.value = {
        type: 'success',
        text: t('settings.reminderTimeUpdated'),
      }

      // Masquer le message après 3 secondes
      setTimeout(() => {
        statusMessage.value = null
      }, 3000)
    } catch (error) {
      statusMessage.value = {
        type: 'error',
        text: t('settings.reminderTimeError'),
      }

      // Masquer le message après 5 secondes
      setTimeout(() => {
        statusMessage.value = null
      }, 5000)
    }
  }

  return {
    timeInput,
    selectedTime,
    statusMessage,
    openTimePicker,
    handleTimeChange,
  }
}
