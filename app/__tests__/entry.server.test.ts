import { describe, expect, it } from 'vitest'

import { applySecurityHeaders, generateNonce } from '../entry.server'

describe('entry.server.tsx', () => {
  describe('generateNonce', () => {
    it('should generate unique nonces', () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()
      expect(nonce1).not.toBe(nonce2)
      // Base64 characters: A-Z, a-z, 0-9, +, /, =
      expect(nonce1).toMatch(/^[A-Za-z0-9+/]+=*$/)
    })

    it('should generate nonces of a specific length (16 bytes base64 encoded)', () => {
      const nonce = generateNonce()
      // 16 bytes * 4/3 = 21.33 characters, padded to 24 with =
      expect(nonce.length).toBe(24)
    })
  })

  describe('applySecurityHeaders', () => {
    it('should include nonce in CSP script-src directive', () => {
      const headers = new Headers()
      const nonce = 'test-nonce-123'
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' `)
      expect(csp).not.toContain("'unsafe-inline'")
    })

    it('should set X-Frame-Options to DENY', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)
      expect(headers.get('X-Frame-Options')).toBe('DENY')
    })

    it('should set X-Content-Type-Options to nosniff', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)
      expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
    })

    it('should set Referrer-Policy to strict-origin-when-cross-origin', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)
      expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    })

    it('should set Permissions-Policy', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)
      expect(headers.get('Permissions-Policy')).toBe(
        'geolocation=(), microphone=(), camera=()'
      )
    })

    it('should set Strict-Transport-Security in production', () => {
      process.env.NODE_ENV = 'production' // Temporarily set to production
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)
      expect(headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains; preload'
      )
      process.env.NODE_ENV = 'test' // Reset to test
    })

    it('should not set Strict-Transport-Security in development', () => {
      process.env.NODE_ENV = 'development' // Temporarily set to development
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)
      expect(headers.get('Strict-Transport-Security')).toBeNull()
      process.env.NODE_ENV = 'test' // Reset to test
    })

    it('should include form-action sources from environment variables', () => {
      process.env.BASE_URL = 'http://base.url'
      process.env.EMAIL_BASE_URL = 'http://email.url'
      process.env.CSP_FORM_ACTION_ALLOWLIST = 'http://allow.list,  http://another.list'

      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test.url'), nonce)
      const csp = headers.get('Content-Security-Policy')
      const expectedFormActions = [
        "'self'",
        'http://base.url',
        'http://email.url',
        'http://test.url',
        'http://allow.list',
        'http://another.list',
      ].sort()

      const formActionDirective = csp
        ?.split('; ')
        .find(d => d.startsWith('form-action'))
      expect(formActionDirective).toBeTruthy()

      const actualFormActions = formActionDirective
        ?.replace('form-action ', '')
        .split(' ')
        .sort()

      expect(actualFormActions).toEqual(expectedFormActions)

      delete process.env.BASE_URL
      delete process.env.EMAIL_BASE_URL
      delete process.env.CSP_FORM_ACTION_ALLOWLIST
    })

    it('should handle invalid form-action origins gracefully', () => {
      process.env.CSP_FORM_ACTION_ALLOWLIST = 'invalid-url'

      const headers = new Headers()
      const nonce = generateNonce()
      // We expect a console warn here, but we can't directly assert on console.warn in vitest easily
      // Instead, we ensure the function doesn't crash and CSP is still set
      applySecurityHeaders(headers, new Request('http://test'), nonce)
      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain("form-action 'self'") // Should still contain self

      delete process.env.CSP_FORM_ACTION_ALLOWLIST
    })

    it('should only add unique form-action sources', () => {
      process.env.BASE_URL = 'http://duplicate.com'
      process.env.EMAIL_BASE_URL = 'http://duplicate.com'

      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://duplicate.com/path'), nonce)
      const csp = headers.get('Content-Security-Policy')

      const formActionDirective = csp
        ?.split('; ')
        .find(d => d.startsWith('form-action'))
      expect(formActionDirective).toBeTruthy()

      const actualFormActions = formActionDirective
        ?.replace('form-action ', '')
        .split(' ')
        .sort()

      const expectedFormActions = ["'self'", 'http://duplicate.com'].sort()

      expect(actualFormActions).toEqual(expectedFormActions)

      delete process.env.BASE_URL
      delete process.env.EMAIL_BASE_URL
    })

    it('should correctly include multiple script sources with nonce', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain(
        `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com`
      )
    })

    it('should include unsafe-eval in dev environments for script-src', () => {
      process.env.NODE_ENV = 'development'
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain(`'unsafe-eval' http://localhost:* http://127.0.0.1:*`)

      process.env.NODE_ENV = 'test'
    })

    it('should not include unsafe-eval in production environments for script-src', () => {
      process.env.NODE_ENV = 'production'
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).not.toContain(`'unsafe-eval'`)

      process.env.NODE_ENV = 'test'
    })

    it('should include http and ws localhost for connect-src in dev environments', () => {
      process.env.NODE_ENV = 'development'
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain(`http://localhost:* ws://localhost:* ws://127.0.0.1:*`)

      process.env.NODE_ENV = 'test'
    })

    it('should not include http and ws localhost for connect-src in production environments', () => {
      process.env.NODE_ENV = 'production'
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).not.toContain(`http://localhost:* ws://localhost:* ws://127.0.0.1:*`)

      process.env.NODE_ENV = 'test'
    })

    it('should include default-src self', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain(`default-src 'self'`)
    })

    it('should include base-uri self', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain(`base-uri 'self'`)
    })

    it('should include manifest-src self', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain(`manifest-src 'self'`)
    })

    it('should include upgrade-insecure-requests', () => {
      const headers = new Headers()
      const nonce = generateNonce()
      applySecurityHeaders(headers, new Request('http://test'), nonce)

      const csp = headers.get('Content-Security-Policy')
      expect(csp).toContain(`upgrade-insecure-requests`)
    })
  })
})
