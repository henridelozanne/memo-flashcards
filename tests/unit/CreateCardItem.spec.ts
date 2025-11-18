import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import CreateCardItem from '@/components/CreateCardItem.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      cards: {
        createCard: 'Créer une carte',
      },
    },
  },
})

describe('CreateCardItem', () => {
  it('renders correctly', () => {
    const wrapper = mount(CreateCardItem, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays create card text', () => {
    const wrapper = mount(CreateCardItem, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Créer une carte')
  })

  it('displays plus icon', () => {
    const wrapper = mount(CreateCardItem, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('+')
  })

  it('has dashed border style', () => {
    const wrapper = mount(CreateCardItem, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.classes()).toContain('border-2')
    expect(wrapper.classes()).toContain('border-dashed')
  })

  it('is clickable', () => {
    const wrapper = mount(CreateCardItem, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(CreateCardItem, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.length).toBe(1)
  })

  it('has hover effect', () => {
    const wrapper = mount(CreateCardItem, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.classes()).toContain('hover:bg-[var(--color-light-purple)]')
  })

  it('has correct aspect ratio', () => {
    const wrapper = mount(CreateCardItem, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.classes()).toContain('aspect-[3/4]')
  })
})
