import { useMatches } from '@remix-run/react'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { RouteMetadata } from './route-types'

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
