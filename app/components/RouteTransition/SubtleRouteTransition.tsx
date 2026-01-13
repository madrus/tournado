import type { JSX } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useReducedMotion } from '~/hooks/useReducedMotion'
import type { TransitionWithDurationProps } from './utils'

// Ultra-simple: Just a subtle slide-in effect on route changes
export function SubtleRouteTransition({
  className = '',
  duration = 300,
}: Readonly<TransitionWithDurationProps>): JSX.Element {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className={className} key={location.pathname}>
        <Outlet />
      </div>
    )
  }

  return (
    <div
      className={`animate-slideIn ${className}`}
      key={location.pathname} // This triggers the CSS animation on route changes
      style={{
        animationDuration: `${duration}ms`,
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both',
      }}
    >
      <Outlet />
    </div>
  )
}
