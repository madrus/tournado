import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatches } from 'react-router'

import type { RouteMetadata } from './route-types'

/**
 * Normalizes a pathname by removing trailing slashes, except for root path.
 * Handles edge cases for robust route matching in navigation components.
 *
 * @param path - The pathname to normalize
 * @returns Normalized pathname without trailing slash (except root)
 *
 * @example
 * ```ts
 * normalizePathname('/about/') // returns '/about'
 * normalizePathname('/about')  // returns '/about'
 * normalizePathname('/')       // returns '/' (root preserved)
 * normalizePathname('')        // returns '/' (empty becomes root)
 * ```
 */
export function normalizePathname(path: string): string {
  // Handle empty string or whitespace - default to root
  if (!path || !path.trim()) return '/'

  // Remove trailing slash, but preserve root path
  const normalized = path.replace(/\/$/, '')

  // If we removed the only slash (root path), return it
  return normalized || '/'
}

/**
 * Gets the page title for the current route
 * Searches through the matched routes from most specific to least specific
 * to find a title in their metadata
 */
export function usePageTitle(): string {
  const matches = useMatches()
  const { t } = useTranslation()

  return useMemo(() => {
    if (!matches.length) return ''

    // Find the first match with a title, starting from the most specific (end of array)
    const matchWithTitle = [...matches]
      .reverse()
      .find(match => match.handle && (match.handle as RouteMetadata).title)

    if (matchWithTitle?.handle) {
      const titleKey = (matchWithTitle.handle as RouteMetadata).title as string
      return t(titleKey)
    }

    // Return empty string if no title is found in any matched route
    return ''
  }, [matches, t])
}
