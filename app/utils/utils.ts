import { useMemo } from 'react'
import { useMatches } from 'react-router'

import type { User } from '~/models/user.server'

const DEFAULT_REDIRECT = '/'

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our signin/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string | null} [defaultRedirect='/'] The redirect to use if the `to`
 *   value is unsafe. Pass `null` to receive `null` for unsafe values.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string | null = DEFAULT_REDIRECT
): string | null {
  const fallback = defaultRedirect

  if (!to || typeof to !== 'string' || to.trim() === '') {
    return fallback
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return fallback
  }

  return to
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find(r => r.id === id),
    [matchingRoutes, id]
  )
  return route?.data as Record<string, unknown>
}

const isUser = (user: unknown): user is User =>
  user != null &&
  typeof user === 'object' &&
  'email' in user &&
  typeof user.email === 'string'

export function useOptionalUser(): User | undefined {
  const useData = useMatchesData('root')
  if (!useData || !isUser(useData.user)) {
    return undefined
  }
  return useData.user
}

export function useUser(): User {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.'
    )
  }
  return maybeUser
}

export const validateEmail = (email: unknown): email is string =>
  typeof email === 'string' && email.length > 3 && email.includes('@')

export const capitalize = <T extends string>(str: T): Capitalize<Lowercase<T>> => {
  if (!str) return '' as Capitalize<Lowercase<T>>
  return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) as Capitalize<
    Lowercase<T>
  >
}
