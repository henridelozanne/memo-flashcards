import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'static',
  },
  srcDir: './',
  modules: ['@pinia/nuxt'],
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      web3formsKey: process.env.WEB3FORMS_KEY,
    },
  },
  alias: {
    '@': __dirname,
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@400;600&display=swap',
        },
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
        },
      ],
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    server: {
      fs: {
        allow: ['.'],
      },
    },
  },
})
