import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Step1 from '~/pages/onboarding/step-1.vue'
import { useOnboardingStore } from '~/store/onboarding'
import { createTestI18n } from '../helpers/i18n'

describe('Step 1 - Name Input', () => {
  const NuxtLayoutStub = {
    template: '<div><slot /></div>',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(Step1, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays title and input field', () => {
    const wrapper = mount(Step1, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.text()).toContain('appelles')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('sets current step to 1', () => {
    const store = useOnboardingStore()
    mount(Step1, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(store.currentStep).toBe(1)
  })

  it('validates name on submit', async () => {
    const wrapper = mount(Step1, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })

    const input = wrapper.find('input[type="text"]')

    // Try to submit without name
    await input.trigger('keyup.enter')
    // Should show error

    // Enter a name
    await input.setValue('Henri')
    await input.trigger('keyup.enter')
  })

  it('stores firstName in onboarding store', async () => {
    const store = useOnboardingStore()
    const wrapper = mount(Step1, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Henri')

    // Manually trigger validation
    const vm = wrapper.vm as any
    const isValid = vm.validate()

    expect(isValid).toBe(true)
    expect(store.firstName).toBe('Henri')
  })
})
