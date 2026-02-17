import posthog from 'posthog-js'

/**
 * Composable pour utiliser PostHog dans l'app
 * Fournit des méthodes safe qui ne font rien si PostHog n'est pas initialisé
 */
export const usePosthog = () => {
  /**
   * Vérifier si PostHog est initialisé
   */
  const isInitialized = () => {
    try {
      // @ts-ignore - propriété interne pour vérifier l'initialisation
      return posthog.__loaded === true
    } catch {
      return false
    }
  }

  /**
   * Tracker un événement custom
   */
  const capture = (eventName: string, properties?: Record<string, any>) => {
    if (!isInitialized()) {
      return
    }

    try {
      posthog.capture(eventName, properties)
    } catch (error) {
      console.error('PostHog capture error:', error)
    }
  }

  /**
   * Identifier l'utilisateur
   */
  const identify = (userId: string, properties?: Record<string, any>) => {
    if (!isInitialized()) return

    try {
      posthog.identify(userId, properties)
    } catch (error) {
      console.error('PostHog identify error:', error)
    }
  }

  /**
   * Reset l'utilisateur (lors de la déconnexion)
   */
  const reset = () => {
    if (!isInitialized()) return

    try {
      posthog.reset()
    } catch (error) {
      console.error('PostHog reset error:', error)
    }
  }

  /**
   * Set des super properties (propriétés ajoutées à tous les événements)
   */
  const setSuperProperties = (properties: Record<string, any>) => {
    if (!isInitialized()) return

    try {
      posthog.register(properties)
    } catch (error) {
      console.error('PostHog setSuperProperties error:', error)
    }
  }

  /**
   * Set une propriété utilisateur
   */
  const setPersonProperties = (properties: Record<string, any>) => {
    if (!isInitialized()) return

    try {
      posthog.people.set(properties)
    } catch (error) {
      console.error('PostHog setPersonProperties error:', error)
    }
  }

  /**
   * Vérifier si PostHog est initialisé
   */
  const isEnabled = () => isInitialized()

  return {
    capture,
    identify,
    reset,
    setSuperProperties,
    setPersonProperties,
    isEnabled,
  }
}
