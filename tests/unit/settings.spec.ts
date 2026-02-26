import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import SettingsPage from '@/pages/settings.vue'

// Mock useRuntimeConfig
vi.mock('nuxt/app', () => ({
  useRuntimeConfig: () => ({
    public: {
      revenuecatApiKey: 'test-api-key',
    },
  }),
}))

// Mock router
const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

// Mock components
vi.mock('@/components/PageHeader.vue', () => ({
  default: {
    name: 'PageHeader',
    template: '<div><slot /></div>',
    props: ['title', 'backButtonVisible'],
    emits: ['back'],
  },
}))

vi.mock('@/components/SettingsItem.vue', () => ({
  default: {
    name: 'SettingsItem',
    template: '<div @click="$emit(\'click\')"><slot name="icon" /></div>',
    props: ['label', 'value', 'iconColor'],
    emits: ['click'],
  },
}))

// Mock all icon components
vi.mock('@/components/icons/IconClock.vue', () => ({ default: { name: 'IconClock', template: '<div></div>' } }))
vi.mock('@/components/icons/IconStar.vue', () => ({ default: { name: 'IconStar', template: '<div></div>' } }))
vi.mock('@/components/icons/IconGlobe.vue', () => ({ default: { name: 'IconGlobe', template: '<div></div>' } }))
vi.mock('@/components/icons/IconFeatureRequest.vue', () => ({
  default: { name: 'IconFeatureRequest', template: '<div></div>' },
}))
vi.mock('@/components/icons/IconBug.vue', () => ({ default: { name: 'IconBug', template: '<div></div>' } }))
vi.mock('@/components/icons/IconTrash.vue', () => ({ default: { name: 'IconTrash', template: '<div></div>' } }))
vi.mock('@/components/icons/IconDocument.vue', () => ({ default: { name: 'IconDocument', template: '<div></div>' } }))
vi.mock('@/components/icons/IconRefresh.vue', () => ({ default: { name: 'IconRefresh', template: '<div></div>' } }))

// Mock useSubscription
const mockRestorePurchases = vi.fn()
vi.mock('@/composables/useSubscription', () => ({
  useSubscription: () => ({
    restorePurchases: mockRestorePurchases,
  }),
}))

// Mock useSupabaseAuth (used indirectly by useSubscription)
vi.mock('@/composables/useSupabaseAuth', () => ({
  default: () => ({
    getCurrentUserId: vi.fn().mockResolvedValue('user-123'),
  }),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      settings: {
        title: 'Paramètres',
        reminderTime: 'Heure de rappel',
        subscription: 'Abonnement',
        unlockPremium: 'Débloquer Premium',
        restorePurchases: 'Restaurer les achats',
        restoringPurchases: 'Restauration en cours...',
        restorePurchasesSuccess: 'Achats restaurés avec succès !',
        restorePurchasesNone: 'Aucun achat à restaurer',
        restorePurchasesError: 'Erreur lors de la restauration',
        subscriptionActive: 'Active',
        language: 'Langue',
        featureRequest: 'Demander une fonctionnalité',
        bugReport: 'Signaler un bug',
        deleteData: 'Supprimer mes données',
        deleteDataConfirmTitle: 'Supprimer mes données',
        deleteDataConfirm: 'Supprimer',
        deleteDataConfirmMessage: 'Êtes-vous sûr ?',
        legalNotice: 'Mentions légales',
      },
      common: {
        cancel: 'Annuler',
      },
    },
  },
})

const globalOpts = (extraStubs: Record<string, any> = {}) => ({
  plugins: [i18n],
  mocks: {
    $router: { push: mockPush, back: mockBack },
  },
  stubs: {
    PageHeader: true,
    SettingsItem: {
      template: '<div class="settings-item" @click="$emit(\'click\')">{{ label }}</div>',
      props: ['label', 'value'],
      emits: ['click'],
    },
    ConfirmModal: true,
    StatusMessage: true,
    ...extraStubs,
  },
})

