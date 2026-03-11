import { registerPlugin, Capacitor } from '@capacitor/core'
import type { Card } from '~/lib/types'
import { useDatabase } from './useDatabase'

interface WidgetDataPlugin {
  updateCards(options: { cards: Array<{ question: string; answer: string }> }): Promise<void>
}

const WidgetData = registerPlugin<WidgetDataPlugin>('WidgetData')

const MAX_WIDGET_CARDS = 30

const hasHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text)

export const useWidgetData = () => {
  const { getDbConnection } = useDatabase()

  const syncAllCardsToWidget = async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return

    try {
      const db = await getDbConnection()
      const allCards = await db.all<Card>('SELECT * FROM cards WHERE deleted_at IS NULL AND archived = 0')
      const filtered = [...allCards].filter((c) => !hasHtml(c.question) && !hasHtml(c.answer))

      // Tri déterministe pour la comparaison côté Swift (reloadAllTimelines seulement si données changées)
      const sorted = filtered
        .sort((a, b) => a.id.localeCompare(b.id))
        .slice(0, MAX_WIDGET_CARDS)
        .map((c) => ({ question: c.question, answer: c.answer }))

      await WidgetData.updateCards({ cards: sorted })
    } catch (e) {
      // silent fail
    }
  }

  return { syncAllCardsToWidget }
}
