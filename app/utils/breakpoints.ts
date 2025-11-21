/**
 * Breakpoint constants for responsive design
 *
 * These values align with Tailwind CSS breakpoints for consistency
 * across the application.
 */

/**
 * Mobile breakpoint - matches Tailwind's `md` breakpoint
 * Used for bottom navigation visibility and mobile-specific behavior
 */
export const MOBILE_BREAKPOINT = 767

/**
 * Desktop breakpoint - matches Tailwind's `lg` breakpoint
 * Used for scroll direction detection and layout changes
 */
export const DESKTOP_BREAKPOINT = 1024

/**
 * Breakpoint utilities for consistent media query usage
 */
export const breakpoints = {
	mobile: MOBILE_BREAKPOINT,
	desktop: DESKTOP_BREAKPOINT,

	/**
	 * Check if current viewport is mobile
	 */
	isMobile: () => {
		if (typeof window === 'undefined') return false
		return window.innerWidth < DESKTOP_BREAKPOINT
	},

	/**
	 * Check if bottom navigation should be visible
	 */
	showBottomNav: () => {
		if (typeof window === 'undefined') return false
		return window.innerWidth <= MOBILE_BREAKPOINT
	},

	/**
	 * Media query strings for CSS/JS usage
	 */
	queries: {
		mobile: `(max-width: ${MOBILE_BREAKPOINT}px)`,
		desktop: `(min-width: ${DESKTOP_BREAKPOINT}px)`,
	},
} as const

/**
 * Type definitions for breakpoint keys
 */
export type BreakpointKey = keyof typeof breakpoints.queries
