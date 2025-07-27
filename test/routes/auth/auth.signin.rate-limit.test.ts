import type { ActionFunctionArgs } from 'react-router'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { action } from '~/routes/auth/auth.signin'
import * as rateLimitModule from '~/utils/rateLimit.server'

// Mock the rate limit module
vi.mock('~/utils/rateLimit.server', () => ({
  checkRateLimit: vi.fn(),
  createRateLimitResponse: vi.fn(),
  getClientIP: vi.fn(),
  RATE_LIMITS: {
    ADMIN_LOGIN: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    },
  },
}))

// Mock other dependencies
vi.mock('~/models/user.server', () => ({
  verifySignin: vi.fn(),
}))

vi.mock('~/utils/session.server', () => ({
  createUserSession: vi.fn(),
  getUser: vi.fn(),
}))

vi.mock('~/utils/utils', () => ({
  validateEmail: vi.fn(),
}))

const mockCheckRateLimit = vi.mocked(rateLimitModule.checkRateLimit)
const mockCreateRateLimitResponse = vi.mocked(rateLimitModule.createRateLimitResponse)
const mockGetClientIP = vi.mocked(rateLimitModule.getClientIP)

describe('auth.signin rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientIP.mockReturnValue('192.168.1.100')
  })

  test('should apply rate limiting before processing form data', async () => {
    const formData = new FormData()
    formData.append('email', 'admin@example.com')
    formData.append('password', 'password123')

    const request = new Request('http://localhost/auth/signin', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Forwarded-For': '192.168.1.100',
      },
    })

    // Mock rate limit to allow request
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 900000, // 15 minutes
    })

    // The action should proceed (though it will fail due to mocked dependencies)
    try {
      await action({ request } as ActionFunctionArgs)
    } catch {
      // Expected to fail due to mocked dependencies, but rate limiting should have been checked
    }

    expect(mockGetClientIP).toHaveBeenCalledWith(request)
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      'login:192.168.1.100',
      rateLimitModule.RATE_LIMITS.ADMIN_LOGIN
    )
  })

  test('should return rate limit response when blocked', async () => {
    const formData = new FormData()
    formData.append('email', 'admin@example.com')
    formData.append('password', 'password123')

    const request = new Request('http://localhost/auth/signin', {
      method: 'POST',
      body: formData,
    })

    const mockRateLimitResponse = new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Try again in 1800 seconds.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '1800',
          'X-RateLimit-Remaining': '0',
        },
      }
    )

    // Mock rate limit to block request
    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 1800000, // 30 minutes
      retryAfter: 1800,
    })
    mockCreateRateLimitResponse.mockReturnValue(mockRateLimitResponse)

    const response = await action({ request } as ActionFunctionArgs)

    expect(mockGetClientIP).toHaveBeenCalledWith(request)
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      'login:192.168.1.100',
      rateLimitModule.RATE_LIMITS.ADMIN_LOGIN
    )
    expect(mockCreateRateLimitResponse).toHaveBeenCalledWith({
      allowed: false,
      remaining: 0,
      resetTime: expect.any(Number),
      retryAfter: 1800,
    })
    expect(response).toBe(mockRateLimitResponse)
  })

  test('should use correct rate limit configuration for login', async () => {
    const request = new Request('http://localhost/auth/signin', {
      method: 'POST',
      body: new FormData(),
    })

    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 1800000,
      retryAfter: 1800,
    })
    mockCreateRateLimitResponse.mockReturnValue(
      new Response('Rate limited', { status: 429 })
    )

    await action({ request } as ActionFunctionArgs)

    expect(mockCheckRateLimit).toHaveBeenCalledWith('login:192.168.1.100', {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000, // 30 minutes
    })
  })

  test('should handle different IP addresses separately', async () => {
    const formData = new FormData()
    formData.append('email', 'admin@example.com')
    formData.append('password', 'password123')

    // First request from IP 1
    const request1 = new Request('http://localhost/auth/signin', {
      method: 'POST',
      body: formData,
      headers: { 'X-Forwarded-For': '192.168.1.1' },
    })

    // Second request from IP 2
    const request2 = new Request('http://localhost/auth/signin', {
      method: 'POST',
      body: formData,
      headers: { 'X-Forwarded-For': '192.168.1.2' },
    })

    mockGetClientIP
      .mockReturnValueOnce('192.168.1.1')
      .mockReturnValueOnce('192.168.1.2')

    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 1800000,
      retryAfter: 1800,
    })
    mockCreateRateLimitResponse.mockReturnValue(
      new Response('Rate limited', { status: 429 })
    )

    await action({ request: request1 } as ActionFunctionArgs)
    await action({ request: request2 } as ActionFunctionArgs)

    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
      1,
      'login:192.168.1.1',
      expect.any(Object)
    )
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
      2,
      'login:192.168.1.2',
      expect.any(Object)
    )
  })

  test('should handle missing form data gracefully with rate limiting', async () => {
    const request = new Request('http://localhost/auth/signin', {
      method: 'POST',
      body: new FormData(), // Empty form data
    })

    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 900000,
    })

    // Should still check rate limiting even with invalid form data
    try {
      await action({ request } as ActionFunctionArgs)
    } catch {
      // Expected to fail due to mocked dependencies
    }

    expect(mockCheckRateLimit).toHaveBeenCalled()
  })

  test('should preserve rate limit headers in response', async () => {
    const request = new Request('http://localhost/auth/signin', {
      method: 'POST',
      body: new FormData(),
    })

    const expectedHeaders = {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil((Date.now() + 900000) / 1000)),
      'Retry-After': '1800',
    }

    const mockRateLimitResponse = new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: expectedHeaders,
      }
    )

    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 900000,
      retryAfter: 1800,
    })
    mockCreateRateLimitResponse.mockReturnValue(mockRateLimitResponse)

    const response = await action({ request } as ActionFunctionArgs)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('1800')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  describe('IP extraction integration', () => {
    test('should work with CloudFlare headers', async () => {
      const request = new Request('http://localhost/auth/signin', {
        method: 'POST',
        body: new FormData(),
        headers: {
          'CF-Connecting-IP': '203.0.113.1',
        },
      })

      mockGetClientIP.mockReturnValue('203.0.113.1')
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 1800000,
        retryAfter: 1800,
      })
      mockCreateRateLimitResponse.mockReturnValue(
        new Response('Rate limited', { status: 429 })
      )

      await action({ request } as ActionFunctionArgs)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'login:203.0.113.1',
        expect.any(Object)
      )
    })

    test('should work with proxy headers', async () => {
      const request = new Request('http://localhost/auth/signin', {
        method: 'POST',
        body: new FormData(),
        headers: {
          'X-Forwarded-For': '198.51.100.1, 203.0.113.1',
        },
      })

      mockGetClientIP.mockReturnValue('198.51.100.1')
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 1800000,
        retryAfter: 1800,
      })
      mockCreateRateLimitResponse.mockReturnValue(
        new Response('Rate limited', { status: 429 })
      )

      await action({ request } as ActionFunctionArgs)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'login:198.51.100.1',
        expect.any(Object)
      )
    })

    test('should handle unknown IP addresses', async () => {
      const request = new Request('http://localhost/auth/signin', {
        method: 'POST',
        body: new FormData(),
        // No IP headers
      })

      mockGetClientIP.mockReturnValue('unknown')
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 1800000,
        retryAfter: 1800,
      })
      mockCreateRateLimitResponse.mockReturnValue(
        new Response('Rate limited', { status: 429 })
      )

      await action({ request } as ActionFunctionArgs)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'login:unknown',
        expect.any(Object)
      )
    })
  })
})
