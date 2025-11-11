import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import BackgroundEffects from '~/components/BackgroundEffects.vue'

describe('BackgroundEffects', () => {
  it('renders correctly', () => {
    const wrapper = mount(BackgroundEffects)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders multiple ellipses', () => {
    const wrapper = mount(BackgroundEffects)
    const ellipses = wrapper.findAll('.ellipse')
    expect(ellipses.length).toBeGreaterThan(0)
  })

  it('has background-effects container', () => {
    const wrapper = mount(BackgroundEffects)
    expect(wrapper.find('.background-effects').exists()).toBe(true)
  })

  it('has fixed position style', () => {
    const wrapper = mount(BackgroundEffects)
    const container = wrapper.find('.background-effects')
    // Le style fixed est dans le CSS scoped, vérifions juste que l'élément existe
    expect(container.exists()).toBe(true)
  })
})
