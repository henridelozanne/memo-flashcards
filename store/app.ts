import { defineStore } from 'pinia'

interface AppState {
  language: string
  isPremium: boolean
}

const useAppStore = defineStore('app', {
  state: (): AppState => ({
    language: 'fr',
    isPremium: false,
  }),
  actions: {
    togglePremium() {
      this.isPremium = !this.isPremium
    },
    setLanguage(lang: string) {
      this.language = lang
    },
  },
})

export default useAppStore
