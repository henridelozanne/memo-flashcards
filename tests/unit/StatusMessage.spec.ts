import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusMessage from '@/components/StatusMessage.vue'

describe('StatusMessage', () => {
  it('renders success message', () => {
    const wrapper = mount(StatusMessage, {
      props: {
        message: {
          type: 'success',
          text: 'Operation successful!',
        },
      },
    })

    expect(wrapper.text()).toContain('Operation successful!')
  })

  it('renders error message', () => {
    const wrapper = mount(StatusMessage, {
      props: {
        message: {
          type: 'error',
          text: 'Something went wrong',
        },
      },
    })

    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('applies success styling', () => {
    const wrapper = mount(StatusMessage, {
      props: {
        message: {
          type: 'success',
          text: 'Success!',
        },
      },
    })

    expect(wrapper.classes()).toContain('bg-green-100')
    expect(wrapper.classes()).toContain('text-green-700')
  })

  it('applies error styling', () => {
    const wrapper = mount(StatusMessage, {
      props: {
        message: {
          type: 'error',
          text: 'Error!',
        },
      },
    })

    expect(wrapper.classes()).toContain('bg-red-100')
    expect(wrapper.classes()).toContain('text-red-700')
  })

  it('does not render when message is null', () => {
    const wrapper = mount(StatusMessage, {
      props: {
        message: null,
      },
    })

    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('has rounded corners and padding', () => {
    const wrapper = mount(StatusMessage, {
      props: {
        message: {
          type: 'success',
          text: 'Message',
        },
      },
    })

    expect(wrapper.classes()).toContain('rounded-md')
    expect(wrapper.classes()).toContain('p-4')
  })
})
