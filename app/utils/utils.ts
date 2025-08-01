import { useMemo } from 'react'
import { useMatches } from 'react-router'

import type { User } from '~/models/user.server'

const DEFAULT_REDIRECT = '/'

/**
 * Converts FormData values to strings for redirect purposes.
 * FormData can contain File objects, but redirects should only be strings.
 */
function toRedirectString(
  value: FormDataEntryValue | string | null | undefined
): string | null {
  if (value == null) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
  }
  // FormDataEntryValue can be File, but redirects should only be strings
  return null
}

/**
 * Checks if a redirect path is safe (prevents open-redirect vulnerabilities)
 */
const isValidRedirectPath = (path: string): boolean =>
  path.startsWith('/') && !path.startsWith('//')

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our signin/signup pages). This avoids
 * open-redirect vulnerabilities.
 * TODO: the two overloads can be omited later if no usage expects
 *       only string or only null
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: null
): string | null
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect?: string
): string
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string | null = DEFAULT_REDIRECT
): string | null {
  const redirectPath = toRedirectString(to)

  if (!redirectPath || !isValidRedirectPath(redirectPath)) {
    return defaultRedirect
  }

  return redirectPath
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

export function useOptionalUser(): User | null {
  const useData = useMatchesData('root')
  if (!useData || !isUser(useData.user)) {
    return null
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

// More comprehensive email validation regex
// This regex validates:
// - Local part: alphanumeric, dots, hyphens, underscores, plus signs
// - @ symbol (required)
// - Domain: alphanumeric with hyphens (but not at start/end)
// - At least one dot in domain
// - TLD: at least 2 characters, letters only
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const validateEmail = (email: unknown): email is string =>
  typeof email === 'string' && EMAIL_REGEX.test(email)

export const capitalize = <T extends string>(str: T): Capitalize<Lowercase<T>> => {
  if (!str) return '' as Capitalize<Lowercase<T>>
  return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) as Capitalize<
    Lowercase<T>
  >
}
