import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  isRateLimitResponse,
  withAdminRateLimit,
  withAdminSensitiveRateLimit,
} from '../adminMiddleware.server'
import * as rateLimitModule from '../rateLimit.server'

// Mock the rate limit module
vi.mock('../rateLimit.server', () => ({
  checkRateLimit: vi.fn(),
  createRateLimitResponse: vi.fn(),
  getClientIP: vi.fn(),
  RATE_LIMITS: {
    ADMIN_ACTIONS: {
      maxAttempts: 30,
      windowMs: 5 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    },
  },
}))

const mockCheckRateLimit = vi.mocked(rateLimitModule.checkRateLimit)
const mockCreateRateLimitResponse = vi.mocked(rateLimitModule.createRateLimitResponse)
const mockGetClientIP = vi.mocked(rateLimitModule.getClientIP)

describe('adminMiddleware.server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClientIP.mockReturnValue('192.168.1.1')
  })

  describe('withAdminRateLimit', () => {
    test('should call handler when rate limit allows request', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ success: true })
      const request = new Request('http://localhost/admin/test')

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 5,
        resetTime: Date.now() + 60000,
      })

      const result = await withAdminRateLimit(request, mockHandler)

      expect(mockGetClientIP).toHaveBeenCalledWith(request)
      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'admin:192.168.1.1',
        rateLimitModule.RATE_LIMITS.ADMIN_ACTIONS
      )
      expect(mockHandler).toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    test('should return rate limit response when blocked', async () => {
      const mockHandler = vi.fn()
      const request = new Request('http://localhost/admin/test')
      const mockRateLimitResponse = new Response('Rate limited', { status: 429 })

      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
      })
      mockCreateRateLimitResponse.mockReturnValue(mockRateLimitResponse)

      const result = await withAdminRateLimit(request, mockHandler)

      expect(mockGetClientIP).toHaveBeenCalledWith(request)
      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'admin:192.168.1.1',
        rateLimitModule.RATE_LIMITS.ADMIN_ACTIONS
      )
      expect(mockCreateRateLimitResponse).toHaveBeenCalled()
      expect(mockHandler).not.toHaveBeenCalled()
      expect(result).toBe(mockRateLimitResponse)
    })

    test('should handle async handlers', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ result: 'test' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
      const request = new Request('http://localhost/admin/test')

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 10,
        resetTime: Date.now() + 60000,
      })

      const result = await withAdminRateLimit(request, mockHandler)

      expect(mockHandler).toHaveBeenCalled()
      expect(result).toBeInstanceOf(Response)

      const response = result as Response
      const responseBody = await response.json()
      expect(responseBody).toEqual({ result: 'test' })
    })

    test('should handle sync handlers', async () => {
      const mockHandler = vi.fn().mockReturnValue({ immediate: 'result' })
      const request = new Request('http://localhost/admin/test')

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 15,
        resetTime: Date.now() + 60000,
      })

      const result = await withAdminRateLimit(request, mockHandler)

      expect(mockHandler).toHaveBeenCalled()
      expect(result).toEqual({ immediate: 'result' })
    })

    test('should handle handler errors', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Handler failed'))
      const request = new Request('http://localhost/admin/test')

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 5,
        resetTime: Date.now() + 60000,
      })

      await expect(withAdminRateLimit(request, mockHandler)).rejects.toThrow(
        'Handler failed'
      )
    })
  })

  describe('withAdminSensitiveRateLimit', () => {
    test('should use sensitive rate limits configuration', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ success: true })
      const request = new Request('http://localhost/admin/sensitive')

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 8,
        resetTime: Date.now() + 60000,
      })

      await withAdminSensitiveRateLimit(request, mockHandler)

      expect(mockCheckRateLimit).toHaveBeenCalledWith('admin-sensitive:192.168.1.1', {
        maxAttempts: 10,
        windowMs: 5 * 60 * 1000,
        blockDurationMs: 15 * 60 * 1000,
      })
      expect(mockHandler).toHaveBeenCalled()
    })

    test('should block sensitive operations when rate limited', async () => {
      const mockHandler = vi.fn()
      const request = new Request('http://localhost/admin/sensitive')
      const mockRateLimitResponse = new Response('Rate limited', { status: 429 })

      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 900, // 15 minutes
      })
      mockCreateRateLimitResponse.mockReturnValue(mockRateLimitResponse)

      const result = await withAdminSensitiveRateLimit(request, mockHandler)

      expect(mockCheckRateLimit).toHaveBeenCalledWith('admin-sensitive:192.168.1.1', {
        maxAttempts: 10,
        windowMs: 5 * 60 * 1000,
        blockDurationMs: 15 * 60 * 1000,
      })
      expect(mockHandler).not.toHaveBeenCalled()
      expect(result).toBe(mockRateLimitResponse)
    })

    test('should handle different IP addresses separately', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ success: true })
      const request1 = new Request('http://localhost/admin/sensitive')
      const request2 = new Request('http://localhost/admin/sensitive')

      mockGetClientIP
        .mockReturnValueOnce('192.168.1.1')
        .mockReturnValueOnce('192.168.1.2')

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      })

      await withAdminSensitiveRateLimit(request1, mockHandler)
      await withAdminSensitiveRateLimit(request2, mockHandler)

      expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
        1,
        'admin-sensitive:192.168.1.1',
        expect.any(Object)
      )
      expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
        2,
        'admin-sensitive:192.168.1.2',
        expect.any(Object)
      )
    })
  })

  describe('isRateLimitResponse', () => {
    test('should return true for 429 Response', () => {
      const response = new Response('Rate limited', { status: 429 })
      expect(isRateLimitResponse(response)).toBe(true)
    })

    test('should return false for non-429 Response', () => {
      const response = new Response('OK', { status: 200 })
      expect(isRateLimitResponse(response)).toBe(false)
    })

    test('should return false for non-Response objects', () => {
      expect(isRateLimitResponse({ content: 'test' })).toBe(false)
      expect(isRateLimitResponse('string')).toBe(false)
      expect(isRateLimitResponse(null)).toBe(false)
      expect(isRateLimitResponse(undefined)).toBe(false)
      expect(isRateLimitResponse(123)).toBe(false)
    })

    test('should return false for Response-like objects', () => {
      const fakeResponse = {
        status: 429,
        headers: new Headers(),
        json: () => Promise.resolve({}),
      }
      expect(isRateLimitResponse(fakeResponse)).toBe(false)
    })
  })

  describe('IP address handling', () => {
    test('should use correct IP prefixes for different middleware types', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ success: true })
      const request = new Request('http://localhost/admin/test')

      mockGetClientIP.mockReturnValue('203.0.113.1')
      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 5,
        resetTime: Date.now() + 60000,
      })

      // Test regular admin middleware
      await withAdminRateLimit(request, mockHandler)
      expect(mockCheckRateLimit).toHaveBeenLastCalledWith(
        'admin:203.0.113.1',
        expect.any(Object)
      )

      // Test sensitive admin middleware
      await withAdminSensitiveRateLimit(request, mockHandler)
      expect(mockCheckRateLimit).toHaveBeenLastCalledWith(
        'admin-sensitive:203.0.113.1',
        expect.any(Object)
      )
    })

    test('should handle unknown IP addresses', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ success: true })
      const request = new Request('http://localhost/admin/test')

      mockGetClientIP.mockReturnValue('unknown')
      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 5,
        resetTime: Date.now() + 60000,
      })

      await withAdminRateLimit(request, mockHandler)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'admin:unknown',
        expect.any(Object)
      )
    })
  })
})
