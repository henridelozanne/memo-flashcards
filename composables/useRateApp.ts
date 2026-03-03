import { Preferences } from '@capacitor/preferences'
import { InAppReview } from '@capacitor-community/in-app-review'

const PREF_KEY = 'rate_app_requested'

export function useRateApp() {
  async function requestReviewIfEligible(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: PREF_KEY })
      if (value) return // Déjà demandé

      await InAppReview.requestReview()
      await Preferences.set({ key: PREF_KEY, value: 'true' })
    } catch (e) {
      // Silencieux — ne jamais bloquer l'utilisateur pour ça
    }
  }

  return { requestReviewIfEligible }
}
