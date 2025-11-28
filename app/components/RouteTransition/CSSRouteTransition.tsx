import { type JSX, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import type { BaseTransitionProps } from './utils'

// CSS-based transition (lightest approach)
export function CSSRouteTransition({
	className = '',
}: Readonly<BaseTransitionProps>): JSX.Element {
	const location = useLocation()
	const [locationKey, setLocationKey] = useState(location.pathname)

	useEffect(() => {
		if (location.pathname !== locationKey) {
			setLocationKey(location.pathname)
		}
	}, [location.pathname, locationKey])

	return (
		<div className={`route-fade-container ${className}`} key={locationKey}>
			<Outlet />
		</div>
	)
}
