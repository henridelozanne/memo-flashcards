import { mount } from '@vue/test-utils'
import ReviewCard from '~/components/ReviewCard.vue'

describe('ReviewCard', () => {
  const baseProps = {
    currentCard: { question: 'Q?', answer: 'A!' },
    showBack: false,
    responses: [
      { value: 'false', emoji: '❌', label: 'review.again' },
      { value: 'almost', emoji: '➖', label: 'review.almost' },
      { value: 'true', emoji: '✅', label: 'review.good' }
    ]
  }

  it('affiche la question sur le recto', () => {
    const wrapper = mount(ReviewCard, { props: baseProps, global: { mocks: { $t: (k) => k } } })
    expect(wrapper.text()).toContain('Q?')
  })

  it('affiche la réponse sur le verso quand showBack=true', () => {
    const wrapper = mount(ReviewCard, { props: { ...baseProps, showBack: true }, global: { mocks: { $t: (k) => k } } })
    expect(wrapper.text()).toContain('A!')
  })

  it('émet show-back quand on clique sur afficher la réponse', async () => {
    const wrapper = mount(ReviewCard, { props: baseProps, global: { mocks: { $t: (k) => k } } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('show-back')).toBeTruthy()
  })

  it('émet answer avec la bonne valeur', async () => {
    const wrapper = mount(ReviewCard, { props: { ...baseProps, showBack: true }, global: { mocks: { $t: (k) => k } } })
    const btns = wrapper.findAll('.flip-card-back button')
    await btns[0].trigger('click')
    expect(wrapper.emitted('answer')[0]).toEqual(['false'])
  })
})
