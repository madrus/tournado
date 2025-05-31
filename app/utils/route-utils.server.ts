import { redirect } from 'react-router'

import type { User } from '~/models/user.server'

import type { RouteMetadata } from './route-types'
import { getUser } from './session.server'

/**
 * A server-side utility to determine if a route is public
 * Note: This is a simplified example and would need additional development
 * to handle nested routes, dynamic route segments, etc.
 */
export async function isPublicRoute(pathname: string): Promise<boolean> {
  // Always make these routes public regardless of metadata
  const alwaysPublicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]

  // Check if it's in our always-public list
  if (
    alwaysPublicRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return true
  }

  // Additional known public routes (based on existing route metadata)
  const knownPublicRoutes = ['/', '/teams', '/about']

  // Check known public routes
  if (
    knownPublicRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return true
  }

  // Default to not public for unknown routes
  return false
}

/**
 * Enhanced route protection utility that enforces route-level security
 */
export async function enforceRouteProtection(
  request: Request,
  routeMetadata?: RouteMetadata
): Promise<User | null> {
  // If no metadata provided, assume route is protected
  if (!routeMetadata) {
    const user = await getUser(request)
    if (!user) {
      const url = new URL(request.url)
      const redirectTo = `${url.pathname}${url.search}`
      throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`)
    }
    return user
  }

  // If route is public, no protection needed
  if (routeMetadata.isPublic) {
    return await getUser(request) // Still return user if available
  }

  // Get current user
  const user = await getUser(request)

  // Check authentication requirements
  const authRequired = routeMetadata.auth?.required ?? !routeMetadata.isPublic
  if (authRequired && !user) {
    const url = new URL(request.url)
    const currentPath = `${url.pathname}${url.search}`
    const preserveRedirect = routeMetadata.auth?.preserveRedirect ?? true
    const redirectPath = routeMetadata.auth?.redirectTo ?? '/auth/signin'

    const redirectUrl = preserveRedirect
      ? `${redirectPath}?redirectTo=${encodeURIComponent(currentPath)}`
      : redirectPath

    throw redirect(redirectUrl)
  }

  // Check role-based authorization
  if (user && routeMetadata.authorization?.requiredRoles) {
    const hasRequiredRole = checkUserRoles(
      user,
      routeMetadata.authorization.requiredRoles,
      routeMetadata.authorization.roleMatchMode ?? 'any'
    )

    if (!hasRequiredRole) {
      const unauthorizedRedirect =
        routeMetadata.authorization.redirectTo ?? '/unauthorized'
      throw redirect(unauthorizedRedirect)
    }
  }

  // Run custom protection check if provided
  if (routeMetadata.protection?.customCheck) {
    const customResult = await routeMetadata.protection.customCheck(request, user)
    if (customResult === false) {
      throw redirect('/unauthorized')
    } else if (customResult instanceof Response) {
      throw customResult
    }
  }

  return user
}

/**
 * Check if user has required roles
 */
function checkUserRoles(
  user: User,
  requiredRoles: string[],
  mode: 'all' | 'any' = 'any'
): boolean {
  // TODO: Implement actual role checking based on your User model
  // For now, this is a placeholder implementation

  // Example implementation (you'll need to adjust based on your User model):
  const userRoles = getUserRoles(user)

  if (mode === 'all') {
    return requiredRoles.every(role => userRoles.includes(role))
  } else {
    return requiredRoles.some(role => userRoles.includes(role))
  }
}

/**
 * Get user roles from user object
 * TODO: Implement based on your actual User model structure
 */
const getUserRoles = (
  _user: User
): string[] => // Placeholder implementation - adjust based on your User model
  // Examples:
  // return user.roles.map(role => role.name)
  // return [user.role]
  // return user.permissions || []

  // For now, return a default role for authenticated users
  ['participant']

/**
 * Utility to require authentication and return user
 * Enhanced version of the original requireUser with route metadata support
 */
export async function requireUserWithMetadata(
  request: Request,
  routeMetadata?: RouteMetadata
): Promise<User> {
  const user = await enforceRouteProtection(request, routeMetadata)

  if (!user) {
    // This should not happen if enforceRouteProtection is working correctly
    // but adding as a safety net
    const url = new URL(request.url)
    const redirectTo = `${url.pathname}${url.search}`
    throw redirect(`/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`)
  }

  return user
}

/**
 * Create an unauthorized route for handling authorization failures
 */
export const createUnauthorizedResponse = (message?: string): Response =>
  new Response(message || 'Unauthorized', {
    status: 403,
    statusText: 'Forbidden',
  })
