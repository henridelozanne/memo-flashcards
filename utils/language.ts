import messages from '~/locales'

// Récupérer dynamiquement les langues supportées depuis i18n
const SUPPORTED_LANGUAGES = Object.keys(messages)

/**
 * Détecter la langue du système
 * @returns Code de langue (ex: 'fr', 'en')
 */
export function detectSystemLanguage(): string {
  if (typeof navigator === 'undefined') return 'en'

  // Récupérer la langue du navigateur
  const browserLang = navigator.language || (navigator as any).userLanguage
  const langCode = browserLang.split('-')[0].toLowerCase()

  // Retourner la langue si supportée, sinon anglais par défaut
  return SUPPORTED_LANGUAGES.includes(langCode) ? langCode : 'en'
}
