import { describe, it, expect } from 'vitest'
import messages from '~/locales'

describe('i18n messages', () => {
  it('has french app name', () => {
    expect(messages.fr.app.name).toBe('Memo Flashcards')
  })
  it('has english app name', () => {
    expect(messages.en.app.name).toBe('Memo Flashcards')
  })
})
