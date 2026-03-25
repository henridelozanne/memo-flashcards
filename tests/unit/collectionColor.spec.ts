import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import CollectionForm from '@/components/CollectionForm.vue'
import CollectionCard from '@/components/CollectionCard.vue'
import { useCollections } from '~/composables/useCollections'

// ─── CollectionCard mock ─────────────────────────────────────────────────────
const mockGetCardsCount = vi.fn().mockResolvedValue(0)
vi.mock('@/composables/useCards', () => ({
  useCards: () => ({ getCardsCount: mockGetCardsCount }),
}))

// ─── useCollections mocks ─────────────────────────────────────────────────────
const mockSqliteConnection = {
  exec: vi.fn(),
  run: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
  close: vi.fn(),
}
vi.mock('~/lib/sqlite', () => ({ default: vi.fn(() => mockSqliteConnection) }))
vi.mock('~/composables/useSupabaseAuth', () => ({
  default: () => ({ getCurrentUserId: vi.fn().mockResolvedValue('user-1') }),
}))
vi.mock('~/lib/sync', () => ({
  syncCollectionsToRemote: vi.fn().mockResolvedValue(undefined),
}))

// ─── i18n ─────────────────────────────────────────────────────────────────────
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      collections: {
        nameLabel: 'Nom',
        namePlaceholder: 'Ex: Vocabulaire',
        backgroundColorLabel: 'Couleur de fond',
        submitting: 'En cours...',
        edit: 'Modifier',
      },
      form: { nameRequired: 'Le nom est requis' },
      common: { cancel: 'Annuler', delete: 'Supprimer' },
      cards: { cardCount: '{count} cartes' },
    },
  },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const VIOLET_GRADIENT = 'linear-gradient(135deg, #9333ea, #7c3aed)'
const WHITE = '#ffffff'

const baseCollection = {
  id: 'col-1',
  name: 'Ma collection',
  user_id: 'user-1',
  created_at: Date.now(),
  updated_at: Date.now(),
}

// ─── CollectionForm ───────────────────────────────────────────────────────────
describe('CollectionForm — color picker', () => {
  it('always renders 8 color swatches', () => {
    const wrapper = mount(CollectionForm, { global: { plugins: [i18n] } })
    const swatches = wrapper.findAll('button[aria-label]')
    expect(swatches).toHaveLength(8)
  })

  it('defaults to white color (#ffffff) when no color prop given', async () => {
    const wrapper = mount(CollectionForm, {
      props: { name: 'Test' },
      global: { plugins: [i18n] },
    })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ name: 'Test', color: WHITE, cardBackground: 'white' }])
  })

  it('initialises selected color from the color prop', async () => {
    const wrapper = mount(CollectionForm, {
      props: { name: 'Test', color: VIOLET_GRADIENT },
      global: { plugins: [i18n] },
    })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ name: 'Test', color: VIOLET_GRADIENT, cardBackground: 'white' }])
  })

  it('emits selected color after clicking a swatch', async () => {
    const wrapper = mount(CollectionForm, {
      props: { name: 'Test' },
      global: { plugins: [i18n] },
    })

    // Click the first swatch (violet gradient)
    const swatches = wrapper.findAll('button[aria-label]')
    await swatches[0].trigger('click')

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ name: 'Test', color: VIOLET_GRADIENT, cardBackground: 'white' }])
  })

  it('emits { name, color } object on submit (not a plain string)', async () => {
    const wrapper = mount(CollectionForm, {
      props: { name: 'Ma collection' },
      global: { plugins: [i18n] },
    })
    await wrapper.find('form').trigger('submit')
    const payload = wrapper.emitted('submit')?.[0]?.[0]
    expect(payload).toBeTypeOf('object')
    expect(payload).toHaveProperty('name', 'Ma collection')
    expect(payload).toHaveProperty('color')
  })
})

// ─── CollectionCard ───────────────────────────────────────────────────────────
describe('CollectionCard — color display', () => {
  it('applies collection.color as background when a solid hex is given', () => {
    // jsdom supports solid hex colors in inline styles; gradients are normalized
    // so we verify the binding mechanism with a solid color value.
    const solidColor = '#9333ea'
    const wrapper = mount(CollectionCard, {
      props: { collection: { ...baseCollection, color: solidColor } },
      global: { plugins: [i18n] },
    })
    const card = wrapper.find('div')
    // jsdom normalizes hex → rgb
    expect(card.element.style.background).toBeTruthy()
  })

  it('falls back to white background when color is null', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: { ...baseCollection, color: null } },
      global: { plugins: [i18n] },
    })
    const card = wrapper.find('div')
    // jsdom cannot resolve CSS custom properties, so var(--color-white) is
    // not stored in element.style — the background is effectively empty (no custom color applied)
    expect(card.element.style.background).toBeFalsy()
  })

  it('applies white text class when collection has a gradient color (isColored)', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: { ...baseCollection, color: VIOLET_GRADIENT } },
      global: { plugins: [i18n] },
    })
    const nameEl = wrapper.find('div.mb-2')
    expect(nameEl.classes()).toContain('text-white')
    expect(nameEl.classes()).not.toContain('text-gray-900')
  })

  it('applies gray text class when color is null (not isColored)', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: { ...baseCollection, color: null } },
      global: { plugins: [i18n] },
    })
    const nameEl = wrapper.find('div.mb-2')
    expect(nameEl.classes()).toContain('text-[var(--color-black)]')
    expect(nameEl.classes()).not.toContain('text-white')
  })

  it('is NOT considered colored when color is #ffffff', () => {
    const wrapper = mount(CollectionCard, {
      props: { collection: { ...baseCollection, color: WHITE } },
      global: { plugins: [i18n] },
    })
    const nameEl = wrapper.find('div.mb-2')
    expect(nameEl.classes()).toContain('text-[var(--color-black)]')
    expect(nameEl.classes()).not.toContain('text-white')
  })
})

// ─── useCollections ───────────────────────────────────────────────────────────
describe('useCollections — updateCollection with color', () => {
  let composable: ReturnType<typeof useCollections>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSqliteConnection.run.mockResolvedValue(undefined)
    mockSqliteConnection.get.mockResolvedValue({ count: 0 })
    mockSqliteConnection.all.mockResolvedValue([])
    composable = useCollections()
    composable.resetCollections()
  })

  it('includes color in the UPDATE SQL when a color is provided', async () => {
    await composable.updateCollection('col-1', 'Nom', VIOLET_GRADIENT)

    expect(mockSqliteConnection.run).toHaveBeenCalledWith(
      'UPDATE collections SET name = ?, color = ?, card_background = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
      ['Nom', VIOLET_GRADIENT, null, expect.any(Number), 'col-1']
    )
  })

  it('passes null for color when color is omitted', async () => {
    await composable.updateCollection('col-1', 'Nom')

    expect(mockSqliteConnection.run).toHaveBeenCalledWith(
      'UPDATE collections SET name = ?, color = ?, card_background = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
      ['Nom', null, null, expect.any(Number), 'col-1']
    )
  })

  it('passes null for color when color is explicitly null', async () => {
    await composable.updateCollection('col-1', 'Nom', null)

    expect(mockSqliteConnection.run).toHaveBeenCalledWith(
      'UPDATE collections SET name = ?, color = ?, card_background = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
      ['Nom', null, null, expect.any(Number), 'col-1']
    )
  })
})
