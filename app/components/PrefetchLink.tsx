import type { JSX } from 'react'
import { Link, type LinkProps, NavLink, type NavLinkProps } from 'react-router'

import {
	getAdaptivePrefetchStrategy,
	getPrefetchStrategy,
	type PrefetchConfig,
	type PrefetchStrategy,
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
 * Enhanced Link component with intelligent prefetching
 */
type PrefetchLinkProps = Omit<LinkProps, 'prefetch'> & {
	/**
	 * Context for determining prefetch strategy
	 */
	prefetchContext?: keyof PrefetchConfig

	/**
	 * Override prefetch strategy
	 */
	prefetch?: PrefetchStrategy

	/**
	 * Whether to use adaptive prefetching based on network conditions
	 */
	adaptive?: boolean
}

export function PrefetchLink({
	to,
	prefetchContext = 'secondaryNavigation',
	prefetch: overridePrefetch,
	adaptive = true,
	...linkProps
}: PrefetchLinkProps): JSX.Element {
	const route = typeof to === 'string' ? to : to.pathname || ''

	// Determine prefetch strategy
	let prefetchStrategy = overridePrefetch || getPrefetchStrategy(route, prefetchContext)

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

	return <Link to={to} prefetch={prefetchStrategy} {...linkProps} />
}

/**
 * Enhanced NavLink component with intelligent prefetching
 */
type PrefetchNavLinkProps = Omit<NavLinkProps, 'prefetch'> & {
	/**
	 * Context for determining prefetch strategy
	 */
	prefetchContext?: keyof PrefetchConfig

	/**
	 * Override prefetch strategy
	 */
	prefetch?: PrefetchStrategy

	/**
	 * Whether to use adaptive prefetching based on network conditions
	 */
	adaptive?: boolean
}

export function PrefetchNavLink({
	to,
	prefetchContext = 'primaryNavigation',
	prefetch: overridePrefetch,
	adaptive = true,
	...navLinkProps
}: PrefetchNavLinkProps): JSX.Element {
	const route = typeof to === 'string' ? to : to.pathname || ''

	// Determine prefetch strategy
	let prefetchStrategy = overridePrefetch || getPrefetchStrategy(route, prefetchContext)

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

	return <NavLink to={to} prefetch={prefetchStrategy} {...navLinkProps} />
}

/**
 * Specialized Link components for common use cases
 */

// Primary navigation links (main menu items)
export const PrimaryNavLink = (
	props: Omit<PrefetchLinkProps, 'prefetchContext'>,
): JSX.Element => <PrefetchLink prefetchContext='primaryNavigation' {...props} />

// Action buttons and CTAs
export const ActionLink = (
	props: Omit<PrefetchLinkProps, 'prefetchContext'>,
): JSX.Element => <PrefetchLink prefetchContext='actionButtons' {...props} />

// List item links (in teams, users, etc.)
export const ListItemLink = (
	props: Omit<PrefetchLinkProps, 'prefetchContext'>,
): JSX.Element => <PrefetchLink prefetchContext='listItems' {...props} />

// Error page recovery links
export const ErrorRecoveryLink = (
	props: Omit<PrefetchLinkProps, 'prefetchContext'>,
): JSX.Element => <PrefetchLink prefetchContext='errorPageLinks' {...props} />

// List item navigation links
export const ListItemNavLink = (
	props: Omit<PrefetchNavLinkProps, 'prefetchContext'>,
): JSX.Element => <PrefetchNavLink prefetchContext='listItems' {...props} />
