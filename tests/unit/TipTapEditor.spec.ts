import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TipTapEditor from '~/components/TipTapEditor.vue'

describe('TipTapEditor', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(TipTapEditor, {
      props: {
        modelValue: '',
        placeholder: 'Test placeholder',
      },
    })
  })

  it('renders the editor', () => {
    expect(wrapper.find('.tiptap-editor').exists()).toBe(true)
  })

  it('renders the toolbar with all formatting buttons', () => {
    expect(wrapper.find('.toolbar').exists()).toBe(true)

    // Check for presence of toolbar buttons
    const buttons = wrapper.findAll('.toolbar-btn')
    // B, I, U, H2, H3, •, 1., Image = 8 buttons
    expect(buttons.length).toBe(8)
  })

  it('renders the editor content area', () => {
    expect(wrapper.find('.editor-content').exists()).toBe(true)
  })

  it('has bold button', () => {
    const boldButton = wrapper.findAll('.toolbar-btn')[0]
    expect(boldButton.text()).toContain('B')
  })

  it('has italic button', () => {
    const italicButton = wrapper.findAll('.toolbar-btn')[1]
    expect(italicButton.text()).toContain('I')
  })

  it('has underline button', () => {
    const underlineButton = wrapper.findAll('.toolbar-btn')[2]
    expect(underlineButton.text()).toContain('U')
  })

  it('has H2 button', () => {
    const h2Button = wrapper.findAll('.toolbar-btn')[3]
    expect(h2Button.text()).toContain('H2')
  })

  it('has H3 button', () => {
    const h3Button = wrapper.findAll('.toolbar-btn')[4]
    expect(h3Button.text()).toContain('H3')
  })

  it('has bullet list button', () => {
    const bulletButton = wrapper.findAll('.toolbar-btn')[5]
    expect(bulletButton.text()).toContain('•')
  })

  it('has ordered list button', () => {
    const orderedButton = wrapper.findAll('.toolbar-btn')[6]
    expect(orderedButton.text()).toContain('1.')
  })

  it('has image button with SVG icon', () => {
    const imageButton = wrapper.findAll('.toolbar-btn')[7]
    expect(imageButton.find('svg').exists()).toBe(true)
  })

  it('has hidden file input for image upload', () => {
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    expect(fileInput.attributes('accept')).toBe('image/*')
    expect(fileInput.attributes('style')).toContain('display: none')
  })

  it('accepts modelValue prop', () => {
    const wrapperWithContent = mount(TipTapEditor, {
      props: {
        modelValue: '<p>Test content</p>',
      },
    })
    expect(wrapperWithContent.props('modelValue')).toBe('<p>Test content</p>')
  })

  it('accepts placeholder prop', () => {
    expect(wrapper.props('placeholder')).toBe('Test placeholder')
  })
})
