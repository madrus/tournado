import { type JSX, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import type { OpacityTransitionProps } from './utils'

// Simple and effective transition for React Router 7
export function RouteTransition({
  duration = 300,
  className = '',
  minOpacity = 0.6,
}: Readonly<OpacityTransitionProps>): JSX.Element {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: location.key is sufficient to trigger on route changes
  useEffect(() => {
    // Start transition on route change
    setIsTransitioning(true)

    // End transition after duration
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, location.key])

  return (
    <div
      className={`transition-opacity ease-in-out ${className}`}
      style={{
        opacity: isTransitioning ? minOpacity : 1,
        transitionDuration: `${duration}ms`,
      }}
    >
      <Outlet />
    </div>
  )
}
