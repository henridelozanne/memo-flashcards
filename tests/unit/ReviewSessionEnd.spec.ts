import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ReviewSessionEnd from '@/components/ReviewSessionEnd.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      review: {
        sessionFinished: 'Session terminée !',
        congrats: 'Félicitations !',
        cardsReviewed: '{count} cartes révisées',
        successRate: 'Taux de réussite : {percent}%',
        backToCollections: 'Retour aux collections',
      },
    },
  },
})

describe('ReviewSessionEnd', () => {
  it('renders session finished message', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: {
        cardsReviewedCount: 10,
        successRate: 80,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Session terminée !')
  })

  it('displays congrats message', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: {
        cardsReviewedCount: 5,
        successRate: 90,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Félicitations !')
  })

  it('shows cards reviewed count', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: {
        cardsReviewedCount: 15,
        successRate: 75,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('15 cartes révisées')
  })

  it('displays success rate', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: {
        cardsReviewedCount: 10,
        successRate: 85,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Taux de réussite : 85%')
  })

  it('has back button', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: {
        cardsReviewedCount: 10,
        successRate: 80,
      },
      global: {
        plugins: [i18n],
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Retour aux collections')
  })

  it('emits back event when button clicked', async () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: {
        cardsReviewedCount: 10,
        successRate: 80,
      },
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('back')).toBeTruthy()
    expect(wrapper.emitted('back')?.length).toBe(1)
  })

  it('handles zero cards reviewed', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: {
        cardsReviewedCount: 0,
        successRate: 0,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('0 cartes révisées')
  })

  it('handles 100% success rate', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: {
        cardsReviewedCount: 20,
        successRate: 100,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('100%')
  })
})
