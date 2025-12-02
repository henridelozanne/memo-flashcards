import { computed } from 'vue'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useUserProfileStore } from '~/store/userProfile'
import { useCards } from '~/composables/useCards'
import { useI18n } from 'vue-i18n'

export const useNotifications = () => {
  const { t } = useI18n()
  const { getCardsDueToday } = useCards()
  const userProfileStore = useUserProfileStore()
  const notificationHour = computed(() => userProfileStore.notificationHour)

  /**
   * Récupère un message de notification aléatoire
   */
  const getRandomNotificationMessage = () => {
    const messageIndex = Math.floor(Math.random() * 22) + 1
    const firstName = userProfileStore.firstName || ''
    return t(`notifications.message${messageIndex}`, { firstName })
  }

  /**
   * Planifie la notification quotidienne
   */
  const scheduleDailyNotification = async () => {
    try {
      // Vérifier la permission
      const permission = await LocalNotifications.checkPermissions()
      if (permission.display !== 'granted') {
        console.log('Notification permission not granted')
        return
      }

      // Annuler toutes les notifications précédentes
      try {
        const pending = await LocalNotifications.getPending()
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: [{ id: 1 }] })
        }
      } catch (cancelError) {
        console.log('No pending notifications to cancel:', cancelError)
      }

      // Récupérer les cartes à réviser aujourd'hui
      const cardsToReview = await getCardsDueToday()

      // Ne planifier que s'il y a des cartes à réviser
      if (cardsToReview.length === 0) {
        console.log('No cards to review, notification not scheduled')
        return
      }

      // Calculer la prochaine heure de notification
      const [hours, minutes] = notificationHour.value.split(':').map(Number)
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)

      // Si l'heure est déjà passée aujourd'hui, planifier pour demain
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }

      // Planifier la notification
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: 'Remember',
            body: getRandomNotificationMessage(),
            schedule: {
              at: scheduledTime,
              allowWhileIdle: true,
            },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      })

      console.log(`Notification scheduled for ${scheduledTime.toLocaleString()}`)
    } catch (error) {
      console.error('Error scheduling notification:', error)
    }
  }

  /**
   * Annule toutes les notifications
   */
  const cancelAllNotifications = async () => {
    try {
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: [{ id: 1 }] })
        console.log('All notifications cancelled')
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error)
    }
  }

  /**
   * Met à jour la notification quotidienne (à appeler quand l'heure change)
   */
  const updateDailyNotification = async () => {
    await cancelAllNotifications()
    await scheduleDailyNotification()
  }

  return {
    scheduleDailyNotification,
    cancelAllNotifications,
    updateDailyNotification,
  }
}
