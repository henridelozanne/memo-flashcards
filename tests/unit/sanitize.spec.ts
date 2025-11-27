import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '~/utils/sanitize'

describe('sanitizeHtml', () => {
  it('allows safe HTML tags', () => {
    const html = '<p>Test paragraph</p>'
    const result = sanitizeHtml(html)
    expect(result).toBe('<p>Test paragraph</p>')
  })

  it('allows bold and italic tags', () => {
    const html = '<p><strong>Bold</strong> and <em>italic</em></p>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<strong>Bold</strong>')
    expect(result).toContain('<em>italic</em>')
  })

  it('allows underline tag', () => {
    const html = '<p><u>Underlined text</u></p>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<u>Underlined text</u>')
  })

  it('allows headings h2 and h3', () => {
    const html = '<h2>Title 2</h2><h3>Title 3</h3>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<h2>Title 2</h2>')
    expect(result).toContain('<h3>Title 3</h3>')
  })

  it('allows bullet lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>Item 1</li>')
    expect(result).toContain('<li>Item 2</li>')
    expect(result).toContain('</ul>')
  })

  it('allows ordered lists', () => {
    const html = '<ol><li>First</li><li>Second</li></ol>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>First</li>')
    expect(result).toContain('<li>Second</li>')
    expect(result).toContain('</ol>')
  })

  it('allows images with src and alt attributes', () => {
    const html = '<img src="data:image/png;base64,abc123" alt="Test image">'
    const result = sanitizeHtml(html)
    expect(result).toContain('<img')
    expect(result).toContain('src="data:image/png;base64,abc123"')
    expect(result).toContain('alt="Test image"')
  })

  it('removes script tags', () => {
    const html = '<p>Safe</p><script>alert("xss")</script>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<p>Safe</p>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
  })

  it('removes onclick attributes', () => {
    const html = '<p onclick="alert(\'xss\')">Click me</p>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain('onclick')
    expect(result).toContain('Click me')
  })

  it('removes style attributes', () => {
    const html = '<p style="color: red;">Styled text</p>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain('style')
    expect(result).toContain('Styled text')
  })

  it('removes data attributes', () => {
    const html = '<p data-custom="value">Text</p>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain('data-custom')
    expect(result).toContain('Text')
  })

  it('removes iframe tags', () => {
    const html = '<p>Safe</p><iframe src="evil.com"></iframe>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<p>Safe</p>')
    expect(result).not.toContain('iframe')
  })

  it('handles empty string', () => {
    const result = sanitizeHtml('')
    expect(result).toBe('')
  })

  it('handles plain text without HTML', () => {
    const text = 'Just plain text'
    const result = sanitizeHtml(text)
    expect(result).toBe('Just plain text')
  })

  it('preserves line breaks', () => {
    const html = '<p>Line 1<br>Line 2</p>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<br>')
  })

  it('allows class attribute', () => {
    const html = '<p class="test-class">Text</p>'
    const result = sanitizeHtml(html)
    expect(result).toContain('class="test-class"')
  })

  it('sanitizes complex mixed content', () => {
    const html = `
      <h2>Title</h2>
      <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <script>alert("xss")</script>
    `
    const result = sanitizeHtml(html)
    expect(result).toContain('<h2>Title</h2>')
    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('<em>italic</em>')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>Item 1</li>')
    expect(result).not.toContain('<script>')
  })
})
