import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe tags and attributes for flashcard content
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'code', 'pre', 'img'],
    ALLOWED_ATTR: ['src', 'alt', 'class'],
    ALLOW_DATA_ATTR: false,
  })
}
