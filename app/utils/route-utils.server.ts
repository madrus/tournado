/**
 * A server-side utility to determine if a route is public
 * Note: This is a simplified example and would need additional development
 * to handle nested routes, dynamic route segments, etc.
 */
export async function isPublicRoute(pathname: string): Promise<boolean> {
  // Always make these routes public regardless of metadata
  const alwaysPublicRoutes = ['/signin', '/join', '/forgot-password', '/reset-password']

  // Check if it's in our always-public list
  if (
    alwaysPublicRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return true
  }

  // Additional known public routes (based on existing route metadata)
  const knownPublicRoutes = ['/', '/teams']

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
