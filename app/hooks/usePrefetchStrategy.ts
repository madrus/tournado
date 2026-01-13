import { useMemo } from 'react'
import type { LinkProps, NavLinkProps } from 'react-router'
import {
	type PrefetchConfig,
	type PrefetchStrategy,
	getAdaptivePrefetchStrategy,
	getPrefetchStrategy,
} from '~/utils/prefetchTypes'

// Type definition for Network Information API
type NetworkInformation = {
	effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
	saveData?: boolean
}

type NavigatorWithConnection = Navigator & {
	connection?: NetworkInformation
}

/**
 * Hook to compute prefetch strategy based on route, context, and network conditions
 *
 * @param to - The destination route (string or route object)
 * @param prefetchContext - The context to determine base prefetch strategy
 * @param overridePrefetch - Optional override for prefetch strategy
 * @param adaptive - Whether to apply adaptive prefetching based on network conditions
 * @returns The computed prefetch strategy
 */
export function usePrefetchStrategy(
	to: LinkProps['to'] | NavLinkProps['to'],
	prefetchContext: keyof PrefetchConfig,
	overridePrefetch?: PrefetchStrategy,
	adaptive = true,
): PrefetchStrategy {
	return useMemo(() => {
		const route = typeof to === 'string' ? to : to.pathname || ''

		// Determine base prefetch strategy
		let prefetchStrategy =
			overridePrefetch || getPrefetchStrategy(route, prefetchContext)

		// Apply adaptive prefetching if enabled
		if (adaptive && typeof window !== 'undefined') {
			const nav = navigator as NavigatorWithConnection
			const networkContext = {
				isSlowConnection:
					nav.connection?.effectiveType === 'slow-2g' ||
					nav.connection?.effectiveType === '2g',
				isLowDataMode: nav.connection?.saveData,
				isMobile: window.innerWidth < 768,
			}

			prefetchStrategy = getAdaptivePrefetchStrategy(prefetchStrategy, networkContext)
		}

		return prefetchStrategy
	}, [to, prefetchContext, overridePrefetch, adaptive])
}
