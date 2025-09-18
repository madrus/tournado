/**
 * RBAC Middleware for Route Protection
 *
 * Provides middleware functions for role-based access control in route loaders and actions.
 * Integrates with the existing RBAC system and rate limiting.
 */
import { redirect } from 'react-router'

import type { User } from '@prisma/client'

import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIP,
  RATE_LIMITS,
} from './rateLimit.server'
import type { Permission } from './rbac'
import { getUserRole, hasPermission } from './rbac'
import { getUser } from './session.server'

/**
 * Enhanced route protection with RBAC permissions
 * Replaces the old admin-only middleware approach
 */
export async function requireUserWithPermission(
  request: Request,
  permission: Permission,
  options?: {
    redirectTo?: string
    allowSelfAccess?: boolean
    userIdParam?: string // For routes like /profile/:userId - allow user to access their own
    params?: Record<string, string | undefined> // Route params from loader
  }
): Promise<User> {
  const user = await getUser(request)

  // Check authentication first
  if (!user) {
    const url = new URL(request.url)
    const redirectTo = `${url.pathname}${url.search}`
    const redirectUrl = options?.redirectTo || '/auth/signin'
    throw redirect(`${redirectUrl}?redirectTo=${encodeURIComponent(redirectTo)}`)
  }

  // Handle self-access for routes like profile management
  if (options?.allowSelfAccess && options?.userIdParam && options?.params) {
    // Use the route params directly instead of parsing URL
    const paramName = options.userIdParam.replace(':', '')
    const targetUserId = options.params[paramName]

    if (targetUserId && targetUserId === user.id) {
      return user // User can access their own resources
    }
  }

  // Check permission
  if (!hasPermission(user, permission)) {
    throw redirect('/unauthorized')
  }

  return user
}

/**
 * Require admin panel access (ADMIN, MANAGER, or REFEREE roles)
 * Allows access to the admin interface with role-based navigation filtering
 */
export async function requireAdminUser(
  request: Request,
  redirectTo = '/unauthorized'
): Promise<User> {
  const user = await getUser(request)

  if (!user) {
    const url = new URL(request.url)
    const redirectToParam = `${url.pathname}${url.search}`
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(redirectToParam)}`)
  }

  const role = getUserRole(user)
  const canAccessAdminPanel =
    role === 'ADMIN' ||
    role === 'MANAGER' ||
    role === 'EDITOR' ||
    role === 'BILLING' ||
    role === 'REFEREE'

  if (!canAccessAdminPanel) {
    throw redirect(redirectTo)
  }

  return user
}

/**
 * Get user role for redirect logic
 * Returns role or null if not authenticated
 */
export async function getUserRoleForRedirect(request: Request): Promise<{
  user: User | null
  role: string
  isAuthenticated: boolean
}> {
  const user = await getUser(request)
  const role = getUserRole(user)

  return {
    user,
    role,
    isAuthenticated: !!user,
  }
}

/**
 * Role-based redirect after authentication
 * Determines appropriate landing page based on user role
 */
export function getPostAuthRedirect(
  user: User | null,
  defaultRedirect?: string
): string {
  if (!user) {
    return defaultRedirect || '/teams'
  }

  const role = getUserRole(user)

  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
    case 'EDITOR':
    case 'BILLING':
    case 'REFEREE':
      // Admin panel access for ADMIN, MANAGER, EDITOR, BILLING, and REFEREE users
      return '/a7k9m2x5p8w1n4q6r3y8b5t1'

    case 'PUBLIC':
    default:
      // Public users go to teams page
      return '/teams'
  }
}

/**
 * RBAC-aware rate limiting check
 * Applies different rate limits based on user role
 */
export async function checkRoleBasedRateLimit(
  request: Request,
  action: string
): Promise<void> {
  const { user } = await getUserRoleForRedirect(request)
  const role = getUserRole(user)

  // Create key based on user ID or IP
  const clientIP = getClientIP(request)
  const key = user?.id ? `${action}:user:${user.id}` : `${action}:ip:${clientIP}`

  // Use appropriate rate limit based on role
  if (role === 'ADMIN' || role === 'MANAGER') {
    const rateLimitResult = checkRateLimit(key, RATE_LIMITS.ADMIN_ACTIONS, request)
    if (!rateLimitResult.allowed) {
      throw createRateLimitResponse(rateLimitResult, RATE_LIMITS.ADMIN_ACTIONS)
    }
  } else {
    // For REFEREE and PUBLIC users, use standard limits
    const rateLimitResult = checkRateLimit(key, RATE_LIMITS.USER_REGISTRATION, request)
    if (!rateLimitResult.allowed) {
      throw createRateLimitResponse(rateLimitResult, RATE_LIMITS.USER_REGISTRATION)
    }
  }
}

/**
 * Permission-based action wrapper
 * For protecting form actions with specific permissions
 */
export const withPermissionCheck =
  (
    handler: (args: { request: Request }, user: { user: User }) => unknown,
    permission: Permission
  ) =>
  async (args: { request: Request }): Promise<unknown> => {
    const user = await requireUserWithPermission(args.request, permission)
    return handler(args, { user })
  }

/**
 * Legacy compatibility wrapper
 * Gradually replace withAdminRateLimit calls with this
 */
export const withAdminPermissionCheck = (
  handler: (args: { request: Request }, user: { user: User }) => unknown,
  permission: Permission = 'tournaments:manage' // Default to high-level admin permission
): ((args: { request: Request }) => Promise<unknown>) =>
  withPermissionCheck(handler, permission)
