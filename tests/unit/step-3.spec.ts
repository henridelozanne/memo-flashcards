import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Step3 from '~/pages/onboarding/step-3.vue'
import { useOnboardingStore } from '~/store/onboarding'
import { createTestI18n } from '../helpers/i18n'

describe('Step 3 - Situation Selection', () => {
  const NuxtLayoutStub = {
    template: '<div><slot /></div>',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(Step3, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('sets current step to 3', () => {
    const store = useOnboardingStore()
    mount(Step3, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
        },
      },
    })
    expect(store.currentStep).toBe(3)
  })

  it('displays situation options', () => {
    const wrapper = mount(Step3, {
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

  it('allows selecting a situation', async () => {
    const wrapper = mount(Step3, {
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
