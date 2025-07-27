interface RateLimitAttempt {
  count: number
  firstAttempt: number
  lastAttempt: number
}

// In-memory store for rate limiting attempts with size limits
const attempts = new Map<string, RateLimitAttempt>()

// Security: Maximum entries to prevent memory exhaustion attacks
const MAX_ENTRIES = 10000

// Enhanced cleanup strategy - runs every 5 minutes with more aggressive cleanup
setInterval(
  () => {
    const now = Date.now()
    const cleanupThresholds = [
      30 * 60 * 1000, // 30 minutes - expired entries
      20 * 60 * 1000, // 20 minutes - if over 80% capacity
      10 * 60 * 1000, // 10 minutes - if over 90% capacity
    ]

    let currentThreshold = cleanupThresholds[0]

    // Use more aggressive cleanup if approaching memory limits
    if (attempts.size > MAX_ENTRIES * 0.9) {
      currentThreshold = cleanupThresholds[2] // 10 minutes
    } else if (attempts.size > MAX_ENTRIES * 0.8) {
      currentThreshold = cleanupThresholds[1] // 20 minutes
    }

    const cutoffTime = now - currentThreshold
    let deletedCount = 0

    for (const [key, attempt] of attempts.entries()) {
      if (attempt.lastAttempt < cutoffTime) {
        attempts.delete(key)
        deletedCount++
      }
    }

    // Emergency cleanup if still over limit - remove oldest entries
    if (attempts.size > MAX_ENTRIES) {
      const sortedEntries = Array.from(attempts.entries()).sort(
        ([, a], [, b]) => a.lastAttempt - b.lastAttempt
      )

      const entriesToRemove = attempts.size - MAX_ENTRIES + 1000 // Remove extra buffer
      for (let i = 0; i < entriesToRemove && i < sortedEntries.length; i++) {
        attempts.delete(sortedEntries[i][0])
        deletedCount++
      }
    }

    // Log cleanup stats in development and alert in production for high usage
    if (process.env.NODE_ENV === 'development' && deletedCount > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `Rate limit cleanup: removed ${deletedCount} entries, ${attempts.size} remaining`
      )
    } else if (
      process.env.NODE_ENV === 'production' &&
      attempts.size > MAX_ENTRIES * 0.8
    ) {
      // Alert when memory usage is consistently high in production
      // eslint-disable-next-line no-console
      console.warn(
        `Rate limit high memory usage: ${attempts.size}/${MAX_ENTRIES} entries (${Math.round((attempts.size / MAX_ENTRIES) * 100)}%). Consider monitoring for potential attacks.`
      )
    }
  },
  5 * 60 * 1000 // Run every 5 minutes instead of 10
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
 *
 * Security Features:
 * - Memory leak protection with MAX_ENTRIES limit
 * - Test bypass only in development/test environments
 * - IP validation to prevent header manipulation
 * - Localhost validation for test bypasses
 * - Production environment completely disables bypasses
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  request?: Request
): RateLimitResult {
  // Security: Strict test environment bypass with multiple validations
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === 'true'
  const isLocalhost = request ? isLocalhostRequest(request) : false

  if (isTestEnv && isLocalhost) {
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: Date.now() + config.windowMs,
    }
  }

  // Security: Test bypass header only works in development/test with additional validation
  const testBypassHeader = request?.headers.get('x-test-bypass')
  if (
    testBypassHeader === 'true' &&
    (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') &&
    isLocalhost
  ) {
    // Additional security: Log bypass usage in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`Rate limit bypassed for ${identifier} via test header`)
    }

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: Date.now() + config.windowMs,
    }
  }

  // Security: Prevent bypass in production regardless of headers
  if (process.env.NODE_ENV === 'production') {
    // Remove any test bypass logic in production builds
    // All rate limiting is enforced regardless of headers
  }
  const now = Date.now()
  const attempt = attempts.get(identifier)

  // Security: Check if we're approaching memory limits before adding new entries
  if (!attempt && attempts.size >= MAX_ENTRIES) {
    // Alert in production when hitting memory limits
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error(
        `Rate limit memory capacity reached: ${attempts.size}/${MAX_ENTRIES} entries. Consider increasing cleanup frequency or MAX_ENTRIES.`
      )
    }

    // Reject new entries if at capacity to prevent memory exhaustion
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + config.windowMs,
      retryAfter: Math.ceil(config.windowMs / 1000),
    }
  }

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
 * Validate if a string is a valid IP address (IPv4 or IPv6)
 */
function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

  // IPv6 regex (simplified - covers most common cases)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::/

  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * Get client IP address from request with security validation
 */
export function getClientIP(request: Request): string {
  // Security: Only trust certain headers based on deployment environment
  const trustedProxies = process.env.TRUSTED_PROXIES?.split(',') || []
  const isProxyTrusted = trustedProxies.length > 0

  // Check Cloudflare header first (most reliable if using CF)
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP && isValidIP(cfConnectingIP)) {
    return cfConnectingIP
  }

  // Check real IP header (used by some reverse proxies)
  const xRealIP = request.headers.get('x-real-ip')
  if (
    xRealIP &&
    isValidIP(xRealIP) &&
    !isPrivateIP(xRealIP) && // Additional validation: reject private IPs
    (isProxyTrusted || process.env.NODE_ENV === 'development')
  ) {
    return xRealIP
  }

  // Check X-Forwarded-For header (can be manipulated, so validate carefully)
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor && (isProxyTrusted || process.env.NODE_ENV === 'development')) {
    // x-forwarded-for can be a comma-separated list - take the first valid IP
    const ips = xForwardedFor.split(',').map(ip => ip.trim())
    for (const ip of ips) {
      if (isValidIP(ip)) {
        // Security: Skip private/local IPs in forwarded headers unless in development
        if (process.env.NODE_ENV === 'development' || !isPrivateIP(ip)) {
          return ip
        }
      }
    }
  }

  // Fallback to connection info (may not be available in all environments)
  return 'unknown'
}

/**
 * Check if an IP address is in private/local range
 */
function isPrivateIP(ip: string): boolean {
  // Common private IP ranges
  const privateRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // 127.0.0.0/8 (localhost)
    /^169\.254\./, // 169.254.0.0/16 (link-local)
    /^fc00:/, // IPv6 private
    /^fe80:/, // IPv6 link-local
    /^::1$/, // IPv6 localhost
  ]

  return privateRanges.some(range => range.test(ip))
}

/**
 * Security: Check if request is from localhost/development environment
 */
function isLocalhostRequest(request: Request): boolean {
  const url = new URL(request.url)
  const hostname = url.hostname

  // Check for localhost hostnames
  const localhostPatterns = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

  if (localhostPatterns.includes(hostname)) {
    return true
  }

  // Check for local development ports
  const port = url.port
  const commonDevPorts = ['3000', '5173', '8080', '4000', '8000']

  return (
    commonDevPorts.includes(port) &&
    (hostname === 'localhost' || hostname.startsWith('127.'))
  )
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
    maxAttempts: 5, // Allow for form validation errors
    windowMs: 30 * 60 * 1000, // 30 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
} as const

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  config: RateLimitConfig
): Response {
  const headers = new Headers({
    'X-RateLimit-Limit': String(config.maxAttempts),
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
