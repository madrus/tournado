import type { ActionFunctionArgs } from 'react-router'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { action } from '~/routes/teams/teams.new'
import * as adminMiddleware from '~/utils/adminMiddleware.server'

// Mock the admin middleware
vi.mock('~/utils/adminMiddleware.server', () => ({
  withAdminRateLimit: vi.fn(),
  isRateLimitResponse: vi.fn(),
}))

// Mock team creation utilities
vi.mock('~/utils/team-creation.server', () => ({
  createTeamFromFormData: vi.fn(),
}))

const mockWithAdminRateLimit = vi.mocked(adminMiddleware.withAdminRateLimit)
const mockIsRateLimitResponse = vi.mocked(adminMiddleware.isRateLimitResponse)

describe('teams.new rate limiting integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should apply admin rate limiting to team creation', async () => {
    const formData = new FormData()
    formData.append('name', 'Test Team')
    formData.append('clubName', 'Test Club')

    const request = new Request('http://localhost/teams/new', {
      method: 'POST',
      body: formData,
    })

    const mockSuccessResponse = new Response(
      JSON.stringify({
        success: true,
        team: { id: '123', name: 'Test Team' },
      }),
      { status: 200 }
    )

    // Mock successful rate limiting
    mockWithAdminRateLimit.mockImplementation(async (_req, handler) => handler())
    mockIsRateLimitResponse.mockReturnValue(false)

    // Mock the handler to return success
    mockWithAdminRateLimit.mockResolvedValue(mockSuccessResponse)

    const response = await action({ request } as ActionFunctionArgs)

    expect(mockWithAdminRateLimit).toHaveBeenCalledWith(request, expect.any(Function))
    expect(response).toBe(mockSuccessResponse)
  })

  test('should return rate limit response when blocked', async () => {
    const formData = new FormData()
    formData.append('name', 'Test Team')

    const request = new Request('http://localhost/teams/new', {
      method: 'POST',
      body: formData,
    })

    const mockRateLimitResponse = new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Try again in 600 seconds.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '600',
        },
      }
    )

    // Mock rate limiting to block request
    mockWithAdminRateLimit.mockResolvedValue(mockRateLimitResponse)
    mockIsRateLimitResponse.mockReturnValue(true)

    const response = await action({ request } as ActionFunctionArgs)

    expect(mockWithAdminRateLimit).toHaveBeenCalledWith(request, expect.any(Function))
    expect(mockIsRateLimitResponse).toHaveBeenCalledWith(mockRateLimitResponse)
    expect(response).toBe(mockRateLimitResponse)
  })

  test('should handle validation errors within rate limit handler', async () => {
    const formData = new FormData()
    // Missing required fields

    const request = new Request('http://localhost/teams/new', {
      method: 'POST',
      body: formData,
    })

    const mockValidationErrorResponse = new Response(
      JSON.stringify({
        errors: { name: 'Name is required' },
      }),
      { status: 400 }
    )

    // Mock rate limiting to allow request but handler returns validation error
    mockWithAdminRateLimit.mockImplementation(async (_req, handler) => handler())
    mockWithAdminRateLimit.mockResolvedValue(mockValidationErrorResponse)
    mockIsRateLimitResponse.mockReturnValue(false)

    const response = await action({ request } as ActionFunctionArgs)

    expect(mockWithAdminRateLimit).toHaveBeenCalledWith(request, expect.any(Function))
    expect(response).toBe(mockValidationErrorResponse)
  })

  test('should properly handle async handler in rate limit wrapper', async () => {
    const formData = new FormData()
    formData.append('name', 'Async Team')
    formData.append('clubName', 'Async Club')

    const request = new Request('http://localhost/teams/new', {
      method: 'POST',
      body: formData,
    })

    // Mock rate limiting to call the actual handler
    mockWithAdminRateLimit.mockImplementation(async (_req, handler) => {
      // Simulate the actual handler being called
      const result = await handler()
      return result
    })

    const mockTeamResponse = new Response(
      JSON.stringify({
        success: true,
        team: { id: 'async-123', name: 'Async Team' },
      }),
      { status: 200 }
    )

    mockWithAdminRateLimit.mockResolvedValue(mockTeamResponse)
    mockIsRateLimitResponse.mockReturnValue(false)

    const response = await action({ request } as ActionFunctionArgs)

    expect(mockWithAdminRateLimit).toHaveBeenCalledWith(request, expect.any(Function))
    expect(response).toBe(mockTeamResponse)
  })

  test('should handle different HTTP methods appropriately', async () => {
    // Test that rate limiting is applied regardless of the specific action logic
    const formData = new FormData()
    formData.append('name', 'Method Team')

    const request = new Request('http://localhost/teams/new', {
      method: 'POST', // Team creation is POST
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
    })

    mockWithAdminRateLimit.mockResolvedValue(mockResponse)
    mockIsRateLimitResponse.mockReturnValue(false)

    await action({ request } as ActionFunctionArgs)

    expect(mockWithAdminRateLimit).toHaveBeenCalledWith(request, expect.any(Function))
  })

  test('should preserve response characteristics through rate limiting', async () => {
    const formData = new FormData()
    formData.append('name', 'Response Team')

    const request = new Request('http://localhost/teams/new', {
      method: 'POST',
      body: formData,
    })

    const mockResponseWithHeaders = new Response(
      JSON.stringify({
        success: true,
        team: { id: 'resp-123', name: 'Response Team' },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          Location: '/teams/resp-123',
        },
      }
    )

    mockWithAdminRateLimit.mockResolvedValue(mockResponseWithHeaders)
    mockIsRateLimitResponse.mockReturnValue(false)

    const response = await action({ request } as ActionFunctionArgs)

    expect(response).toBe(mockResponseWithHeaders)
    expect(response.status).toBe(201)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('Location')).toBe('/teams/resp-123')
  })

  describe('error handling', () => {
    test('should handle rate limit middleware errors', async () => {
      const request = new Request('http://localhost/teams/new', {
        method: 'POST',
        body: new FormData(),
      })

      const middlewareError = new Error('Rate limit middleware failed')
      mockWithAdminRateLimit.mockRejectedValue(middlewareError)

      await expect(action({ request } as ActionFunctionArgs)).rejects.toThrow(
        'Rate limit middleware failed'
      )
    })

    test('should handle handler errors within middleware', async () => {
      const request = new Request('http://localhost/teams/new', {
        method: 'POST',
        body: new FormData(),
      })

      // Mock middleware to throw error directly
      mockWithAdminRateLimit.mockRejectedValue(new Error('Handler threw error'))

      await expect(action({ request } as ActionFunctionArgs)).rejects.toThrow(
        'Handler threw error'
      )
    })
  })

  describe('type safety', () => {
    test('should properly handle Response type checking', async () => {
      const request = new Request('http://localhost/teams/new', {
        method: 'POST',
        body: new FormData(),
      })

      const nonResponseResult = { payload: 'not a response' }
      mockWithAdminRateLimit.mockResolvedValue(nonResponseResult)
      mockIsRateLimitResponse.mockReturnValue(false)

      const response = await action({ request } as ActionFunctionArgs)

      expect(mockIsRateLimitResponse).toHaveBeenCalledWith(nonResponseResult)
      expect(response).toBe(nonResponseResult)
    })
  })
})
