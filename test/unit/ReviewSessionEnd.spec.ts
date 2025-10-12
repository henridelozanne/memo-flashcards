import { mount } from '@vue/test-utils'
import ReviewSessionEnd from '~/components/ReviewSessionEnd.vue'

describe('ReviewSessionEnd', () => {
  it('affiche les infos de fin de session', () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { count: 5, percent: 80 },
      global: { mocks: { $t: (k, v) => v ? `${k}:${JSON.stringify(v)}` : k } }
    })
    expect(wrapper.text()).toContain('review.sessionFinished')
    expect(wrapper.text()).toContain('review.cardsReviewed:{"count":5}')
    expect(wrapper.text()).toContain('review.successRate:{"percent":80}')
  })

  it('émet back quand on clique sur le bouton', async () => {
    const wrapper = mount(ReviewSessionEnd, {
      props: { count: 2, percent: 100 },
      global: { mocks: { $t: (k) => k } }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('back')).toBeTruthy()
  })
})
