import * as Sentry from '@sentry/capacitor'
import { init as sentryVueInit } from '@sentry/vue'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const sentryDsn = config.public.sentryDsn as string

  // Ne pas initialiser Sentry en développement ou si le DSN n'est pas configuré
  if (!sentryDsn || process.env.NODE_ENV !== 'production') {
    return
  }

  try {
    // Initialiser Sentry Capacitor avec l'intégration Vue
    Sentry.init(
      {
        dsn: sentryDsn,

        // Performance monitoring
        tracesSampleRate: 0.2, // 20% des transactions pour ne pas surcharger le quota gratuit

        // Environnement
        environment: process.env.NODE_ENV || 'production',

        // Release tracking (utilise la version du package.json)
        release: `memo-flashcards@${config.public.appVersion || '0.1.0'}`,

        // Filtrer les erreurs non pertinentes
        ignoreErrors: [
          // Erreurs réseau communes
          'Network request failed',
          'NetworkError',
          'Failed to fetch',
          // Erreurs de navigateur
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
        ],

        // Avant d'envoyer l'événement, on peut le modifier/filtrer
        beforeSend(event, hint) {
          return event
        },

        // Configuration des breadcrumbs pour le contexte
        beforeBreadcrumb(breadcrumb) {
          // Filtrer les breadcrumbs sensibles si nécessaire
          if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
            return null // Ne garde que les console.error
          }
          return breadcrumb
        },
      },
      // Passer l'init de Vue comme second paramètre pour l'intégration
      sentryVueInit
    )
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error)
  }
})
