import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Step2 from '~/pages/onboarding/step-2.vue'
import { useOnboardingStore } from '~/store/onboarding'
import { createTestI18n } from '../helpers/i18n'

describe('Step 2 - Goal Selection', () => {
  const NuxtLayoutStub = {
    template: '<div><slot /></div>',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useOnboardingStore()
    store.firstName = 'Henri'
  })

  it('renders correctly', () => {
    const wrapper = mount(Step2, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays title with user name', () => {
    const wrapper = mount(Step2, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.text()).toContain('Henri')
  })

  it('sets current step to 2', () => {
    const store = useOnboardingStore()
    mount(Step2, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(store.currentStep).toBe(2)
  })

  it('displays goal options', () => {
    const wrapper = mount(Step2, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('allows selecting a goal', async () => {
    const wrapper = mount(Step2, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })

    const firstButton = wrapper.find('button')
    await firstButton.trigger('click')

    expect(firstButton.classes()).toContain('bg-[var(--color-primary)]')
  })
})
