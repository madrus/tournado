interface RateLimitAttempt {
  count: number
  firstAttempt: number
  lastAttempt: number
}

// In-memory store for rate limiting attempts
const attempts = new Map<string, RateLimitAttempt>()

// Clean up old entries every 10 minutes
setInterval(
  () => {
    const now = Date.now()
    const tenMinutesAgo = now - 10 * 60 * 1000

    for (const [key, attempt] of attempts.entries()) {
      if (attempt.lastAttempt < tenMinutesAgo) {
        attempts.delete(key)
      }
    }
  },
  10 * 60 * 1000
)

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const attempt = attempts.get(identifier)

  // If no previous attempts, allow and record
  if (!attempt) {
    attempts.set(identifier, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    })

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    }
  }

  // Check if window has expired
  const windowStart = now - config.windowMs
  if (attempt.firstAttempt < windowStart) {
    // Reset the window
    attempts.set(identifier, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    })

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    }
  }

  // Check if we're in a block period
  const blockDuration = config.blockDurationMs || config.windowMs
  if (attempt.count >= config.maxAttempts) {
    const blockUntil = attempt.lastAttempt + blockDuration
    if (now < blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockUntil,
        retryAfter: Math.ceil((blockUntil - now) / 1000),
      }
    }

    // Block period expired, reset
    attempts.set(identifier, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    })

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    }
  }

  // Increment attempt count
  attempt.count++
  attempt.lastAttempt = now
  attempts.set(identifier, attempt)

  const remaining = Math.max(0, config.maxAttempts - attempt.count)

  return {
    allowed: remaining > 0,
    remaining,
    resetTime: attempt.firstAttempt + config.windowMs,
    retryAfter: remaining === 0 ? Math.ceil(blockDuration / 1000) : undefined,
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check common headers for real IP (from proxies, load balancers)
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (cfConnectingIP) return cfConnectingIP
  if (xRealIP) return xRealIP
  if (xForwardedFor) {
    // x-forwarded-for can be a comma-separated list
    return xForwardedFor.split(',')[0].trim()
  }

  // Fallback to connection info (may not be available in all environments)
  return 'unknown'
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  ADMIN_LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block after limit
  },
  ADMIN_ACTIONS: {
    maxAttempts: 30,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 10 * 60 * 1000, // 10 minutes block
  },
  USER_REGISTRATION: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours block
  },
} as const

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = new Headers({
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  })

  if (result.retryAfter) {
    headers.set('Retry-After', String(result.retryAfter))
  }

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. ${result.retryAfter ? `Try again in ${result.retryAfter} seconds.` : 'Please try again later.'}`,
    }),
    {
      status: 429,
      headers: {
        ...Object.fromEntries(headers),
        'Content-Type': 'application/json',
      },
    }
  )
}
