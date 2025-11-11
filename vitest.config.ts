import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '~', replacement: path.resolve(__dirname) },
      { find: '@', replacement: path.resolve(__dirname) },
      { find: 'assets', replacement: path.resolve(__dirname, 'assets') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts'],
    setupFiles: ['./tests/setup.ts'],
    server: {
      deps: {
        inline: ['vitest-canvas-mock'],
      },
    },
  },
  assetsInclude: ['**/*.svg'],
})
