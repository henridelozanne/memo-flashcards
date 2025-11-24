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

  it('displays percentage when showPercentage is true', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 25,
        total: 100,
        showPercentage: true,
      },
    })

    expect(wrapper.text()).toBe('25%')
    expect(wrapper.text()).not.toContain('/')
  })

  it('uses white color variant by default', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 5,
        total: 10,
      },
    })

    const paths = wrapper.findAll('path')
    expect(paths[0].classes()).toContain('stroke-white/30')
    expect(paths[1].classes()).toContain('stroke-white')
  })

  it('uses purple color variant when specified', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 5,
        total: 10,
        colorVariant: 'purple',
      },
    })

    const paths = wrapper.findAll('path')
    expect(paths[0].classes()).toContain('stroke-[var(--color-accent-purple)]')
    expect(paths[1].classes()).toContain('stroke-[var(--color-primary)]')
  })

  it('rounds percentage to nearest integer', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 1,
        total: 3,
        showPercentage: true,
      },
    })

    // 1/3 = 33.33... → 33%
    expect(wrapper.text()).toBe('33%')
  })

  it('shows 0% opacity when progress is 0', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 0,
        total: 10,
      },
    })

    const progressPath = wrapper.findAll('path')[1]
    expect(progressPath.attributes('stroke-opacity')).toBe('0')
  })

  it('shows opacity when progress is greater than 0', () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        current: 5,
        total: 10,
      },
    })

    const progressPath = wrapper.findAll('path')[1]
    expect(progressPath.attributes('stroke-opacity')).toBe('1')
  })
})
