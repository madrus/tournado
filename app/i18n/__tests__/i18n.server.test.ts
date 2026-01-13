import { describe, expect, it } from 'vitest'
import { getLanguageFromRequest, getServerT } from '../i18n.server'

/**
 * Helper function to create a Request with mocked Cookie header
 * (Cookie header is forbidden in Fetch API, so we mock it for testing)
 */
function createRequestWithCookie(cookieValue: string): Request {
  const request = new Request('http://localhost')
  const originalGet = request.headers.get.bind(request.headers)
  request.headers.get = (name: string) => {
    if (name === 'Cookie') return cookieValue
    return originalGet(name)
  }
  return request
}

describe('i18n.server', () => {
  describe('getLanguageFromRequest', () => {
    it('should extract Dutch language from cookie', () => {
      const request = createRequestWithCookie('lang=nl')

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })

    it('should extract English language from cookie', () => {
      const request = createRequestWithCookie('lang=en')

      const language = getLanguageFromRequest(request)
      expect(language).toBe('en')
    })

    it('should fallback to Dutch when no cookie is present', () => {
      const request = new Request('http://localhost')

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })

    it('should fallback to Dutch for unsupported language', () => {
      const request = createRequestWithCookie('lang=es') // Spanish not supported

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })

    it('should extract language from cookie with multiple values', () => {
      const request = createRequestWithCookie('theme=dark; lang=nl; session=xyz')

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })

    it('should handle malformed cookie values', () => {
      const request = createRequestWithCookie('lang=')

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })
  })

  describe('getServerT', () => {
    it('should return a translation function', () => {
      const request = createRequestWithCookie('lang=nl')

      const t = getServerT(request)
      expect(typeof t).toBe('function')
    })

    it('should return translations for known keys', () => {
      const request = createRequestWithCookie('lang=nl')

      const t = getServerT(request)

      // Verify translations are returned and differ from keys
      const key1 = 'messages.user.cannotChangeOwnRole'
      const key2 = 'messages.user.missingUserId'
      const key3 = 'messages.user.failedToUpdateRole'

      expect(t(key1)).not.toBe(key1)
      expect(t(key1).length).toBeGreaterThan(0)
      expect(t(key2)).not.toBe(key2)
      expect(t(key2).length).toBeGreaterThan(0)
      expect(t(key3)).not.toBe(key3)
      expect(t(key3).length).toBeGreaterThan(0)
    })

    it('should fallback to Dutch when no cookie is present', () => {
      const request = new Request('http://localhost')

      const t = getServerT(request)
      expect(typeof t).toBe('function')

      const key = 'messages.user.cannotChangeOwnRole'
      const translation = t(key)
      expect(translation).not.toBe(key)
      expect(translation.length).toBeGreaterThan(0)
    })

    it('should handle non-existent translation keys gracefully', () => {
      const request = createRequestWithCookie('lang=nl')

      const t = getServerT(request)

      // i18next returns the key itself when translation is missing
      const nonExistentKey = 'nonexistent.key.that.does.not.exist'
      const result = t(nonExistentKey)
      expect(result).toBe(nonExistentKey)
    })
  })
})
