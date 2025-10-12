import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewCard from '~/components/ReviewCard.vue'

// Mock de vue-i18n
const mockT = (key: string, params?: any) => {
  const translations: Record<string, string> = {
    'review.noCard': 'Aucune carte',
    'review.showAnswer': 'Voir la réponse',
    'review.again': 'Encore',
    'review.almost': 'Presque',
    'review.good': 'Bien'
  }
  
  if (params && typeof translations[key] === 'string') {
    return translations[key].replace(/\{(\w+)\}/g, (match, param) => params[param] || match)
  }
  return translations[key] || key
}

const globalMountOptions = {
  global: {
    mocks: {
      $t: mockT
    }
  }
}

describe('ReviewCard', () => {
  const mockCard = {
    id: '1',
    question: 'Quelle est la capitale de la France ?',
    answer: 'Paris',
    collection_id: 'collection1'
  }

  const mockResponses = [
    { value: 'false', emoji: '❌', label: 'review.again' },
    { value: 'almost', emoji: '➖', label: 'review.almost' },
    { value: 'true', emoji: '✅', label: 'review.good' }
  ]

  it('affiche la question de la carte', () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        showBack: false,
        responses: mockResponses
      },
      ...globalMountOptions
    })

    expect(wrapper.text()).toContain('Quelle est la capitale de la France ?')
    expect(wrapper.find('button').text()).toBe('Voir la réponse')
  })

  it('affiche le nom de la collection si fourni', () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        showBack: false,
        responses: mockResponses,
        collectionName: 'Ma Collection'
      },
      ...globalMountOptions
    })

    expect(wrapper.text()).toContain('Ma Collection')
  })

  it('émet show-back quand on clique sur le bouton', async () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        showBack: false,
        responses: mockResponses
      },
      ...globalMountOptions
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('show-back')).toBeTruthy()
  })

  it('affiche la réponse quand showBack est true', () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        showBack: true,
        responses: mockResponses
      },
      ...globalMountOptions
    })

    expect(wrapper.text()).toContain('Paris')
    expect(wrapper.text()).toContain('❌')
    expect(wrapper.text()).toContain('✅')
  })

  it('émet answer avec la bonne valeur quand on clique sur une réponse', async () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: mockCard,
        showBack: true,
        responses: mockResponses
      },
      ...globalMountOptions
    })

    const buttons = wrapper.findAll('button')
    // Le premier bouton de réponse devrait être "false" (❌)
    const falseButton = buttons.find(btn => btn.text().includes('❌'))
    
    if (falseButton) {
      await falseButton.trigger('click')
      expect(wrapper.emitted('answer')).toBeTruthy()
      expect(wrapper.emitted('answer')?.[0]).toEqual(['false'])
    }
  })

  it('affiche le message par défaut quand il n\'y a pas de carte', () => {
    const wrapper = mount(ReviewCard, {
      props: {
        currentCard: null,
        showBack: false,
        responses: mockResponses
      },
      ...globalMountOptions
    })

    expect(wrapper.text()).toContain('Aucune carte')
  })
})