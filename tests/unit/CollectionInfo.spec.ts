import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import CollectionInfo from '@/components/CollectionInfo.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      collections: {
        collection: 'Collection',
      },
    },
  },
})

describe('CollectionInfo', () => {
  const mockCollection = {
    id: 'col-1',
    name: 'My Collection',
    user_id: 'user-1',
    created_at: Date.now(),
    updated_at: Date.now(),
  }

  it('renders collection name when collection provided', () => {
    const wrapper = mount(CollectionInfo, {
      props: {
        collection: mockCollection,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('My Collection')
  })

  it('displays collection label', () => {
    const wrapper = mount(CollectionInfo, {
      props: {
        collection: mockCollection,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Collection')
  })

  it('does not render when collection is null', () => {
    const wrapper = mount(CollectionInfo, {
      props: {
        collection: null,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('has correct styling', () => {
    const wrapper = mount(CollectionInfo, {
      props: {
        collection: mockCollection,
      },
      global: {
        plugins: [i18n],
      },
    })

    const container = wrapper.find('div')
    expect(container.classes()).toContain('rounded-[15px]')
    expect(container.classes()).toContain('bg-[var(--color-light-blue)]')
  })

  it('renders with proper structure', () => {
    const wrapper = mount(CollectionInfo, {
      props: {
        collection: mockCollection,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.find('.font-medium').exists()).toBe(true)
  })
})
