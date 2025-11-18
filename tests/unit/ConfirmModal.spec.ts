import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ConfirmModal from '@/components/ConfirmModal.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      common: {
        processing: 'Traitement en cours...',
      },
    },
  },
})

describe('ConfirmModal', () => {
  it('renders when open is true', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm Action',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.text()).toContain('Confirm Action')
  })

  it('does not render when open is false', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: false,
        title: 'Confirm Action',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('displays title correctly', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Delete Item?',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('h3').text()).toBe('Delete Item?')
  })

  it('renders default slot content', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm',
      },
      slots: {
        default: 'Are you sure you want to proceed?',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Are you sure you want to proceed?')
  })

  it('shows custom confirm label', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm',
        confirmLabel: 'Delete',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Delete')
  })

  it('shows custom cancel label', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm',
        cancelLabel: 'Go Back',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Go Back')
  })

  it('emits confirm event when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm',
      },
      global: {
        plugins: [i18n],
      },
    })

    const buttons = wrapper.findAll('button')
    const confirmButton = buttons[1] // Second button is confirm
    await confirmButton.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm',
      },
      global: {
        plugins: [i18n],
      },
    })

    const buttons = wrapper.findAll('button')
    const cancelButton = buttons[0] // First button is cancel
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('disables confirm button when loading', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm',
        loading: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    const buttons = wrapper.findAll('button')
    const confirmButton = buttons[1]
    expect(confirmButton.attributes('disabled')).toBeDefined()
  })

  it('shows processing text when loading', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm',
        confirmLabel: 'Delete',
        loading: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Traitement en cours...')
  })

  it('renders confirmLabel slot when provided', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        open: true,
        title: 'Confirm',
      },
      slots: {
        confirmLabel: 'Custom Confirm',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Custom Confirm')
  })
})
