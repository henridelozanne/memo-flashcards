import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
    locale: 'fr-FR'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true
  }
})