describe('Settings Page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(SettingsPage, { global: globalOpts() })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays settings title', () => {
    const wrapper = mount(SettingsPage, {
      global: globalOpts({
        PageHeader: {
          template: '<div>{{ title }}</div>',
          props: ['title'],
        },
      }),
    })
    expect(wrapper.text()).toContain('Paramètres')
  })

  it('navigates to feature request page when clicking feature request item', async () => {
    const wrapper = mount(SettingsPage, { global: globalOpts() })
    const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Demander une fonctionnalité'))
    expect(item).toBeTruthy()
    await item!.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/feature-request')
  })

  it('navigates to bug report page when clicking bug report item', async () => {
    const wrapper = mount(SettingsPage, { global: globalOpts() })
    const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Signaler un bug'))
    expect(item).toBeTruthy()
    await item!.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/bug-report')
  })

  it('navigates to legal page when clicking legal notice item', async () => {
    const wrapper = mount(SettingsPage, { global: globalOpts() })
    const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Mentions légales'))
    expect(item).toBeTruthy()
    await item!.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/legal')
  })

  describe('Restore Purchases', () => {
    it('affiche le bouton "Restaurer les achats" uniquement pour les non-abonnés', () => {
      const wrapper = mount(SettingsPage, { global: globalOpts() })
      // Par défaut isSubscribed = false → bouton visible
      const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Restaurer les achats'))
      expect(item).toBeTruthy()
    })

    it('ne montre pas le bouton "Restaurer les achats" quand abonné', async () => {
      const { useSubscriptionStore } = await import('~/store/subscription')
      const store = useSubscriptionStore()
      store.setSubscribed(true)
      const wrapper = mount(SettingsPage, { global: globalOpts() })
      const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Restaurer les achats'))
      expect(item).toBeUndefined()
    })

    it('appelle restorePurchases au clic', async () => {
      mockRestorePurchases.mockResolvedValue(null)
      const wrapper = mount(SettingsPage, { global: globalOpts() })
      const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Restaurer les achats'))
      await item!.trigger('click')
      expect(mockRestorePurchases).toHaveBeenCalledOnce()
    })

    it('affiche le message de succès quand des achats sont restaurés', async () => {
      const { useSubscriptionStore } = await import('~/store/subscription')
      const store = useSubscriptionStore()
      // Utilisateur non-abonné au départ (le bouton est visible)
      store.setSubscribed(false)
      // Le mock simule une restauration réussie en mettant à jour le store
      mockRestorePurchases.mockImplementation(async () => {
        store.setSubscribed(true)
        return { entitlements: { active: {} } }
      })

      const wrapper = mount(SettingsPage, {
        global: globalOpts({
          StatusMessage: {
            template: '<div class="status-msg">{{ message?.text }}</div>',
            props: ['message'],
          },
        }),
      })

      const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Restaurer les achats'))
      await item!.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.status-msg').text()).toContain('Achats restaurés avec succès !')
    })

    it('affiche le message "aucun achat" quand la restauration ne trouve rien', async () => {
      const { useSubscriptionStore } = await import('~/store/subscription')
      const store = useSubscriptionStore()
      store.setSubscribed(false)
      mockRestorePurchases.mockResolvedValue({ entitlements: { active: {} } })

      const wrapper = mount(SettingsPage, {
        global: globalOpts({
          StatusMessage: {
            template: '<div class="status-msg">{{ message?.text }}</div>',
            props: ['message'],
          },
        }),
      })

      const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Restaurer les achats'))
      await item!.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.status-msg').text()).toContain('Aucun achat à restaurer')
    })

    it("affiche un message d'erreur si restorePurchases échoue", async () => {
      mockRestorePurchases.mockRejectedValue(new Error('Network error'))

      const wrapper = mount(SettingsPage, {
        global: globalOpts({
          StatusMessage: {
            template: '<div class="status-msg">{{ message?.text }}</div>',
            props: ['message'],
          },
        }),
      })

      const item = wrapper.findAll('.settings-item').find((w) => w.text().includes('Restaurer les achats'))
      await item!.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.status-msg').text()).toContain('Erreur lors de la restauration')
    })
  })
})
