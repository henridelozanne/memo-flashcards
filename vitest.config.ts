import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: [
      { find: '~', replacement: path.resolve(__dirname) },
      { find: '@', replacement: path.resolve(__dirname) }
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts']
  }
})
