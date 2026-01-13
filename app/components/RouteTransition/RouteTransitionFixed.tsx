import { type JSX, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import {
	type TransitionStage,
	type TransitionWithDurationProps,
	getOpacityForStage,
} from './utils'

// Fixed JavaScript-controlled transition
export function RouteTransitionFixed({
	duration = 300,
	className = '',
}: Readonly<TransitionWithDurationProps>): JSX.Element {
	const location = useLocation()
	const [displayLocation, setDisplayLocation] = useState(location)
	const [transitionStage, setTransitionStage] = useState<TransitionStage>('stable')

	useEffect(() => {
		if (location.key !== displayLocation.key) {
			// Start the exit transition
			setTransitionStage('exiting')
		}
	}, [location.key, displayLocation.key])

	useEffect(() => {
		if (transitionStage === 'exiting') {
			const timer = setTimeout(() => {
				// Switch to new location and start enter transition
				setDisplayLocation(location)
				setTransitionStage('entering')
			}, duration)

			return () => clearTimeout(timer)
		}
		if (transitionStage === 'entering') {
			const timer = setTimeout(() => {
				// Transition complete
				setTransitionStage('stable')
			}, duration)

			return () => clearTimeout(timer)
		}
	}, [transitionStage, location, duration])

	return (
		<div
			className={`transition-opacity ease-in-out ${className}`}
			style={{
				opacity: getOpacityForStage(transitionStage),
				transitionDuration: `${duration}ms`,
			}}
			key={displayLocation.key} // Force re-render when location changes
		>
			<Outlet context={{ location: displayLocation }} />
		</div>
	)
}
