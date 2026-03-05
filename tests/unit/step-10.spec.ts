import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Step10 from '~/pages/onboarding/step-10.vue'
import { useOnboardingStore } from '~/store/onboarding'
import { createTestI18n } from '../helpers/i18n'

describe('Step 10 - Notification Time', () => {
  const NuxtLayoutStub = {
    template: '<div><slot /></div>',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(Step10, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('sets current step to 10', () => {
    const store = useOnboardingStore()
    mount(Step10, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(store.currentStep).toBe(10)
  })

  it('displays notification time selector', () => {
    const wrapper = mount(Step10, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    const timeInput = wrapper.find('input[type="time"]')
    expect(timeInput.exists()).toBe(true)
  })
})
