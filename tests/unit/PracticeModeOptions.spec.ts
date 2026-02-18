import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeModeOptions from '~/components/PracticeModeOptions.vue'

// Mock i18n
const global = {
  mocks: {
    $t: (key: string) => key,
  },
}

describe('PracticeModeOptions', () => {
  it('renders all 5 options', () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(5)
  })

  it('displays correct initial values', () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: true,
          onlyDue: false,
          onlyNew: true,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[1].element as HTMLInputElement).checked).toBe(false)
    expect((checkboxes[2].element as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[3].element as HTMLInputElement).checked).toBe(false)
    expect((checkboxes[4].element as HTMLInputElement).checked).toBe(false)
  })

  it('emits update:modelValue when mostFailed is toggled', async () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const checkbox = wrapper.findAll('input[type="checkbox"]')[0]
    await checkbox.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[]
    expect(emitted[0][0].mostFailed).toBe(true)
  })

  it('emits update:modelValue when onlyDue is toggled', async () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const checkbox = wrapper.findAll('input[type="checkbox"]')[1]
    await checkbox.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[]
    expect(emitted[0][0].onlyDue).toBe(true)
  })

  it('emits update:modelValue when onlyNew is toggled', async () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const checkbox = wrapper.findAll('input[type="checkbox"]')[2]
    await checkbox.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[]
    expect(emitted[0][0].onlyNew).toBe(true)
  })

  it('emits update:modelValue when excludeNew is toggled', async () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const checkbox = wrapper.findAll('input[type="checkbox"]')[3]
    await checkbox.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[]
    expect(emitted[0][0].excludeNew).toBe(true)
  })

  it('emits update:modelValue when swapQuestionAnswer is toggled', async () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const checkbox = wrapper.findAll('input[type="checkbox"]')[4]
    await checkbox.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as any[]
    expect(emitted[0][0].swapQuestionAnswer).toBe(true)
  })

  it('updates when modelValue prop changes', async () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    await wrapper.setProps({
      modelValue: {
        mostFailed: true,
        onlyDue: true,
        onlyNew: false,
        excludeNew: false,
        swapQuestionAnswer: false,
      },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true)
  })

  it('handles multiple options being toggled', async () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')

    // Cocher mostFailed (index 0)
    await checkboxes[0].trigger('click')

    // Cocher onlyNew (index 2)
    await checkboxes[2].trigger('click')

    // Cocher swapQuestionAnswer (index 4)
    await checkboxes[4].trigger('click')

    const emitted = wrapper.emitted('update:modelValue') as any[]
    expect(emitted.length).toBe(3) // Devrait avoir 3 événements

    // Vérifier chaque événement émis
    expect(emitted[0][0].mostFailed).toBe(true)
    expect(emitted[1][0].onlyNew).toBe(true)
    expect(emitted[2][0].swapQuestionAnswer).toBe(true)
  })

  it('renders option descriptions', () => {
    const wrapper = mount(PracticeModeOptions, {
      global,
      props: {
        modelValue: {
          mostFailed: false,
          onlyDue: false,
          onlyNew: false,
          excludeNew: false,
          swapQuestionAnswer: false,
        },
      },
    })

    const descriptions = wrapper.findAll('.option-description')
    expect(descriptions).toHaveLength(5)
  })
})
