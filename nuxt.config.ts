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
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  vite: {
    server: {
      fs: {
        allow: ['.']
      }
    }
  }
})
