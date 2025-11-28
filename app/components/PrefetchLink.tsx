import type { JSX } from 'react'
import { Link, type LinkProps, NavLink, type NavLinkProps } from 'react-router'

import { usePrefetchStrategy } from '~/hooks/usePrefetchStrategy'
import type { PrefetchConfig, PrefetchStrategy } from '~/utils/prefetchTypes'

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
}: Readonly<PrefetchLinkProps>): JSX.Element {
	const prefetchStrategy = usePrefetchStrategy(
		to,
		prefetchContext,
		overridePrefetch,
		adaptive,
	)

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
}: Readonly<PrefetchNavLinkProps>): JSX.Element {
	const prefetchStrategy = usePrefetchStrategy(
		to,
		prefetchContext,
		overridePrefetch,
		adaptive,
	)

	return <NavLink to={to} prefetch={prefetchStrategy} {...navLinkProps} />
}

/**
 * Specialized Link components for common use cases
 */

// Primary navigation links (main menu items)
export const PrimaryNavLink = (
	props: Readonly<Omit<PrefetchLinkProps, 'prefetchContext'>>,
): JSX.Element => <PrefetchLink prefetchContext='primaryNavigation' {...props} />

// Action buttons and CTAs
export const ActionLink = (
	props: Readonly<Omit<PrefetchLinkProps, 'prefetchContext'>>,
): JSX.Element => <PrefetchLink prefetchContext='actionButtons' {...props} />

// List item links (in teams, users, etc.)
export const ListItemLink = (
	props: Readonly<Omit<PrefetchLinkProps, 'prefetchContext'>>,
): JSX.Element => <PrefetchLink prefetchContext='listItems' {...props} />

// Error page recovery links
export const ErrorRecoveryLink = (
	props: Readonly<Omit<PrefetchLinkProps, 'prefetchContext'>>,
): JSX.Element => <PrefetchLink prefetchContext='errorPageLinks' {...props} />

// List item navigation links
export const ListItemNavLink = (
	props: Readonly<Omit<PrefetchNavLinkProps, 'prefetchContext'>>,
): JSX.Element => <PrefetchNavLink prefetchContext='listItems' {...props} />
