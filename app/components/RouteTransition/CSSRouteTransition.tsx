import type { JSX } from 'react'
import { Outlet, useLocation } from 'react-router'

import type { BaseTransitionProps } from './utils'

// CSS-based transition (lightest approach)
export function CSSRouteTransition({
	className = '',
}: Readonly<BaseTransitionProps>): JSX.Element {
	const location = useLocation()

	return (
		<div className={`route-fade-container ${className}`} key={location.pathname}>
			<Outlet />
		</div>
	)
}
