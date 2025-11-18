import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import CollectionForm from '@/components/CollectionForm.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    fr: {
      collections: {
        nameLabel: 'Nom de la collection',
        namePlaceholder: 'Ex: Vocabulaire espagnol',
        submitting: 'En cours...',
      },
      form: {
        nameRequired: 'Le nom est requis',
      },
      common: {
        cancel: 'Annuler',
      },
    },
  },
})

describe('CollectionForm', () => {
  it('renders form with name input', () => {
    const wrapper = mount(CollectionForm, {
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.find('#name').exists()).toBe(true)
  })

  it('displays initial name value', () => {
    const wrapper = mount(CollectionForm, {
      props: {
        name: 'Test Collection',
      },
      global: {
        plugins: [i18n],
      },
    })

    const input = wrapper.find('#name')
    expect((input.element as HTMLInputElement).value).toBe('Test Collection')
  })

  it('shows validation error when name is empty', async () => {
    const wrapper = mount(CollectionForm, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Le nom est requis')
  })

  it('emits submit event with trimmed name', async () => {
    const wrapper = mount(CollectionForm, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('#name').setValue('  My Collection  ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]).toEqual(['My Collection'])
  })

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mount(CollectionForm, {
      global: {
        plugins: [i18n],
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('disables submit button when isSubmitting is true', () => {
    const wrapper = mount(CollectionForm, {
      props: {
        isSubmitting: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    const submitButton = wrapper.find('[data-testid="create-btn"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('shows submitting text when isSubmitting is true', () => {
    const wrapper = mount(CollectionForm, {
      props: {
        isSubmitting: true,
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('En cours...')
  })

  it('displays custom submit label', () => {
    const wrapper = mount(CollectionForm, {
      props: {
        submitLabel: 'Créer',
      },
      global: {
        plugins: [i18n],
      },
    })

    expect(wrapper.text()).toContain('Créer')
  })

  it('shows error border when validation fails', async () => {
    const wrapper = mount(CollectionForm, {
      global: {
        plugins: [i18n],
      },
    })

    await wrapper.find('form').trigger('submit')

    const input = wrapper.find('#name')
    expect(input.classes()).toContain('border-[var(--color-accent-red)]')
  })

  it('clears error when valid input is entered', async () => {
    const wrapper = mount(CollectionForm, {
      global: {
        plugins: [i18n],
      },
    })

    // First trigger validation error
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Le nom est requis')

    // Then enter valid name
    await wrapper.find('#name').setValue('Valid Name')
    await wrapper.find('form').trigger('submit')

    // Error should be gone
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
