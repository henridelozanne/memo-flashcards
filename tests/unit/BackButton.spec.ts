import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import BackButton from '@/components/BackButton.vue'

// Mock IconArrowLeft
vi.mock('@/components/icons/IconArrowLeft.vue', () => ({
  default: {
    name: 'IconArrowLeft',
    template: '<svg></svg>',
  },
}))

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      common: {
        backButton: 'Retour',
      },
    },
  },
})

describe('BackButton', () => {
  it('renders correctly', () => {
    const wrapper = mount(BackButton, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('has correct aria-label', () => {
    const wrapper = mount(BackButton, {
      global: {
        plugins: [i18n],
      },
    })

    const button = wrapper.find('button')
    expect(button.attributes('aria-label')).toBe('Retour')
  })

  it('renders icon component', () => {
    const wrapper = mount(BackButton, {
      global: {
        plugins: [i18n],
      },
    })

    const icon = wrapper.findComponent({ name: 'IconArrowLeft' })
    expect(icon.exists()).toBe(true)
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(BackButton, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.length).toBe(1)
  })

  it('has hover styles', () => {
    const wrapper = mount(BackButton, {
      global: {
        plugins: [i18n],
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('hover:text-gray-800')
  })
})
