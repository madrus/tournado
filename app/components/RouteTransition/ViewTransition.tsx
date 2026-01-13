import { type JSX, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import type { BaseTransitionProps } from './utils'

// Alternative: View Transition API approach (modern browsers)
export function ViewTransition({
	className = '',
}: Readonly<BaseTransitionProps>): JSX.Element {
	const location = useLocation()

	// biome-ignore lint/correctness/useExhaustiveDependencies: location.key is sufficient to trigger on route changes
	useEffect(() => {
		// Use the modern View Transition API if available
		if ('startViewTransition' in document) {
			const documentWithTransition = document as Document & {
				startViewTransition: (updateCallback: () => void) => void
			}
			documentWithTransition.startViewTransition(() => {
				// The route change will happen automatically via React Router
			})
		}
	}, [location.key])

	return (
		<div className={className}>
			<Outlet />
		</div>
	)
}
