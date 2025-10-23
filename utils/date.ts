import { useI18n } from 'vue-i18n'

/**
 * Format a review date as "today", "tomorrow", or a localized date string.
 * @param timestamp number (ms since epoch)
 */
export function formatReviewDate(timestamp: number): string {
  const { locale, t } = useI18n()
  const now = new Date()
  const date = new Date(timestamp)

  // Remove time for comparison
  const nowYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateYMD = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffDays = Math.round((dateYMD.getTime() - nowYMD.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return t('date.today')
  if (diffDays === 1) return t('date.tomorrow')
  return date.toLocaleDateString(locale.value)
}
