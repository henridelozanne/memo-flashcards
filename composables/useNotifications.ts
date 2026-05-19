import { computed } from 'vue'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useI18n } from 'vue-i18n'
import { useUserProfileStore } from '~/store/userProfile'

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
   * Planifie la notification quotidienne récurrente
   */
  const scheduleDailyNotification = async () => {
    try {
      // Vérifier la permission
      const permission = await LocalNotifications.checkPermissions()
      if (permission.display !== 'granted') {
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

      // Extraire l'heure choisie
      const [hours, minutes] = notificationHour.value.split(':').map(Number)

      // Planifier la notification récurrente quotidienne
      // On utilise `on` (composants calendrier) qui est le pattern correct pour iOS :
      // crée un UNCalendarNotificationTrigger qui se répète chaque jour à l'heure fixée.
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: 'Cortx',
            body: getRandomNotificationMessage(),
            schedule: {
              on: {
                hour: hours,
                minute: minutes,
              },
            },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      })
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

  /**
   * Replanifie la notification quotidienne si elle n'est pas déjà en attente.
   * À appeler au démarrage de l'app pour récupérer une notification supprimée
   * (réinstall, remise à zéro iOS, etc.).
   */
  const ensureNotificationScheduled = async () => {
    if (!notificationHour.value) return

    try {
      const permission = await LocalNotifications.checkPermissions()
      if (permission.display !== 'granted') return

      const pending = await LocalNotifications.getPending()
      const hasNotification = pending.notifications.some((n) => n.id === 1)
      if (!hasNotification) {
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
