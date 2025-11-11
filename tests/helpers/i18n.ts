import { createI18n } from 'vue-i18n'
import fr from '~/locales/fr.json'
import en from '~/locales/en.json'

export function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'fr',
    messages: {
      fr,
      en,
    },
  })
}
