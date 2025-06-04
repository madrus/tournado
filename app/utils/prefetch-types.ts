/**
 * Prefetching configuration types and utilities for React Router v7
 */

export type PrefetchStrategy = 'none' | 'intent' | 'render' | 'viewport'

/**
 * Prefetch configuration for different types of navigation
 */
export interface PrefetchConfig {
  /**
   * Strategy for primary navigation links (main menu, etc.)
   */
  primaryNavigation: PrefetchStrategy

  /**
   * Strategy for secondary navigation (breadcrumbs, related links)
   */
  secondaryNavigation: PrefetchStrategy

  /**
   * Strategy for action buttons (CTAs, form submissions)
   */
  actionButtons: PrefetchStrategy

  /**
   * Strategy for list items (team lists, user lists)
   */
  listItems: PrefetchStrategy

  /**
   * Strategy for pagination and infinite scroll
   */
  pagination: PrefetchStrategy

  /**
   * Strategy for error page links (back to home, etc.)
   */
  errorPageLinks: PrefetchStrategy
}

/**
 * Default prefetch configuration optimized for performance and UX
 */
export const defaultPrefetchConfig: PrefetchConfig = {
  // Primary navigation: Prefetch on hover/focus for instant navigation
  primaryNavigation: 'intent',

  // Secondary navigation: Prefetch on hover for supporting navigation
  secondaryNavigation: 'intent',

  // Action buttons: Prefetch immediately for critical user flows
  actionButtons: 'render',

  // List items: Prefetch on hover to avoid overwhelming the network
  listItems: 'intent',

  // Pagination: Prefetch immediately for smooth browsing
  pagination: 'render',

  // Error page links: Prefetch immediately to help users recover quickly
  errorPageLinks: 'render',
}

/**
 * Route-specific prefetch overrides for high-traffic or critical routes
 */
export const routePrefetchOverrides: Record<string, PrefetchStrategy> = {
  // Home page CTA should prefetch teams immediately
  '/teams': 'render',

  // Admin routes accessed frequently after login
  '/a7k9m2x5p8w1n4q6r3y8b5t1/profile': 'intent',
  '/a7k9m2x5p8w1n4q6r3y8b5t1/settings': 'intent',

  // Auth routes for quick access
  '/auth/signin': 'intent',
  '/auth/signup': 'intent',

  // Admin routes only when needed
  '/a7k9m2x5p8w1n4q6r3y8b5t1': 'intent',

  // About page - lower priority
  '/about': 'intent',
}

/**
 * Get the appropriate prefetch strategy for a given route and context
 */
export function getPrefetchStrategy(
  route: string,
  context: keyof PrefetchConfig,
  config: PrefetchConfig = defaultPrefetchConfig
): PrefetchStrategy {
  // Check for route-specific overrides first
  if (routePrefetchOverrides[route]) {
    return routePrefetchOverrides[route]
  }

  // Fall back to context-based strategy
  return config[context]
}

/**
 * Performance-aware prefetch strategy that considers user's network conditions
 */
export function getAdaptivePrefetchStrategy(
  baseStrategy: PrefetchStrategy,
  context?: {
    isSlowConnection?: boolean
    isLowDataMode?: boolean
    isMobile?: boolean
  }
): PrefetchStrategy {
  // Reduce prefetching on slow connections or low data mode
  if (context?.isSlowConnection || context?.isLowDataMode) {
    switch (baseStrategy) {
      case 'render':
        return 'intent'
      case 'intent':
        return 'intent' // Keep intent as it's user-initiated
      case 'viewport':
        return 'none'
      default:
        return baseStrategy
    }
  }

  // Reduce aggressive prefetching on mobile to save battery
  if (context?.isMobile && baseStrategy === 'render') {
    return 'intent'
  }

  return baseStrategy
}
