import { describe, expect, it } from 'vitest'

import { getLanguageFromRequest, getServerT } from '../i18n.server'

describe('i18n.server', () => {
  describe('getLanguageFromRequest', () => {
    it('should extract Dutch language from cookie', () => {
      // Create request and mock headers.get to return cookie value
      // (Cookie header is forbidden in Request API, so we mock it)
      const request = new Request('http://localhost')
      const originalGet = request.headers.get.bind(request.headers)
      request.headers.get = (name: string) => {
        if (name === 'Cookie') return 'lang=nl'
        return originalGet(name)
      }

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })

    it('should extract English language from cookie', () => {
      // Create request and mock headers.get to return cookie value
      // (Cookie header is forbidden in Request API, so we mock it)
      const request = new Request('http://localhost')
      const originalGet = request.headers.get.bind(request.headers)
      request.headers.get = (name: string) => {
        if (name === 'Cookie') return 'lang=en'
        return originalGet(name)
      }

      const language = getLanguageFromRequest(request)
      expect(language).toBe('en')
    })

    it('should fallback to Dutch when no cookie is present', () => {
      const request = new Request('http://localhost')

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })

    it('should fallback to Dutch for unsupported language', () => {
      const request = new Request('http://localhost')
      const originalGet = request.headers.get.bind(request.headers)
      request.headers.get = (name: string) => {
        if (name === 'Cookie') return 'lang=es' // Spanish not supported
        return originalGet(name)
      }

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })

    it('should extract language from cookie with multiple values', () => {
      const request = new Request('http://localhost')
      const originalGet = request.headers.get.bind(request.headers)
      request.headers.get = (name: string) => {
        if (name === 'Cookie') return 'theme=dark; lang=nl; session=xyz'
        return originalGet(name)
      }

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })

    it('should handle malformed cookie values', () => {
      const request = new Request('http://localhost')
      const originalGet = request.headers.get.bind(request.headers)
      request.headers.get = (name: string) => {
        if (name === 'Cookie') return 'lang='
        return originalGet(name)
      }

      const language = getLanguageFromRequest(request)
      expect(language).toBe('nl')
    })
  })

  describe('getServerT', () => {
    it('should return a translation function', () => {
      const request = new Request('http://localhost')
      const originalGet = request.headers.get.bind(request.headers)
      request.headers.get = (name: string) => {
        if (name === 'Cookie') return 'lang=nl'
        return originalGet(name)
      }

      const t = getServerT(request)
      expect(typeof t).toBe('function')
    })

    it('should return translations for known keys', () => {
      const request = new Request('http://localhost')
      const originalGet = request.headers.get.bind(request.headers)
      request.headers.get = (name: string) => {
        if (name === 'Cookie') return 'lang=nl'
        return originalGet(name)
      }

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
      const request = new Request('http://localhost')
      const originalGet = request.headers.get.bind(request.headers)
      request.headers.get = (name: string) => {
        if (name === 'Cookie') return 'lang=nl'
        return originalGet(name)
      }

      const t = getServerT(request)

      // i18next returns the key itself when translation is missing
      const result = t('nonexistent.key.that.does.not.exist')
      expect(typeof result).toBe('string')
    })
  })
})
