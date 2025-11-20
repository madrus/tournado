/**
 * Layout and styling constants used across the application
 * Ensures consistent spacing and alignment between components
 */

// Horizontal padding/margins for main content areas - responsive three-tier system
export const CONTENT_PX = 'px-4 md:px-8 lg:px-16' // 8px mobile, 32px tablet, 64px desktop

// Container constraints
export const CONTENT_MIN_WIDTH = 'min-w-[320px]'
export const CONTENT_MAX_WIDTH = 'max-w-7xl' // Prevent content stretching on large screens
export const STATS_PANEL_MIN_WIDTH = 'min-w-full md:min-w-[500px]' // Full width on mobile, 500px minimum on tablet and up

// Common layout classes that should be used consistently
export const CONTENT_CONTAINER_CLASSES = `mx-auto ${CONTENT_MIN_WIDTH} ${CONTENT_MAX_WIDTH} ${CONTENT_PX}`

// Form input spacing
/**
 * Consistent spacing between input field labels and inputs
 * Based on the checkbox field spacing which provides optimal visual hierarchy
 */
export const INPUT_LABEL_SPACING = 'mb-2' as const

/**
 * Fixed width container for status icons in form fields
 * Ensures consistent alignment and prevents layout shifts
 */
export const STATUS_ICON_CONTAINER_WIDTH = 'w-6 flex-shrink-0' as const

/**
 * Tailwind breakpoints (matching Tailwind's default breakpoints)
 * Use these constants to ensure JavaScript breakpoint checks match CSS media queries
 */
export const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Check if current viewport matches or exceeds a Tailwind breakpoint
 * @param breakpoint - The breakpoint to check (e.g., 'lg')
 * @returns true if viewport width >= breakpoint width
 * @example
 * if (isBreakpoint('lg')) {
 *   // Desktop logic (>= 1024px)
 * }
 */
export function isBreakpoint(breakpoint: Breakpoint): boolean {
	if (typeof window === 'undefined') return false
	return window.innerWidth >= BREAKPOINTS[breakpoint]
}
