import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyReviewEnd from '~/components/DailyReviewEnd.vue'

// Mock i18n
const mockT = (key: string, params?: Record<string, any>) => {
  const translations: Record<string, string> = {
    'dailyReview.sessionFinished': 'Session terminée !',
    'dailyReview.cardsReviewed': 'Cartes révisées : {count}',
    'dailyReview.successRate': 'Taux de réussite : {percent}%',
    'dailyReview.backToCollections': 'Retour aux collections'
  }
  
  let result = translations[key] || key
  
  if (params) {
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, String(params[param]))
    })
  }
  
  return result
}

describe('DailyReviewEnd Component', () => {
  it('renders session finished title', () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 5,
        successRate: 80
      },
      global: {
        mocks: {
          $t: mockT
        }
      }
    })

    expect(wrapper.text()).toContain('Session terminée !')
  })

  it('displays number of cards reviewed', () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 3,
        successRate: 67
      },
      global: {
        mocks: {
          $t: mockT
        }
      }
    })

    expect(wrapper.text()).toContain('Cartes révisées : 3')
  })

  it('displays success rate percentage', () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 10,
        successRate: 90
      },
      global: {
        mocks: {
          $t: mockT
        }
      }
    })

    expect(wrapper.text()).toContain('Taux de réussite : 90%')
  })

  it('emits back event when button is clicked', async () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 5,
        successRate: 80
      },
      global: {
        mocks: {
          $t: mockT
        }
      }
    })

    const button = wrapper.find('button')
    await button.trigger('click')
    
    expect(wrapper.emitted('back')).toBeTruthy()
    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('shows back button with correct text', () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 5,
        successRate: 80
      },
      global: {
        mocks: {
          $t: mockT
        }
      }
    })

    expect(wrapper.text()).toContain('Retour aux collections')
  })
})