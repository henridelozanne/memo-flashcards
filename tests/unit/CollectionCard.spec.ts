import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import CollectionCard from '@/components/CollectionCard.vue'

// Mock useCards composable
const mockGetCardsCount = vi.fn()
vi.mock('@/composables/useCards', () => ({
  useCards: () => ({
    getCardsCount: mockGetCardsCount,
  }),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      cards: {
        cardCount: '{count} cartes',
      },
      collections: {
        edit: 'Modifier',
      },
      common: {
        delete: 'Supprimer',
      },
    },
  },
})

describe('CollectionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCardsCount.mockResolvedValue(5)
  })

  const mockCollection = {
    id: 'col-1',
    name: 'Test Collection',
    user_id: 'user-1',
    created_at: Date.now(),
    updated_at: Date.now(),
  }

  it('renders collection name', () => {
    const wrapper = mount(CollectionCard, {
      props: {
        collection: mockCollection,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Test Collection')
  })

  it('displays card count', async () => {
    const wrapper = mount(CollectionCard, {
      props: {
        collection: mockCollection,
      },
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(mockGetCardsCount).toHaveBeenCalledWith('col-1')
  })

  it('shows edit button when onEdit provided', () => {
    const wrapper = mount(CollectionCard, {
      props: {
        collection: mockCollection,
        onEdit: vi.fn(),
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Modifier')
  })

  it('shows delete button when onDelete provided', () => {
    const wrapper = mount(CollectionCard, {
      props: {
        collection: mockCollection,
        onDelete: vi.fn(),
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Supprimer')
  })

  it('calls onEdit with collection id when edit button clicked', async () => {
    const onEdit = vi.fn()
    const wrapper = mount(CollectionCard, {
      props: {
        collection: mockCollection,
        onEdit,
      },
      global: {
        plugins: [i18n],
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')

    expect(onEdit).toHaveBeenCalledWith('col-1')
  })

  it('calls onDelete with collection when delete button clicked', async () => {
    const onDelete = vi.fn()
    const wrapper = mount(CollectionCard, {
      props: {
        collection: mockCollection,
        onDelete,
      },
      global: {
        plugins: [i18n],
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')

    expect(onDelete).toHaveBeenCalledWith(mockCollection)
  })

  it('calls onClick when card is clicked', async () => {
    const onClick = vi.fn()
    const wrapper = mount(CollectionCard, {
      props: {
        collection: mockCollection,
        onClick,
      },
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.trigger('click')

    expect(onClick).toHaveBeenCalledWith('col-1')
  })

  it('stops propagation when action buttons are clicked', async () => {
    const onClick = vi.fn()
    const onEdit = vi.fn()
    const wrapper = mount(CollectionCard, {
      props: {
        collection: mockCollection,
        onClick,
        onEdit,
      },
      global: {
        plugins: [i18n],
      },
    })

    const editButton = wrapper.findAll('button')[0]
    await editButton.trigger('click')

    // onClick should not be called when clicking edit button
    expect(onClick).not.toHaveBeenCalled()
    expect(onEdit).toHaveBeenCalled()
  })
})
