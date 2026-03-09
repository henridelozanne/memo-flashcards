import { registerPlugin } from '@capacitor/core'
import { Capacitor } from '@capacitor/core'
import type { Card } from '~/lib/types'

interface WidgetDataPlugin {
  updateCards(options: { cards: Array<{ question: string; answer: string }> }): Promise<void>
}

const WidgetData = registerPlugin<WidgetDataPlugin>('WidgetData')

// Nombre maximum de cartes à envoyer au widget
const MAX_WIDGET_CARDS = 30

/**
 * Synchronise un échantillon de cartes vers le widget iOS natif.
 * Ne fait rien sur les autres plateformes.
 */
export const useWidgetData = () => {
  const syncCardsToWidget = async (cards: Card[]) => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return

    try {
      // On mélange et on prend un échantillon pour ne pas saturer UserDefaults
      const shuffled = [...cards]
        .filter((c) => !c.deleted_at && !c.archived)
        .sort(() => Math.random() - 0.5)
        .slice(0, MAX_WIDGET_CARDS)
        .map((c) => ({ question: c.question, answer: c.answer }))

      await WidgetData.updateCards({ cards: shuffled })
    } catch (e) {
      // Non-bloquant : si le plugin n'est pas encore configuré on ignore silencieusement
      console.warn('[WidgetData] Failed to sync cards to widget:', e)
    }
  }

  return { syncCardsToWidget }
}
