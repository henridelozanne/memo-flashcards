import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsItem from '@/components/SettingsItem.vue'

describe('SettingsItem', () => {
  it('renders label correctly', () => {
    const wrapper = mount(SettingsItem, {
      props: {
        label: 'Test Setting',
        iconColor: 'blue',
      },
    })

    expect(wrapper.text()).toContain('Test Setting')
  })

  it('renders value when provided', () => {
    const wrapper = mount(SettingsItem, {
      props: {
        label: 'Language',
        value: 'Français',
        iconColor: 'green',
      },
    })

    expect(wrapper.text()).toContain('Français')
  })

  it('does not render value when not provided', () => {
    const wrapper = mount(SettingsItem, {
      props: {
        label: 'Test Setting',
        iconColor: 'blue',
      },
    })

    const valueSpan = wrapper.find('span.text-sm')
    expect(valueSpan.exists()).toBe(false)
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(SettingsItem, {
      props: {
        label: 'Test Setting',
        iconColor: 'blue',
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.length).toBe(1)
  })

  it('renders icon slot content', () => {
    const wrapper = mount(SettingsItem, {
      props: {
        label: 'Test Setting',
        iconColor: 'blue',
      },
      slots: {
        icon: '<svg data-test="custom-icon"></svg>',
      },
    })

    const icon = wrapper.find('[data-test="custom-icon"]')
    expect(icon.exists()).toBe(true)
  })

  it('has correct styles', () => {
    const wrapper = mount(SettingsItem, {
      props: {
        label: 'Test Setting',
        iconColor: 'blue',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('rounded-xl')
    expect(button.classes()).toContain('flex')
  })
})
