import { computed } from 'vue'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useI18n } from 'vue-i18n'
import { useUserProfileStore } from '~/store/userProfile'

const NOTIFICATIONS_WINDOW = 30
const RESCHEDULE_THRESHOLD = 7

export const useNotifications = () => {
  const { t } = useI18n()
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
   * Annule toutes les notifications en attente
   */
  const cancelAllNotifications = async () => {
    try {
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        })
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error)
    }
  }

  /**
   * Planifie une notification par jour pour les N prochains jours,
   * chacune avec un message aléatoire différent.
   */
  const scheduleDailyNotification = async () => {
    try {
      const permission = await LocalNotifications.checkPermissions()
      if (permission.display !== 'granted') {
        return
      }

      await cancelAllNotifications()

      const [hours, minutes] = notificationHour.value.split(':').map(Number)
      const now = new Date()
      const notifications = []

      // Si l'heure choisie est déjà passée aujourd'hui, commencer à demain
      const firstOccurrence = new Date(now)
      firstOccurrence.setHours(hours, minutes, 0, 0)
      const startOffset = firstOccurrence <= now ? 1 : 0

      for (let i = 0; i < NOTIFICATIONS_WINDOW; i += 1) {
        const date = new Date(now)
        date.setDate(date.getDate() + startOffset + i)
        date.setHours(hours, minutes, 0, 0)

        notifications.push({
          id: i + 1,
          title: 'Cortx',
          body: getRandomNotificationMessage(),
          schedule: {
            at: date,
            allowWhileIdle: true,
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        })
      }

      await LocalNotifications.schedule({ notifications })
    } catch (error) {
      console.error('Error scheduling notifications:', error)
    }
  }

  /**
   * Met à jour les notifications (à appeler quand l'heure change)
   */
  const updateDailyNotification = async () => {
    await cancelAllNotifications()
    await scheduleDailyNotification()
  }

  /**
   * Replanifie les notifications si la fenêtre est presque épuisée.
   * À appeler au démarrage de l'app.
   */
  const ensureNotificationScheduled = async () => {
    if (!notificationHour.value) return

    try {
      const permission = await LocalNotifications.checkPermissions()
      if (permission.display !== 'granted') return

      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length < RESCHEDULE_THRESHOLD) {
        await scheduleDailyNotification()
      }
    } catch (error) {
      console.error('Error ensuring notification is scheduled:', error)
    }
  }

  return {
    scheduleDailyNotification,
    cancelAllNotifications,
    updateDailyNotification,
    ensureNotificationScheduled,
  }
}
