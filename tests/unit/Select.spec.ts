import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from '@/components/Select.vue'

interface SelectOption {
  label: string
  value: string
}

describe('Select', () => {
  const options: SelectOption[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ]

  it('renders correctly', () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt1',
        options,
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.select-trigger').exists()).toBe(true)
  })

  it('displays the selected option label', () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt2',
        options,
      },
    })

    const trigger = wrapper.find('.select-value')
    expect(trigger.text()).toBe('Option 2')
  })

  it('opens dropdown when trigger is clicked', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt1',
        options,
      },
    })

    expect(wrapper.find('.select-dropdown').exists()).toBe(false)

    await wrapper.find('.select-trigger').trigger('click')

    expect(wrapper.find('.select-dropdown').exists()).toBe(true)
  })

  it('displays all options when dropdown is open', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt1',
        options,
      },
    })

    await wrapper.find('.select-trigger').trigger('click')

    const optionElements = wrapper.findAll('.select-option')
    expect(optionElements).toHaveLength(3)
    expect(optionElements[0].text()).toBe('Option 1')
    expect(optionElements[1].text()).toBe('Option 2')
    expect(optionElements[2].text()).toBe('Option 3')
  })

  it('highlights the selected option', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt2',
        options,
      },
    })

    await wrapper.find('.select-trigger').trigger('click')

    const optionElements = wrapper.findAll('.select-option')
    expect(optionElements[1].classes()).toContain('select-option-selected')
    expect(optionElements[0].classes()).not.toContain('select-option-selected')
  })

  it('emits update:modelValue when an option is clicked', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt1',
        options,
      },
    })

    await wrapper.find('.select-trigger').trigger('click')

    const optionElements = wrapper.findAll('.select-option')
    await optionElements[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['opt3'])
  })

  it('closes dropdown after selecting an option', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt1',
        options,
      },
    })

    await wrapper.find('.select-trigger').trigger('click')
    expect(wrapper.find('.select-dropdown').exists()).toBe(true)

    const optionElements = wrapper.findAll('.select-option')
    await optionElements[1].trigger('click')

    expect(wrapper.find('.select-dropdown').exists()).toBe(false)
  })

  it('closes dropdown when clicking outside', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt1',
        options,
      },
      attachTo: document.body,
    })

    await wrapper.find('.select-trigger').trigger('click')
    expect(wrapper.find('.select-dropdown').exists()).toBe(true)

    // Simulate click outside
    document.body.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.select-dropdown').exists()).toBe(false)

    wrapper.unmount()
  })

  it('toggles arrow icon when dropdown opens/closes', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt1',
        options,
      },
    })

    const arrow = wrapper.find('.select-arrow')
    expect(arrow.classes()).not.toContain('select-arrow-open')

    await wrapper.find('.select-trigger').trigger('click')
    expect(arrow.classes()).toContain('select-arrow-open')

    await wrapper.find('.select-trigger').trigger('click')
    expect(arrow.classes()).not.toContain('select-arrow-open')
  })

  it('applies open class to trigger when dropdown is open', async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: 'opt1',
        options,
      },
    })

    const trigger = wrapper.find('.select-trigger')
    expect(trigger.classes()).not.toContain('select-trigger-open')

    await trigger.trigger('click')
    expect(trigger.classes()).toContain('select-trigger-open')
  })
})
