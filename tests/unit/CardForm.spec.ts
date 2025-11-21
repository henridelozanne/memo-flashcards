import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import CardForm from '@/components/CardForm.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      cards: {
        front: 'Recto',
        frontPlaceholder: 'Question',
        back: 'Verso',
        backPlaceholder: 'Réponse',
        addAnother: 'Ajouter une autre',
      },
      form: {
        frontRequired: 'Le recto est requis',
        backRequired: 'Le verso est requis',
      },
      common: {
        cancel: 'Annuler',
        add: 'Ajouter',
        loading: 'Chargement...',
      },
    },
  },
})

describe('CardForm', () => {
  it('renders front and back inputs', () => {
    const wrapper = mount(CardForm, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('[data-testid="front-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="back-input"]').exists()).toBe(true)
  })

  it('displays initial front value', () => {
    const wrapper = mount(CardForm, {
      props: {
        front: 'Question initiale',
      },
      global: {
        plugins: [i18n],
      },
    })

    const input = wrapper.find('[data-testid="front-input"]')
    expect((input.element as HTMLInputElement).value).toBe('Question initiale')
  })

  it('displays initial back value', () => {
    const wrapper = mount(CardForm, {
      props: {
        back: 'Réponse initiale',
      },
      global: {
        plugins: [i18n],
      },
    })

    const textarea = wrapper.find('[data-testid="back-input"]')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Réponse initiale')
  })

  it('shows validation error when front is empty', async () => {
    const wrapper = mount(CardForm, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Le recto est requis')
  })

  it('shows validation error when back is empty', async () => {
    const wrapper = mount(CardForm, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('[data-testid="front-input"]').setValue('Question')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Le verso est requis')
  })

  it('emits submit event with front and back values', async () => {
    const wrapper = mount(CardForm, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('[data-testid="front-input"]').setValue('Ma question')
    await wrapper.find('[data-testid="back-input"]').setValue('Ma réponse')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]).toEqual(['Ma question', 'Ma réponse'])
  })

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mount(CardForm, {
      global: {
        plugins: [i18n],
      },
    })

    const buttons = wrapper.findAll('button[type="button"]')
    await buttons[0].trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('disables buttons when isSubmitting is true', () => {
    const wrapper = mount(CardForm, {
      props: {
        isSubmitting: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('[data-testid="add-card-submit"]').attributes('disabled')).toBeDefined()
  })

  it('displays custom submit label', () => {
    const wrapper = mount(CardForm, {
      props: {
        submitLabel: 'Sauvegarder',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Sauvegarder')
  })

  it('trims whitespace from inputs', async () => {
    const wrapper = mount(CardForm, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('[data-testid="front-input"]').setValue('  Question  ')
    await wrapper.find('[data-testid="back-input"]').setValue('  Réponse  ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual(['Question', 'Réponse'])
  })
})
