import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import useAppStore from '~/store/app'

describe('app store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('toggles premium', () => {
    const store = useAppStore()
    expect(store.isPremium).toBe(false)
    store.togglePremium()
    expect(store.isPremium).toBe(true)
  })

  it('sets language', () => {
    const store = useAppStore()
    store.setLanguage('en')
    expect(store.language).toBe('en')
  })
})
