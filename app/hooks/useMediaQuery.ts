import { useEffect, useState } from 'react'

/**
 * Hook to track media query matches with proper cleanup and SSR support
 *
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const mediaQuery = window.matchMedia(query)
		setMatches(mediaQuery.matches)

		const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
		mediaQuery.addEventListener('change', handler)

		return () => mediaQuery.removeEventListener('change', handler)
	}, [query])

	return matches
}
