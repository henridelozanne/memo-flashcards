import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RichTextToggle from '~/components/RichTextToggle.vue'

describe('RichTextToggle', () => {
  it('renders the label', () => {
    const wrapper = mount(RichTextToggle, {
      props: {
        modelValue: false,
        label: 'Rich text',
      },
    })

    expect(wrapper.text()).toContain('Rich text')
  })

  it('shows inactive state when modelValue is false', () => {
    const wrapper = mount(RichTextToggle, {
      props: {
        modelValue: false,
        label: 'Rich text',
      },
    })

    const toggle = wrapper.find('.relative.inline-block')
    expect(toggle.classes()).toContain('bg-gray-300')
    expect(toggle.classes()).not.toContain('bg-[var(--color-primary)]')
  })

  it('shows active state when modelValue is true', () => {
    const wrapper = mount(RichTextToggle, {
      props: {
        modelValue: true,
        label: 'Rich text',
      },
    })

    const toggle = wrapper.find('.relative.inline-block')
    expect(toggle.classes()).toContain('bg-[var(--color-primary)]')
    expect(toggle.classes()).not.toContain('bg-gray-300')
  })

  it('emits update:modelValue when clicked', async () => {
    const wrapper = mount(RichTextToggle, {
      props: {
        modelValue: false,
        label: 'Rich text',
      },
    })

    await wrapper.find('.relative.inline-block').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('toggles from true to false when clicked', async () => {
    const wrapper = mount(RichTextToggle, {
      props: {
        modelValue: true,
        label: 'Rich text',
      },
    })

    await wrapper.find('.relative.inline-block').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('applies translate-x-0 class when inactive', () => {
    const wrapper = mount(RichTextToggle, {
      props: {
        modelValue: false,
        label: 'Rich text',
      },
    })

    const slider = wrapper.find('.absolute.left-0\\.5')
    expect(slider.classes()).toContain('translate-x-0')
    expect(slider.classes()).not.toContain('translate-x-3.5')
  })

  it('applies translate-x-3.5 class when active', () => {
    const wrapper = mount(RichTextToggle, {
      props: {
        modelValue: true,
        label: 'Rich text',
      },
    })

    const slider = wrapper.find('.absolute.left-0\\.5')
    expect(slider.classes()).toContain('translate-x-3.5')
    expect(slider.classes()).not.toContain('translate-x-0')
  })
})
