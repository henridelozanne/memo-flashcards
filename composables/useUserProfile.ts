import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { UserProfile } from '~/lib/types'
import { useDatabase } from './useDatabase'

const userProfile = ref<UserProfile | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export const useUserProfile = () => {
  const { getDbConnection } = useDatabase()

  /**
   * Load user profile from SQLite local database
   */
  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    isLoading.value = true
    error.value = null

    try {
      const db = await getDbConnection()
      const result = await db.get<UserProfile>('SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1', [userId])

      userProfile.value = result || null
      return result || null
    } catch (e: any) {
      error.value = e.message || 'Error loading user profile'
      console.error('Error loading user profile from SQLite:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save or update user profile in SQLite local database
   */
  const saveUserProfile = async (data: {
    userId: string
    firstName: string
    goal: string
    situation: string
    notificationHour: string
    language: string
    onboardingCompletedAt?: number
    subscriptionStatus?: 'free' | 'monthly' | 'monthly_trial' | 'lifetime'
    subscriptionProductId?: string | null
    subscriptionExpiresAt?: number | null
    subscriptionUpdatedAt?: number | null
  }): Promise<void> => {
    error.value = null

    try {
      const db = await getDbConnection()
      const now = Date.now()

      // Check if profile exists
      const existing = await db.get<UserProfile>('SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1', [data.userId])

      if (existing) {
        const subscriptionStatus = data.subscriptionStatus ?? existing.subscription_status ?? 'free'
        const subscriptionProductId =
          data.subscriptionProductId !== undefined
            ? data.subscriptionProductId
            : (existing.subscription_product_id ?? null)
        const subscriptionExpiresAt =
          data.subscriptionExpiresAt !== undefined
            ? data.subscriptionExpiresAt
            : (existing.subscription_expires_at ?? null)
        const subscriptionUpdatedAt =
          data.subscriptionUpdatedAt !== undefined
            ? data.subscriptionUpdatedAt
            : (existing.subscription_updated_at ?? now)

        // Update existing profile
        await db.run(
          `UPDATE user_profiles 
           SET first_name = ?, goal = ?, situation = ?, notification_hour = ?, 
               language = ?, onboarding_completed_at = ?, subscription_status = ?,
               subscription_product_id = ?, subscription_expires_at = ?, subscription_updated_at = ?, updated_at = ?
           WHERE user_id = ?`,
          [
            data.firstName,
            data.goal,
            data.situation,
            data.notificationHour,
            data.language,
            data.onboardingCompletedAt || existing.onboarding_completed_at,
            subscriptionStatus,
            subscriptionProductId,
            subscriptionExpiresAt,
            subscriptionUpdatedAt,
            now,
            data.userId,
          ]
        )
      } else {
        // Create new profile
        const profileId = uuidv4()
        await db.run(
          `INSERT INTO user_profiles 
           (id, user_id, first_name, goal, situation, notification_hour, language, 
            onboarding_completed_at, subscription_status, subscription_product_id, subscription_expires_at,
            subscription_updated_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            profileId,
            data.userId,
            data.firstName,
            data.goal,
            data.situation,
            data.notificationHour,
            data.language,
            data.onboardingCompletedAt || null,
            data.subscriptionStatus || 'free',
            data.subscriptionProductId || null,
            data.subscriptionExpiresAt || null,
            data.subscriptionUpdatedAt || now,
            now,
            now,
          ]
        )
      }

      // Reload profile
      await loadUserProfile(data.userId)
    } catch (e: any) {
      error.value = e.message || 'Error saving user profile'
      console.error('Error saving user profile to SQLite:', e)
      throw e
    }
  }

  /**
   * Update notification hour in SQLite local database
   */
  const updateNotificationHour = async (userId: string, notificationHour: string): Promise<void> => {
    error.value = null

    try {
      const db = await getDbConnection()
      const now = Date.now()

      await db.run('UPDATE user_profiles SET notification_hour = ?, updated_at = ? WHERE user_id = ?', [
        notificationHour,
        now,
        userId,
      ])

      // Reload profile
      await loadUserProfile(userId)
    } catch (e: any) {
      error.value = e.message || 'Error updating notification hour'
      console.error('Error updating notification hour in SQLite:', e)
      throw e
    }
  }

  /**
   * Update language in SQLite local database
   */
  const updateLanguage = async (userId: string, language: string): Promise<void> => {
    error.value = null

    try {
      const db = await getDbConnection()
      const now = Date.now()

      await db.run('UPDATE user_profiles SET language = ?, updated_at = ? WHERE user_id = ?', [language, now, userId])

      // Reload profile
      await loadUserProfile(userId)
    } catch (e: any) {
      error.value = e.message || 'Error updating language'
      console.error('Error updating language in SQLite:', e)
      throw e
    }
  }

  /**
   * Update subscription status fields in SQLite local database
   */
  const updateSubscriptionStatus = async (data: {
    userId: string
    subscriptionStatus: 'free' | 'monthly' | 'monthly_trial' | 'lifetime'
    subscriptionProductId?: string | null
    subscriptionExpiresAt?: number | null
    subscriptionUpdatedAt?: number | null
  }): Promise<void> => {
    error.value = null

    try {
      const db = await getDbConnection()
      const now = Date.now()

      await db.run(
        `UPDATE user_profiles
         SET subscription_status = ?, subscription_product_id = ?,
             subscription_expires_at = ?, subscription_updated_at = ?, updated_at = ?
         WHERE user_id = ?`,
        [
          data.subscriptionStatus,
          data.subscriptionProductId || null,
          data.subscriptionExpiresAt || null,
          data.subscriptionUpdatedAt || now,
          now,
          data.userId,
        ]
      )

      await loadUserProfile(data.userId)
    } catch (e: any) {
      error.value = e.message || 'Error updating subscription status'
      console.error('Error updating subscription status in SQLite:', e)
      throw e
    }
  }

  return {
    userProfile,
    isLoading,
    error,
    loadUserProfile,
    saveUserProfile,
    updateNotificationHour,
    updateLanguage,
    updateSubscriptionStatus,
  }
}
