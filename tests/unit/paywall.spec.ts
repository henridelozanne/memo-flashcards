import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Paywall from '~/pages/paywall.vue'
import { createTestI18n } from '../helpers/i18n'

describe('Paywall Page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(Paywall, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          BackgroundEffects: true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays paywall title', async () => {
    const wrapper = mount(Paywall, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          BackgroundEffects: true,
        },
      },
    })
    // Vérifie la présence du titre
    expect(wrapper.find('h1').exists()).toBe(true)
  })

  it('has close button', () => {
    const wrapper = mount(Paywall, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          BackgroundEffects: true,
        },
      },
    })
    const closeButton = wrapper.find('.close-button')
    expect(closeButton.exists()).toBe(true)
  })

  it('displays benefits list', () => {
    const wrapper = mount(Paywall, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          BackgroundEffects: true,
        },
      },
    })
    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBeGreaterThan(0)
  })

  it('has trial button', () => {
    const wrapper = mount(Paywall, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          BackgroundEffects: true,
        },
      },
    })
    // Vérifie la présence du bouton avec la classe trial-button
    expect(wrapper.find('.trial-button').exists()).toBe(true)
  })
})
