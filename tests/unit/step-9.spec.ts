import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Step9 from '~/pages/onboarding/step-9.vue'
import { useOnboardingStore } from '~/store/onboarding'
import { createTestI18n } from '../helpers/i18n'

describe('Step 9 - Notification Time', () => {
  const NuxtLayoutStub = {
    template: '<div><slot /></div>',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(Step9, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('sets current step to 9', () => {
    const store = useOnboardingStore()
    mount(Step9, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(store.currentStep).toBe(9)
  })

  it('displays notification time selector', async () => {
    const wrapper = mount(Step9, {
      global: {
        plugins: [createPinia(), createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    // Vérifie qu'il y a un input de type time
    const timeInput = wrapper.find('input[type="time"]')
    expect(timeInput.exists()).toBe(true)
  })
})
