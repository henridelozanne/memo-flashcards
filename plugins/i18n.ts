import { defineNuxtPlugin } from 'nuxt/app'
import { createI18n } from 'vue-i18n'
import messages from '~/locales'

export default defineNuxtPlugin((nuxtApp: any) => {
  const defaultLocale = 'fr'
  const navLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : defaultLocale
  const locale = navLang || defaultLocale

  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: defaultLocale,
    messages
  })

  nuxtApp.vueApp.use(i18n)
})
