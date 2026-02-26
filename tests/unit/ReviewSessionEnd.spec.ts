import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ReviewSessionEnd from '@/components/ReviewSessionEnd.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      review: {
        sessionFinished: 'Session terminée',
        congrats: 'Félicitations !',
        successRate: 'Taux de réussite : {percent}%',
        backToCollections: 'Retour aux collections',
      },
    },
  },
})

describe('ReviewSessionEnd', () => {
  it('renders session finished message', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 10, goodCount: 8, successRate: 80 },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Session terminée')
  })

  it('displays congrats message', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 5, goodCount: 4, successRate: 80 },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Félicitations !')
  })

  it('displays score as X / Y', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 15, goodCount: 11, successRate: 73 },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('11')
    expect(wrapper.text()).toContain('15')
  })

  it('displays success rate', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 10, goodCount: 8, successRate: 80 },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Taux de réussite : 80%')
  })

  it('has back button', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 10, goodCount: 8, successRate: 80 },
      global: { plugins: [i18n] },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Retour aux collections')
  })

  it('emits back event when button clicked', async () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 10, goodCount: 8, successRate: 80 },
      global: { plugins: [i18n] },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('back')).toBeTruthy()
    expect(wrapper.emitted('back')?.length).toBe(1)
  })

  it('handles zero cards reviewed', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 0, goodCount: 0, successRate: 0 },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('0')
  })

  it('handles perfect score', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 20, goodCount: 20, successRate: 100 },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('20')
  })

  it('renders answered cards list', () => {
    const answeredCards = [
      { question: 'What is 2+2?', answer: '4', correct: true },
      { question: 'Capital of France?', answer: 'Paris', correct: false },
    ]
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 2, goodCount: 1, successRate: 50, answeredCards },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('What is 2+2?')
    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('Capital of France?')
    expect(wrapper.text()).toContain('Paris')
  })

  it('applies green class for correct answers and red for wrong', () => {
    const answeredCards = [
      { question: 'Q1', answer: 'A1', correct: true },
      { question: 'Q2', answer: 'A2', correct: false },
    ]
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 2, goodCount: 1, successRate: 50, answeredCards },
      global: { plugins: [i18n] },
    })
    const rows = wrapper.findAll('[class*="rounded-lg"]').filter((w) => w.text().includes('→'))
    expect(rows[0].classes()).toContain('bg-green-50')
    expect(rows[1].classes()).toContain('bg-red-50')
  })

  it('adds scroll class when 10 or more cards', () => {
    const answeredCards = Array.from({ length: 10 }, (_, i) => ({
      question: `Q${i}`,
      answer: `A${i}`,
      correct: i % 2 === 0,
    }))
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 10, goodCount: 5, successRate: 50, answeredCards },
      global: { plugins: [i18n] },
    })
    const list = wrapper.find('.max-h-52')
    expect(list.exists()).toBe(true)
    expect(list.classes()).toContain('overflow-y-auto')
  })

  it('does not add scroll class when fewer than 10 cards', () => {
    const answeredCards = Array.from({ length: 5 }, (_, i) => ({
      question: `Q${i}`,
      answer: `A${i}`,
      correct: true,
    }))
    const wrapper = mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 5, goodCount: 5, successRate: 100, answeredCards },
      global: { plugins: [i18n] },
    })
    const list = wrapper.find('.overflow-y-auto')
    expect(list.exists()).toBe(false)
  })

  it('does not trigger confetti when successRate < 50', () => {
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 10, goodCount: 4, successRate: 40 },
      global: { plugins: [i18n] },
    })
    expect(getContextSpy).not.toHaveBeenCalled()
    getContextSpy.mockRestore()
  })

  it('triggers confetti when successRate >= 50', () => {
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    mount(ReviewSessionEnd, {
      props: { cardsReviewedCount: 10, goodCount: 5, successRate: 50 },
      global: { plugins: [i18n] },
    })
    expect(getContextSpy).toHaveBeenCalledWith('2d')
    getContextSpy.mockRestore()
  })
})
