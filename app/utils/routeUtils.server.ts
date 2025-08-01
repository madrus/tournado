import { redirect } from 'react-router'

import type { User } from '~/models/user.server'

import type { RouteMetadata } from './routeTypes'

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
 * Maps route metadata roles to Prisma Role enum values
 */
function mapRouteRoleToPrismaRole(role: string): string {
  const roleMapping: Record<string, string> = {
    admin: 'ADMIN',
    manager: 'MANAGER',
    referee: 'REFEREE',
    visitor: 'PUBLIC',
  }

  return roleMapping[role] || role.toUpperCase()
}

/**
 * Checks if user has any of the required roles
 */
function userHasRequiredRole(user: User, requiredRoles: string[]): boolean {
  const userRole = user.role
  const mappedRequiredRoles = requiredRoles.map(mapRouteRoleToPrismaRole)

  return mappedRequiredRoles.includes(userRole)
}

/**
 * Utility to require authentication and return user
 * Enhanced version of the original requireUser with route metadata support
 */
export async function requireUserWithMetadata(
  request: Request,
  routeMetadata?: RouteMetadata
): Promise<User> {
  const { getUser } = await import('./session.server')
  const user = await getUser(request)

  // Check authentication
  if (!user) {
    const url = new URL(request.url)
    const redirectTo = `${url.pathname}${url.search}`
    const redirectUrl = routeMetadata?.auth?.redirectTo || '/auth/signin'
    throw redirect(`${redirectUrl}?redirectTo=${encodeURIComponent(redirectTo)}`)
  }

  // Check authorization if required roles are specified
  if (routeMetadata?.authorization?.requiredRoles) {
    const { requiredRoles, redirectTo = '/unauthorized' } = routeMetadata.authorization

    if (!userHasRequiredRole(user, requiredRoles)) {
      throw redirect(redirectTo)
    }
  }

  return user
}
