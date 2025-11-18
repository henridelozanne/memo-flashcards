import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ErrorMessage from '@/components/ErrorMessage.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      common: {
        retry: 'Réessayer',
      },
    },
  },
})

describe('ErrorMessage', () => {
  it('renders error message', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        error: 'Something went wrong',
        onRetry: vi.fn(),
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('has correct error styling', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        error: 'Error message',
        onRetry: vi.fn(),
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.classes()).toContain('bg-red-100')
    expect(wrapper.classes()).toContain('border-red-400')
    expect(wrapper.classes()).toContain('text-red-700')
  })

  it('shows retry button', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        error: 'Error',
        onRetry: vi.fn(),
      },
      global: {
        plugins: [i18n],
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Réessayer')
  })

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn()
    const wrapper = mount(ErrorMessage, {
      props: {
        error: 'Error',
        onRetry,
      },
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('button').trigger('click')

    expect(onRetry).toHaveBeenCalledOnce()
  })
})
