import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Welcome from '~/pages/onboarding/welcome.vue'
import { useOnboardingStore } from '~/store/onboarding'
import { createTestI18n } from '../helpers/i18n'

describe('Welcome Page', () => {
  const NuxtLayoutStub = {
    template: '<div><slot /></div>',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(Welcome, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays app name', () => {
    const wrapper = mount(Welcome, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.text()).toContain('MemoLooper')
  })

  it('displays taglines', () => {
    const wrapper = mount(Welcome, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.text()).toContain('Apprends')
  })

  it('sets currentStep to 0 on mount', () => {
    const wrapper = mount(Welcome, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    const store = useOnboardingStore()
    expect(store.currentStep).toBe(0)
  })
})
