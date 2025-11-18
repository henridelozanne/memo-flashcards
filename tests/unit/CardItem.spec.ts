import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CardItem from '@/components/CardItem.vue'

describe('CardItem', () => {
  const mockCard = {
    id: 'card-1',
    question: 'What is Vue.js?',
    answer: 'A progressive JavaScript framework',
    collection_id: 'col-1',
    user_id: 'user-1',
    box: 1,
    compartment: 1,
    next_review: new Date().toISOString(),
    next_review_at: Date.now(),
    created_at: Date.now(),
    updated_at: Date.now(),
    last_reviewed_at: null,
    times_reviewed: 0,
    correct_answers: 0,
    total_reviews: 0,
  }

  it('renders card question', () => {
    const wrapper = mount(CardItem, {
      props: {
        card: mockCard,
      },
    })

    expect(wrapper.text()).toContain('What is Vue.js?')
  })

  it('renders card answer', () => {
    const wrapper = mount(CardItem, {
      props: {
        card: mockCard,
      },
    })

    expect(wrapper.text()).toContain('A progressive JavaScript framework')
  })

  it('emits click event with card id when clicked', async () => {
    const wrapper = mount(CardItem, {
      props: {
        card: mockCard,
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual(['card-1'])
  })

  it('has correct card styling', () => {
    const wrapper = mount(CardItem, {
      props: {
        card: mockCard,
      },
    })

    expect(wrapper.classes()).toContain('rounded-[15px]')
    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  it('displays divider between question and answer', () => {
    const wrapper = mount(CardItem, {
      props: {
        card: mockCard,
      },
    })

    const divider = wrapper.find('.h-px')
    expect(divider.exists()).toBe(true)
  })

  it('truncates long text with line-clamp', () => {
    const longCard = {
      ...mockCard,
      question: 'This is a very long question that should be truncated when displayed in the card item component',
      answer: 'This is also a very long answer that needs to be truncated to fit properly in the card display area',
    }

    const wrapper = mount(CardItem, {
      props: {
        card: longCard,
      },
    })

    const question = wrapper.find('.line-clamp-3')
    const answer = wrapper.find('.line-clamp-4')

    expect(question.exists()).toBe(true)
    expect(answer.exists()).toBe(true)
  })
})
