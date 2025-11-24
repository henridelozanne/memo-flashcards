import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ProgressBar from '~/components/ProgressBar.vue'

describe('ProgressBar', () => {
  it('renders correctly', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        current: 3,
        total: 10,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('calculates progress percentage correctly', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        current: 5,
        total: 10,
      },
    })
    const fillElement = wrapper.find('.progress-bar-fill')
    expect(fillElement.attributes('style')).toContain('width: 50%')
  })

  it('handles zero total', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        current: 5,
        total: 0,
      },
    })
    const fillElement = wrapper.find('.progress-bar-fill')
    expect(fillElement.attributes('style')).toContain('width: 0%')
  })

  it('caps progress at 100%', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        current: 15,
        total: 10,
      },
    })
    const fillElement = wrapper.find('.progress-bar-fill')
    expect(fillElement.attributes('style')).toContain('width: 100%')
  })

  it('shows 0% when current is 0', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        current: 0,
        total: 10,
      },
    })
    const fillElement = wrapper.find('.progress-bar-fill')
    expect(fillElement.attributes('style')).toContain('width: 0%')
  })

  it('shows tooltip when showTooltip prop is true', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        current: 75,
        total: 100,
        showTooltip: true,
      },
    })
    const tooltip = wrapper.find('.progress-tooltip')
    expect(tooltip.exists()).toBe(true)
    expect(tooltip.text()).toBe('75%')
  })

  it('hides tooltip when showTooltip prop is false', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        current: 75,
        total: 100,
        showTooltip: false,
      },
    })
    const tooltip = wrapper.find('.progress-tooltip')
    expect(tooltip.exists()).toBe(false)
  })

  it('positions tooltip according to progress percentage', () => {
    const wrapper = mount(ProgressBar, {
      props: {
        current: 30,
        total: 100,
        showTooltip: true,
      },
    })
    const tooltip = wrapper.find('.progress-tooltip')
    expect(tooltip.attributes('style')).toContain('left: 30%')
  })
})
