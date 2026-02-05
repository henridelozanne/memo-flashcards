import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Paywall from '~/pages/paywall.vue'
import { createTestI18n } from '../helpers/i18n'

// Mock useRuntimeConfig
vi.mock('nuxt/app', () => ({
  useRuntimeConfig: () => ({
    public: {
      revenuecatApiKey: 'test-api-key',
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock useSubscription
vi.mock('~/composables/useSubscription', () => ({
  useSubscription: () => ({
    getOfferings: vi.fn(() => Promise.resolve(null)),
    purchasePackage: vi.fn(() => Promise.resolve(false)),
  }),
}))

// Mock useSupabaseAuth
vi.mock('~/composables/useSupabaseAuth', () => ({
  default: () => ({
    initAuth: vi.fn(),
    getCurrentUserId: vi.fn(() => Promise.resolve('test-user-id')),
  }),
}))

// Mock useUserProfile
vi.mock('~/composables/useUserProfile', () => ({
  useUserProfile: () => ({
    saveUserProfile: vi.fn(),
  }),
}))

// Mock sync
vi.mock('~/lib/sync', () => ({
  syncUserProfileToRemote: vi.fn(() => Promise.resolve()),
}))

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

  it('has subscription card', () => {
    const wrapper = mount(Paywall, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          BackgroundEffects: true,
        },
      },
    })
    // Vérifie la présence de la carte d'abonnement
    expect(wrapper.find('.subscription-card').exists()).toBe(true)
  })
})
