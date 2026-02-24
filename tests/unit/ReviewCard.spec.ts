import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewCard from '~/components/ReviewCard.vue'
import type { Card } from '~/lib/types'

// Mock de vue-i18n
type TParams = Record<string, string | number>
const mockT = (key: string, params?: TParams) => {
  const translations: Record<string, string> = {
    'review.noCard': 'Aucune carte',
    'review.showAnswer': 'Voir la réponse',
    'review.again': '❌ Encore',
    'review.almost': '➖ Presque',
    'review.good': '✅ Bien',
  }

  if (params && typeof translations[key] === 'string') {
    return translations[key].replace(/\{(\w+)\}/g, (match, param) => {
      const val = params[param]
      return val !== undefined ? String(val) : match
    })
  }
  return translations[key] || key
}

const globalMountOptions = {
  global: {
    mocks: {
      $t: mockT,
    },
  },
}

describe('ReviewCard', () => {
  const mockCard: Card = {
    id: '1',
    question: 'Quelle est la capitale de la France ?',
    answer: 'Paris',
    collection_id: '1',
    user_id: '1',
    compartment: 1,
    next_review_at: Date.now(),
    created_at: Date.now(),
    updated_at: Date.now(),
    correct_answers: 0,
    total_reviews: 0,
  }

  it('affiche la question de la carte', () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        isBackVisible: false,
      },
      ...globalMountOptions,
    })

    expect(wrapper.text()).toContain('Quelle est la capitale de la France ?')
  })

  it('affiche le bouton pour voir la réponse', () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        isBackVisible: false,
      },
      ...globalMountOptions,
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Voir la réponse')
  })

  it("émet l'événement show-back au clic sur le bouton", async () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        isBackVisible: false,
      },
      ...globalMountOptions,
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('show-back')).toBeTruthy()
  })

  it('affiche les boutons de réponse quand isBackVisible est true', () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        isBackVisible: true,
      },
      ...globalMountOptions,
    })

    // Vérifier que les boutons de réponse sont présents dans la face arrière
    const backFace = wrapper.find('.flip-card-back')
    const responseButtons = backFace.findAll('button')
    expect(responseButtons).toHaveLength(2) // 2 boutons de réponse
  })

  it("émet l'événement answer avec la bonne valeur", async () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        isBackVisible: true,
      },
      ...globalMountOptions,
    })

    // Prendre les boutons de la face arrière seulement
    const backFace = wrapper.find('.flip-card-back')
    const responseButtons = backFace.findAll('button')
    await responseButtons[0]?.trigger('click')

    if (responseButtons[0]) {
      expect(wrapper.emitted('answer')).toBeTruthy()
      expect(wrapper.emitted('answer')?.[0]).toEqual([false])
    }
  })

  it('émet show-back quand on clique sur le bouton', async () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        isBackVisible: false,
      },
      ...globalMountOptions,
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('show-back')).toBeTruthy()
  })

  it('affiche la réponse quand isBackVisible est true', () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        isBackVisible: true,
      },
      ...globalMountOptions,
    })

    expect(wrapper.text()).toContain('Paris')
    expect(wrapper.text()).toContain('❌')
    expect(wrapper.text()).toContain('✅')
  })

  it('émet answer avec la bonne valeur quand on clique sur une réponse', async () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        isBackVisible: true,
      },
      ...globalMountOptions,
    })

    const buttons = wrapper.findAll('button')
    // Le premier bouton de réponse devrait être "false" (❌)
    const falseButton = buttons.find((btn) => btn.text().includes('❌'))

    if (falseButton) {
      await falseButton.trigger('click')
      expect(wrapper.emitted('answer')).toBeTruthy()
      expect(wrapper.emitted('answer')?.[0]).toEqual([false])
    }
  })

  it("affiche le message par défaut quand il n'y a pas de carte", () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: null,
        isBackVisible: false,
      },
      ...globalMountOptions,
    })

    expect(wrapper.text()).toContain('Aucune carte')
  })
})
