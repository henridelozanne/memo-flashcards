import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import LegalPage from '@/pages/legal.vue'

// Mock router
const mockBack = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
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

vi.mock('@/components/BackgroundEffects.vue', () => ({
  default: {
    name: 'BackgroundEffects',
    template: '<div></div>',
  },
}))

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      settings: {
        legalNotice: 'Mentions légales',
      },
      legal: {
        editor: {
          title: 'Éditeur',
          description: 'Cette application est éditée par Henri de Lozanne.',
          address: 'France',
        },
        hosting: {
          title: 'Hébergement',
          description: 'Les données sont stockées localement sur votre appareil.',
          privacy: "Aucune donnée personnelle n'est transmise à des serveurs tiers.",
        },
        personalData: {
          title: 'Données personnelles',
          collection: 'Les données collectées (nom, objectif, etc.) sont stockées localement.',
          ads: 'Aucune publicité ciblée.',
          deletion: 'Vous pouvez supprimer vos données depuis les paramètres.',
        },
        distribution: {
          title: 'Plateformes de distribution',
          platforms: 'Cette application est disponible sur iOS et Android.',
          policies: "Soumise aux CGU de l'App Store et du Play Store.",
        },
        intellectualProperty: {
          title: 'Propriété intellectuelle',
          copyright: "Tous les contenus sont protégés par le droit d'auteur.",
          prohibition: 'Toute reproduction non autorisée est interdite.',
        },
        termsOfUse: {
          title: "Conditions d'utilisation",
          version: 'Version 1.0',
          compliance: 'En utilisant cette application, vous acceptez ces conditions.',
        },
      },
    },
  },
})

describe('Legal Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          BackgroundEffects: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays legal notice title', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: {
            template: '<div>{{ title }}</div>',
            props: ['title'],
          },
          BackgroundEffects: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Mentions légales')
  })

  it('displays editor section', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          BackgroundEffects: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Éditeur')
    expect(wrapper.text()).toContain('Henri de Lozanne')
  })

  it('displays hosting section', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          BackgroundEffects: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Hébergement')
    expect(wrapper.text()).toContain('stockées localement')
  })

  it('displays personal data section', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          BackgroundEffects: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Données personnelles')
  })

  it('displays distribution platforms section', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          BackgroundEffects: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Plateformes de distribution')
  })

  it('displays intellectual property section', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          BackgroundEffects: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Propriété intellectuelle')
  })

  it('displays terms of use section', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          BackgroundEffects: true,
        },
      },
    })

    expect(wrapper.text()).toContain("Conditions d'utilisation")
  })

  it('has email link in editor section', () => {
    const wrapper = mount(LegalPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          BackgroundEffects: true,
        },
      },
    })

    const emailLink = wrapper.find('a[href="mailto:memo.flashcards.contact@gmail.com"]')
    expect(emailLink.exists()).toBe(true)
  })
})
