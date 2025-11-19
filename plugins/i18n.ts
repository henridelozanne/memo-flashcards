import { defineNuxtPlugin } from 'nuxt/app'
import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import messages from '~/locales'
import { useUserProfileStore } from '~/store/userProfile'

export default defineNuxtPlugin((nuxtApp) => {
  const defaultLocale = 'fr'
  const navLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : defaultLocale
  const locale = navLang || defaultLocale

  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: defaultLocale,
    messages,
  })

  nuxtApp.vueApp.use(i18n)

  // Synchroniser la locale i18n avec le store utilisateur
  const userProfileStore = useUserProfileStore()

  // Observer les changements de langue dans le store
  watch(
    () => userProfileStore.language,
    (newLanguage) => {
      if (newLanguage && i18n.global.locale.value !== newLanguage) {
        i18n.global.locale.value = newLanguage as 'fr' | 'en'
      }
    },
    { immediate: true }
  )
})
