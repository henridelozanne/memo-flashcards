import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

export function useExternalLink() {
  async function openLink(url: string) {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url })
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }
  return { openLink }
}
