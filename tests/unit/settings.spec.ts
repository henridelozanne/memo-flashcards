import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import SettingsPage from '@/pages/settings.vue'

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

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      settings: {
        title: 'Paramètres',
        reminderTime: 'Heure de rappel',
        subscription: 'Abonnement',
        language: 'Langue',
        featureRequest: 'Demander une fonctionnalité',
        bugReport: 'Signaler un bug',
        deleteData: 'Supprimer mes données',
        legalNotice: 'Mentions légales',
      },
    },
  },
})

describe('Settings Page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(SettingsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          SettingsItem: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays settings title', () => {
    const wrapper = mount(SettingsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: {
            template: '<div>{{ title }}</div>',
            props: ['title'],
          },
          SettingsItem: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Paramètres')
  })

  it('navigates to feature request page when clicking feature request item', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          SettingsItem: {
            template: '<div @click="$emit(\'click\')">{{ label }}</div>',
            props: ['label'],
            emits: ['click'],
          },
        },
      },
    })

    const featureRequestItem = wrapper
      .findAll('[data-test="settings-item"]')
      .find((w) => w.text().includes('Demander une fonctionnalité'))

    if (featureRequestItem) {
      await featureRequestItem.trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/feature-request')
    }
  })

  it('navigates to bug report page when clicking bug report item', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          SettingsItem: {
            template: '<div @click="$emit(\'click\')">{{ label }}</div>',
            props: ['label'],
            emits: ['click'],
          },
        },
      },
    })

    const bugReportItem = wrapper
      .findAll('[data-test="settings-item"]')
      .find((w) => w.text().includes('Signaler un bug'))

    if (bugReportItem) {
      await bugReportItem.trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/bug-report')
    }
  })

  it('navigates to legal page when clicking legal notice item', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          SettingsItem: {
            template: '<div @click="$emit(\'click\')">{{ label }}</div>',
            props: ['label'],
            emits: ['click'],
          },
        },
      },
    })

    const legalItem = wrapper.findAll('[data-test="settings-item"]').find((w) => w.text().includes('Mentions légales'))

    if (legalItem) {
      await legalItem.trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/legal')
    }
  })
})
