import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,
  srcDir: './',
  modules: ['@pinia/nuxt'],
  typescript: {
    strict: true
  },
  alias: {
    '@': __dirname
  },
  css: ['~/assets/css/main.css'],
  vite: {
    server: {
      fs: {
        allow: ['.']
      }
    }
  }
})
