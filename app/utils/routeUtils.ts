import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatches } from 'react-router'

import type { User } from '~/models/user.server'

import type { RouteMetadata } from './routeTypes'

const DEFAULT_REDIRECT = '/'

/**
 * Converts FormData values to strings for redirect purposes.
 * FormData can contain File objects, but redirects should only be strings.
 */
function toRedirectString(
	value: FormDataEntryValue | string | null | undefined,
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
	defaultRedirect: null,
): string | null
export function safeRedirect(
	to: FormDataEntryValue | string | null | undefined,
	defaultRedirect?: string,
): string
export function safeRedirect(
	to: FormDataEntryValue | string | null | undefined,
	defaultRedirect: string | null = DEFAULT_REDIRECT,
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
		() => matchingRoutes.find((r) => r.id === id),
		[matchingRoutes, id],
	)
	return route?.data as Record<string, unknown>
}

const isUser = (user: unknown): user is User =>
	user != null &&
	typeof user === 'object' &&
	'email' in user &&
	typeof user.email === 'string'

/**
 * Hook that gets the current user from the root route data
 * Returns null if user data is not available or invalid
 *
 * Note: Uses try-catch to handle test environments where router context
 * may not be available. This is intentional for utility hook flexibility.
 */
export function useUser(): User | null {
	try {
		// biome-ignore lint/correctness/useHookAtTopLevel: utility hook needs fallback for test environments without data router
		const useData = useMatchesData('root')
		if (!useData || !isUser(useData.user)) {
			return null
		}
		return useData.user
	} catch {
		// Fallback for test environments without data router context
		return null
	}
}

export const capitalize = <T extends string>(str: T): Capitalize<Lowercase<T>> => {
	if (!str) return '' as Capitalize<Lowercase<T>>
	return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) as Capitalize<
		Lowercase<T>
	>
}

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
			.find((match) => match.handle && (match.handle as RouteMetadata).title)

		if (matchWithTitle?.handle) {
			const titleKey = (matchWithTitle.handle as RouteMetadata).title as string
			return t(titleKey)
		}

		// Return empty string if no title is found in any matched route
		return ''
	}, [matches, t])
}
