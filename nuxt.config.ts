import { defineNuxtConfig } from 'nuxt/config'
import fs from 'fs'

function getMarketingVersion(): string {
  try {
    const pbxproj = fs.readFileSync('./ios/App/App.xcodeproj/project.pbxproj', 'utf8')
    const match = pbxproj.match(/MARKETING_VERSION\s*=\s*([\d.]+);/)
    return match?.[1] ?? '1.0.0'
  } catch {
    return '1.0.0'
  }
}

export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'static',
  },
  srcDir: './',
  modules: ['@pinia/nuxt', '@nuxtjs/color-mode'],
  // @ts-expect-error @nuxtjs/color-mode ne déclare pas ses types Nuxt correctement
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'cortx-color-mode',
  },
  typescript: {
    strict: true,
    tsConfig: {
      exclude: ['../supabase/functions'],
    },
  },
  runtimeConfig: {
    public: {
      web3formsKey: process.env.WEB3FORMS_KEY,
      revenuecatApiKeyIos: process.env.REVENUECAT_API_KEY_IOS,
      revenuecatApiKeyAndroid: process.env.REVENUECAT_API_KEY_ANDROID,
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
      sentryEnabled: process.env.NUXT_PUBLIC_SENTRY_ENABLED !== 'false',
      posthogKey: process.env.NUXT_PUBLIC_POSTHOG_KEY,
      posthogHost: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      appVersion: getMarketingVersion(),
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
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
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
      watch: {
        ignored: ['**/ios/**', '**/android/**', '**/.git/**'],
      },
    },
  },
})
