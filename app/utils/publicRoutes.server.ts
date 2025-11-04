/**
 * Determines whether the provided pathname should be treated as public.
 * Exported separately to avoid circular dependencies between route/session utils.
 */
export async function isPublicRoute(pathname: string): Promise<boolean> {
  // Always make these routes public regardless of metadata
  const alwaysPublicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]

  if (
    alwaysPublicRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return true
  }

  const knownPublicRoutes = ['/', '/teams', '/about']

  if (
    knownPublicRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return true
  }

  return false
}
