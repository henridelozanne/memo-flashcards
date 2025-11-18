import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PageHeader from '@/components/PageHeader.vue'

// Mock BackButton
vi.mock('@/components/BackButton.vue', () => ({
  default: {
    name: 'BackButton',
    template: '<button @click="$emit(\'click\')">Back</button>',
    emits: ['click'],
  },
}))

describe('PageHeader', () => {
  it('renders title correctly', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test Title',
      },
    })

    expect(wrapper.text()).toContain('Test Title')
  })

  it('shows back button when backButtonVisible is true', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test',
        backButtonVisible: true,
      },
    })

    const backButton = wrapper.findComponent({ name: 'BackButton' })
    expect(backButton.exists()).toBe(true)
  })

  it('hides back button when backButtonVisible is false', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test',
        backButtonVisible: false,
      },
    })

    const backButton = wrapper.findComponent({ name: 'BackButton' })
    expect(backButton.exists()).toBe(false)
  })

  it('emits back event when back button is clicked', async () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test',
        backButtonVisible: true,
      },
    })

    const backButton = wrapper.findComponent({ name: 'BackButton' })
    await backButton.trigger('click')

    expect(wrapper.emitted('back')).toBeTruthy()
  })

  it('renders actions slot content', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test',
      },
      slots: {
        actions: '<button>Action</button>',
      },
    })

    expect(wrapper.text()).toContain('Action')
  })

  it('applies testId when provided', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: 'Test',
        testId: 'custom-test-id',
      },
    })

    const heading = wrapper.find('[data-testid="custom-test-id"]')
    expect(heading.exists()).toBe(true)
  })
})
