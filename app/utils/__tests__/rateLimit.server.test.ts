import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIP,
  RATE_LIMITS,
  type RateLimitConfig,
} from '../rateLimit.server'

// Clear attempts by using unique identifiers for each test
let testCounter = 0
const getUniqueId = () => `test-${++testCounter}-${Date.now()}`

describe('rateLimit.server', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock environment to ensure rate limiting is active during tests
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('PLAYWRIGHT', 'false')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  describe('checkRateLimit', () => {
    const testConfig: RateLimitConfig = {
      maxAttempts: 3,
      windowMs: 60000, // 1 minute
      blockDurationMs: 120000, // 2 minutes
    }

    test('should allow first request', () => {
      const testId = getUniqueId()
      const result = checkRateLimit(testId, testConfig)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
      expect(result.retryAfter).toBeUndefined()
    })

    test('should track multiple requests from same identifier', () => {
      const testId = getUniqueId()

      // First request
      let result = checkRateLimit(testId, testConfig)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)

      // Second request
      result = checkRateLimit(testId, testConfig)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)

      // Third request - this should be blocked because count becomes 3 >= maxAttempts (3)
      result = checkRateLimit(testId, testConfig)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    test('should block requests after limit exceeded', () => {
      const testId = getUniqueId()

      // Use up all attempts
      for (let i = 0; i < 3; i++) {
        checkRateLimit(testId, testConfig)
      }

      // Fourth request should be blocked
      const result = checkRateLimit(testId, testConfig)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBe(120) // 2 minutes in seconds
    })

    test('should reset window after time passes', () => {
      const testId = getUniqueId()

      // Use up all attempts
      for (let i = 0; i < 3; i++) {
        checkRateLimit(testId, testConfig)
      }

      // Advance time past the window
      vi.advanceTimersByTime(testConfig.windowMs + 1000)

      // Should allow new requests
      const result = checkRateLimit(testId, testConfig)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    test('should handle different identifiers separately', () => {
      const testId1 = getUniqueId()
      const testId2 = getUniqueId()

      // Use up attempts for first IP
      for (let i = 0; i < 3; i++) {
        checkRateLimit(testId1, testConfig)
      }

      // Second IP should still be allowed
      const result = checkRateLimit(testId2, testConfig)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    test('should reset after block duration expires', () => {
      const testId = getUniqueId()

      // Use up all attempts
      for (let i = 0; i < 3; i++) {
        checkRateLimit(testId, testConfig)
      }

      // Verify blocked
      let result = checkRateLimit(testId, testConfig)
      expect(result.allowed).toBe(false)

      // Advance time past block duration
      vi.advanceTimersByTime(testConfig.blockDurationMs! + 1000)

      // Should allow new requests
      result = checkRateLimit(testId, testConfig)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    test('should use windowMs as default block duration', () => {
      const testId = getUniqueId()
      const configWithoutBlockDuration: RateLimitConfig = {
        maxAttempts: 2,
        windowMs: 30000, // 30 seconds
      }

      // Use up attempts
      checkRateLimit(testId, configWithoutBlockDuration)
      checkRateLimit(testId, configWithoutBlockDuration)

      // Should be blocked
      const result = checkRateLimit(testId, configWithoutBlockDuration)
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBe(30) // windowMs / 1000
    })

    test('should handle resetTime correctly', () => {
      const testId = getUniqueId()
      const startTime = Date.now()
      vi.setSystemTime(startTime)

      const result = checkRateLimit(testId, testConfig)
      expect(result.resetTime).toBe(startTime + testConfig.windowMs)
    })
  })

  describe('getClientIP', () => {
    test('should extract IP from cf-connecting-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '1.2.3.4',
        },
      })

      expect(getClientIP(request)).toBe('1.2.3.4')
    })

    test('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '1.2.3.4',
        },
      })

      expect(getClientIP(request)).toBe('1.2.3.4')
    })

    test('should extract first IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12',
        },
      })

      expect(getClientIP(request)).toBe('1.2.3.4')
    })

    test('should prioritize cf-connecting-ip over other headers', () => {
      const request = new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '1.2.3.4',
          'x-real-ip': '5.6.7.8',
          'x-forwarded-for': '9.10.11.12',
        },
      })

      expect(getClientIP(request)).toBe('1.2.3.4')
    })

    test('should return unknown when no IP headers present', () => {
      const request = new Request('http://localhost')
      expect(getClientIP(request)).toBe('unknown')
    })
  })

  describe('createRateLimitResponse', () => {
    test('should create proper rate limit response', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
      }
      const config = { maxAttempts: 5, windowMs: 60000 }

      const response = createRateLimitResponse(result, config)

      expect(response.status).toBe(429)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('Retry-After')).toBe('60')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
    })

    test('should include proper headers without retry-after when allowed', () => {
      const result = {
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 60000,
      }
      const config = { maxAttempts: 5, windowMs: 60000 }

      const response = createRateLimitResponse(result, config)

      expect(response.status).toBe(429) // Still 429 since this is an error response
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('2')
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('Retry-After')).toBeNull()
    })

    test('should include error message in response body', async () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 30,
      }
      const config = { maxAttempts: 5, windowMs: 60000 }

      const response = createRateLimitResponse(result, config)
      const body = await response.json()

      expect(body.error).toBe('Too many requests')
      expect(body.message).toContain('Try again in 30 seconds')
    })
  })

  describe('RATE_LIMITS configuration', () => {
    test('should have proper admin login limits', () => {
      expect(RATE_LIMITS.ADMIN_LOGIN.maxAttempts).toBe(5)
      expect(RATE_LIMITS.ADMIN_LOGIN.windowMs).toBe(15 * 60 * 1000) // 15 minutes
      expect(RATE_LIMITS.ADMIN_LOGIN.blockDurationMs).toBe(15 * 60 * 1000) // 15 minutes
    })

    test('should have proper admin actions limits', () => {
      expect(RATE_LIMITS.ADMIN_ACTIONS.maxAttempts).toBe(5)
      expect(RATE_LIMITS.ADMIN_ACTIONS.windowMs).toBe(15 * 60 * 1000) // 15 minutes
      expect(RATE_LIMITS.ADMIN_ACTIONS.blockDurationMs).toBe(15 * 60 * 1000) // 15 minutes
    })

    test('should have proper user registration limits', () => {
      expect(RATE_LIMITS.USER_REGISTRATION.maxAttempts).toBe(5)
      expect(RATE_LIMITS.USER_REGISTRATION.windowMs).toBe(15 * 60 * 1000) // 15 minutes
      expect(RATE_LIMITS.USER_REGISTRATION.blockDurationMs).toBe(15 * 60 * 1000) // 15 minutes
    })
  })

  describe('memory cleanup', () => {
    test('should clean up old entries automatically', () => {
      const oldId = getUniqueId()
      const newId = getUniqueId()
      const config: RateLimitConfig = { maxAttempts: 5, windowMs: 60000 }

      // Create an entry
      checkRateLimit(oldId, config)

      // Advance time by more than 10 minutes (cleanup interval)
      vi.advanceTimersByTime(11 * 60 * 1000)

      // Trigger cleanup by making a new request
      checkRateLimit(newId, config)

      // The old entry should be cleaned up, so new request to old-ip should start fresh
      const result = checkRateLimit(oldId, config)
      expect(result.remaining).toBe(4) // Fresh start
    })
  })

  describe('test environment bypass', () => {
    const testConfig: RateLimitConfig = {
      maxAttempts: 1,
      windowMs: 60000,
      blockDurationMs: 120000,
    }

    test('should bypass rate limiting when NODE_ENV is test', () => {
      vi.stubEnv('NODE_ENV', 'test')

      const testId = getUniqueId()
      const localhostRequest = new Request('http://localhost:5173/test')

      // Make multiple requests - should all be allowed
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(testId, testConfig, localhostRequest)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(0) // maxAttempts - 1
      }
    })

    test('should bypass rate limiting when PLAYWRIGHT is true', () => {
      vi.stubEnv('PLAYWRIGHT', 'true')

      const testId = getUniqueId()
      const localhostRequest = new Request('http://localhost:5173/test')

      // Make multiple requests - should all be allowed
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(testId, testConfig, localhostRequest)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(0) // maxAttempts - 1
      }
    })

    test('should bypass rate limiting with x-test-bypass header', () => {
      const request = new Request('http://localhost:5173/test', {
        headers: { 'x-test-bypass': 'true' },
      })

      const testId = getUniqueId()

      // Make multiple requests - should all be allowed
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(testId, testConfig, request)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(0) // maxAttempts - 1
      }
    })

    test('should not bypass without test header', () => {
      const request = new Request('http://example.com', {
        headers: { 'x-other-header': 'value' },
      })

      const testId = getUniqueId()

      // First request should be allowed
      let result = checkRateLimit(testId, testConfig, request)
      expect(result.allowed).toBe(true)

      // Second request should be blocked (maxAttempts is 1)
      result = checkRateLimit(testId, testConfig, request)
      expect(result.allowed).toBe(false)
    })
  })
})
