/**
 * Prefetching configuration types and utilities for React Router v7
 */

export type PrefetchStrategy = 'none' | 'intent' | 'render' | 'viewport'

/**
 * Prefetch configuration for different types of navigation
 */
export type PrefetchConfig = {
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
 * Detect if we're running in a test environment
 * Supports both Vitest and Playwright test environments
 */
function isTestEnvironment(): boolean {
	// Check for Node.js test environment
	if (typeof process !== 'undefined') {
		// Vitest sets NODE_ENV to 'test'
		if (process.env.NODE_ENV === 'test') return true

		// Playwright tests run with custom headers
		if (process.env.PLAYWRIGHT === 'true') return true

		// MSW mock server indicates test environment
		if (process.env.MSW_MODE === 'test') return true
	}

	// Check for browser test environment
	if (typeof window !== 'undefined') {
		// Playwright sets custom headers that we can detect
		const userAgent = navigator.userAgent || ''
		if (userAgent.includes('Playwright')) return true

		// Check for test-specific markers in URL or global variables
		if (window.location?.hostname === 'localhost' && window.location?.port) {
			// Common test ports
			const testPorts = ['8811', '3000', '5173']
			if (testPorts.includes(window.location.port)) {
				// Additional check for test headers via fetch interception
				const acceptLanguage = document.querySelector('html')?.getAttribute('lang')
				if (acceptLanguage === 'nl') return true // Playwright sets Dutch as primary language
			}
		}
	}

	return false
}

/**
 * Default prefetch configuration optimized for performance and UX
 */
export const defaultPrefetchConfig: PrefetchConfig = {
	// Primary navigation: Prefetch on hover/focus for instant navigation
	primaryNavigation: isTestEnvironment() ? 'none' : 'intent',

	// Secondary navigation: Prefetch on hover for supporting navigation
	secondaryNavigation: isTestEnvironment() ? 'none' : 'intent',

	// Action buttons: Disable in tests to reduce network noise
	actionButtons: isTestEnvironment() ? 'none' : 'render',

	// List items: Disable in tests to reduce network noise
	listItems: isTestEnvironment() ? 'none' : 'intent',

	// Pagination: Disable in tests to reduce network noise
	pagination: isTestEnvironment() ? 'none' : 'render',

	// Error page links: Disable in tests to reduce network noise
	errorPageLinks: isTestEnvironment() ? 'none' : 'render',
}

/**
 * Route-specific prefetch overrides for high-traffic or critical routes
 * Disabled in test environments to reduce network load
 */
export const routePrefetchOverrides: Record<string, PrefetchStrategy> =
	isTestEnvironment()
		? {} // No overrides in test environment
		: {
				// Home page CTA should prefetch teams immediately
				'/teams': 'render',

				// Profile and settings accessed frequently after login
				'/profile': 'intent',
				'/settings': 'intent',

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
	config: PrefetchConfig = defaultPrefetchConfig,
): PrefetchStrategy {
	// In test environment, always return 'none' to minimize network requests
	if (isTestEnvironment()) {
		return 'none'
	}

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
	},
): PrefetchStrategy {
	// Always disable in test environment
	if (isTestEnvironment()) {
		return 'none'
	}

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
