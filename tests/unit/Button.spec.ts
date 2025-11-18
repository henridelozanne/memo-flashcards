import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toBe('Click me')
  })

  it('applies primary variant by default', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Button' },
    })

    expect(wrapper.classes()).toContain('bg-[var(--color-primary)]')
  })

  it('applies secondary variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'secondary',
      },
      slots: { default: 'Button' },
    })

    expect(wrapper.classes()).toContain('bg-[var(--color-white)]')
    expect(wrapper.classes()).toContain('text-[var(--color-primary)]')
  })

  it('applies icon variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'icon',
      },
      slots: { default: 'Icon' },
    })

    expect(wrapper.classes()).toContain('p-2')
  })

  it('applies ghost variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'ghost',
      },
      slots: { default: 'Ghost' },
    })

    expect(wrapper.classes()).toContain('text-[var(--color-black)]')
  })

  it('applies size classes', () => {
    const wrapperSm = mount(Button, {
      props: { size: 'sm' },
      slots: { default: 'Small' },
    })
    expect(wrapperSm.classes()).toContain('text-sm')

    const wrapperMd = mount(Button, {
      props: { size: 'md' },
      slots: { default: 'Medium' },
    })
    expect(wrapperMd.classes()).toContain('text-base')

    const wrapperLg = mount(Button, {
      props: { size: 'lg' },
      slots: { default: 'Large' },
    })
    expect(wrapperLg.classes()).toContain('text-lg')
  })

  it('handles disabled state', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
      slots: { default: 'Disabled' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('disabled:opacity-50')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click' },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.length).toBe(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
      slots: { default: 'Disabled' },
    })

    await wrapper.trigger('click')

    // Disabled buttons in HTML don't fire click events
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('sets correct button type', () => {
    const wrapperSubmit = mount(Button, {
      props: { type: 'submit' },
      slots: { default: 'Submit' },
    })
    expect(wrapperSubmit.attributes('type')).toBe('submit')

    const wrapperReset = mount(Button, {
      props: { type: 'reset' },
      slots: { default: 'Reset' },
    })
    expect(wrapperReset.attributes('type')).toBe('reset')
  })

  it('applies rounded class when rounded prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        rounded: true,
      },
      slots: { default: 'Rounded' },
    })

    expect(wrapper.classes()).toContain('rounded-full')
  })
})
