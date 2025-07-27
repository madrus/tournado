import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIP,
  RATE_LIMITS,
} from './rateLimit.server'

/**
 * Rate limiting middleware for admin routes
 * Use this in your admin route actions/loaders
 */
export async function withAdminRateLimit<T>(
  request: Request,
  handler: () => Promise<T> | T
): Promise<T | Response> {
  const clientIP = getClientIP(request)
  const rateLimitResult = checkRateLimit(`admin:${clientIP}`, RATE_LIMITS.ADMIN_ACTIONS)

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult)
  }

  return handler()
}

/**
 * More restrictive rate limiting for sensitive admin operations
 * (user management, data deletion, etc.)
 */
export async function withAdminSensitiveRateLimit<T>(
  request: Request,
  handler: () => Promise<T> | T
): Promise<T | Response> {
  const clientIP = getClientIP(request)
  const rateLimitResult = checkRateLimit(`admin-sensitive:${clientIP}`, {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block
  })

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult)
  }

  return handler()
}

/**
 * Helper to check if response is a rate limit response
 */
export const isRateLimitResponse = (response: unknown): response is Response =>
  response instanceof Response && response.status === 429
