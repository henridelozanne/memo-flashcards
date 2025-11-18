import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import Loading from '@/components/Loading.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      common: {
        loading: 'Chargement...',
      },
    },
  },
})

describe('Loading', () => {
  it('renders correctly', () => {
    const wrapper = mount(Loading, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })

  it('displays default loading message', () => {
    const wrapper = mount(Loading, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Chargement...')
  })

  it('displays custom message when provided', () => {
    const wrapper = mount(Loading, {
      props: {
        message: 'Veuillez patienter...',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Veuillez patienter...')
  })

  it('has spinner animation', () => {
    const wrapper = mount(Loading, {
      global: {
        plugins: [i18n],
      },
    })

    const spinner = wrapper.find('.animate-spin')
    expect(spinner.exists()).toBe(true)
  })

  it('has correct spinner styling', () => {
    const wrapper = mount(Loading, {
      global: {
        plugins: [i18n],
      },
    })

    const spinner = wrapper.find('.animate-spin')
    expect(spinner.classes()).toContain('rounded-full')
    expect(spinner.classes()).toContain('border-b-2')
  })

  it('centers content properly', () => {
    const wrapper = mount(Loading, {
      global: {
        plugins: [i18n],
      },
    })

    const container = wrapper.find('[data-testid="loading"]')
    expect(container.classes()).toContain('flex')
    expect(container.classes()).toContain('items-center')
    expect(container.classes()).toContain('justify-center')
  })
})
