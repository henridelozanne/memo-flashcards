import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import Step4 from '~/pages/onboarding/step-4.vue'
import { useOnboardingStore } from '~/store/onboarding'
import { createTestI18n } from '../helpers/i18n'

describe('Step 4 - Forgetting Curve', () => {
  const NuxtLayoutStub = {
    template: '<div><slot /></div>',
  }

  const ImgStub = {
    template: '<div class="img-stub"></div>',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(Step4, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
          img: ImgStub,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('sets current step to 4', () => {
    const store = useOnboardingStore()
    mount(Step4, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
          img: ImgStub,
        },
      },
    })
    expect(store.currentStep).toBe(4)
  })

  it('displays forgetting curve content', async () => {
    const wrapper = mount(Step4, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          NuxtLayout: NuxtLayoutStub,
          img: ImgStub,
        },
      },
    })
    expect(wrapper.find('h1').exists()).toBe(true)
  })
})
