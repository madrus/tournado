import { redirect } from 'react-router'
import type { User } from '~/models/user.server'
import type { RouteMetadata } from './routeTypes'
import { getUser } from './session.server'

export { isPublicRoute } from './publicRoutes.server'

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
  routeMetadata?: RouteMetadata,
): Promise<User> {
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
