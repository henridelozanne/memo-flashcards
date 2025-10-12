module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: ['airbnb-base', 'plugin:vue/vue3-essential', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    'import/extensions': 'off',
    'no-console': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off'
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.vue', '.json']
      }
    }
  },
  
  overrides: [
    {
      files: ['tests/**', 'playwright.config.ts', 'vitest.config.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ]
}
