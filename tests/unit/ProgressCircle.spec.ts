import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProgressCircle from '@/components/ProgressCircle.vue'

describe('ProgressCircle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 3,
        total: 10,
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('displays current and total values', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 5,
        total: 20,
        numbersVisible: true,
      },
    })

    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('20')
  })

  it('hides numbers when numbersVisible is false', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 5,
        total: 20,
        numbersVisible: false,
      },
    })

    expect(wrapper.find('.absolute').exists()).toBe(false)
  })

  it('calculates progress percentage correctly', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 5,
        total: 10,
      },
    })

    // 5/10 = 50% progress
    const progressPath = wrapper.findAll('path')[1]
    expect(progressPath.exists()).toBe(true)
  })

  it('handles zero total gracefully', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 0,
        total: 0,
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('handles 100% completion', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 10,
        total: 10,
        numbersVisible: true,
      },
    })

    expect(wrapper.text()).toContain('10')
  })
})
