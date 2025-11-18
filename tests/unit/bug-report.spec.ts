import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import BugReportPage from '@/pages/bug-report.vue'

// Mock router
const mockBack = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}))

// Mock PageHeader
vi.mock('@/components/PageHeader.vue', () => ({
  default: {
    name: 'PageHeader',
    template: '<div><slot /></div>',
    props: ['title', 'backButtonVisible'],
    emits: ['back'],
  },
}))

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      settings: {
        bugReport: 'Signaler un bug',
      },
      contact: {
        name: 'Nom',
        namePlaceholder: 'Votre nom',
        email: 'Email',
        emailPlaceholder: 'votre@email.com',
        message: 'Message',
        bugReportPlaceholder: 'Décrivez le bug rencontré...',
        send: 'Envoyer',
        success: 'Merci !',
        successMessage: 'Votre rapport a bien été envoyé.',
      },
      form: {
        nameRequired: 'Le nom est requis',
        emailRequired: "L'email est requis",
        emailInvalid: 'Email invalide',
        messageRequired: 'Le message est requis',
      },
      common: {
        back: 'Retour',
      },
    },
  },
})

describe('Bug Report Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders correctly', () => {
    const wrapper = mount(BugReportPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays form title', () => {
    const wrapper = mount(BugReportPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: {
            template: '<div>{{ title }}</div>',
            props: ['title'],
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Signaler un bug')
  })

  it('has name, email, and message inputs', () => {
    const wrapper = mount(BugReportPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
        },
      },
    })

    expect(wrapper.find('#name').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#message').exists()).toBe(true)
  })

  it('validates required fields on submit', async () => {
    const wrapper = mount(BugReportPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
        },
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Should show validation errors
    expect(wrapper.text()).toContain('Le nom est requis')
  })

  it('validates email format', async () => {
    const wrapper = mount(BugReportPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
        },
      },
    })

    await wrapper.find('#name').setValue('John Doe')
    await wrapper.find('#email').setValue('invalid-email')
    await wrapper.find('#message').setValue('Test bug report')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.text()).toContain('Email invalide')
  })

  it('shows success message after successful submission', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    const wrapper = mount(BugReportPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
        },
      },
    })

    await wrapper.find('#name').setValue('John Doe')
    await wrapper.find('#email').setValue('john@example.com')
    await wrapper.find('#message').setValue('Found a critical bug!')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Wait for async operations
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('Merci !')
  })
})
