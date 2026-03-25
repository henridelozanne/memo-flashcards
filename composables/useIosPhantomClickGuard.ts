import { onMounted, onUnmounted } from 'vue'

/**
 * Protection contre les "phantom clicks" iOS au retour du background.
 *
 * Sur WKWebView, quand le clavier réapparaît sur un champ après un retour
 * au premier plan, iOS scrolle la page pour garder le champ visible.
 * Durant ce scroll, le touchend peut atterrir sur un button[type="button"]
 * (Annuler, Retour) qui a bougé → click fantôme → navigation non souhaitée.
 *
 * Fix : au touchstart sur un champ texte, si on vient de revenir du background,
 * on pose `data-ios-kb-resume` sur le body pour bloquer pointer-events sur
 * les button[type="button"] le temps que l'animation du clavier se stabilise.
 * Le CSS correspondant est dans app.vue.
 */
export function useIosPhantomClickGuard() {
  let justReturnedFromBackground = false
  let returnFromBackgroundTimer: ReturnType<typeof setTimeout> | null = null
  let blockNavTimer: ReturnType<typeof setTimeout> | null = null

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      justReturnedFromBackground = true
      if (returnFromBackgroundTimer) clearTimeout(returnFromBackgroundTimer)
      returnFromBackgroundTimer = setTimeout(() => {
        justReturnedFromBackground = false
      }, 5000)
    } else {
      justReturnedFromBackground = false
      if (returnFromBackgroundTimer) clearTimeout(returnFromBackgroundTimer)
    }
  }

  const onTouchStart = (e: TouchEvent) => {
    if (!justReturnedFromBackground) return
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
    if (!isInput) return
    justReturnedFromBackground = false
    if (returnFromBackgroundTimer) clearTimeout(returnFromBackgroundTimer)
    document.body.dataset.iosKbResume = '1'
    if (blockNavTimer) clearTimeout(blockNavTimer)
    blockNavTimer = setTimeout(() => {
      delete document.body.dataset.iosKbResume
    }, 600)
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('touchstart', onTouchStart, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    document.removeEventListener('touchstart', onTouchStart)
    if (returnFromBackgroundTimer) clearTimeout(returnFromBackgroundTimer)
    if (blockNavTimer) clearTimeout(blockNavTimer)
  })
}
