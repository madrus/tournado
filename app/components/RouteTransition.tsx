import { JSX, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import { useReducedMotion } from '~/hooks/useReducedMotion'

type RouteTransitionProps = {
  duration?: number // in milliseconds
  className?: string
  minOpacity?: number
}

// Ultra-simple: Just a subtle slide-in effect on route changes
export function SubtleRouteTransition({
  className = '',
  duration = 300,
}: {
  className?: string
  duration?: number
}): JSX.Element {
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

// Simple and effective transition for React Router 7
export function RouteTransition({
  duration = 300,
  className = '',
  minOpacity = 0.6,
}: RouteTransitionProps): JSX.Element {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Start transition on route change
    setIsTransitioning(true)

    // End transition after duration
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [location.pathname, duration])

  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${className}`}
      style={{
        opacity: isTransitioning ? minOpacity : 1,
      }}
    >
      <Outlet />
    </div>
  )
}

// Alternative: View Transition API approach (modern browsers)
export function ViewTransition({
  className = '',
}: {
  className?: string
}): JSX.Element {
  const location = useLocation()

  useEffect(() => {
    // Use the modern View Transition API if available
    if ('startViewTransition' in document) {
      const documentWithTransition = document as Document & {
        startViewTransition: (updateCallback: () => void) => void
      }
      documentWithTransition.startViewTransition(() => {
        // The route change will happen automatically
      })
    }
  }, [location.pathname])

  return (
    <div className={className}>
      <Outlet />
    </div>
  )
}

// CSS-based transition (lightest approach)
export function CSSRouteTransition({
  className = '',
}: {
  className?: string
}): JSX.Element {
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

// Fixed JavaScript-controlled transition
export function RouteTransitionFixed({
  duration = 300,
  className = '',
}: RouteTransitionProps): JSX.Element {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState<
    'stable' | 'exiting' | 'entering'
  >('stable')

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
    } else if (transitionStage === 'entering') {
      const timer = setTimeout(() => {
        // Transition complete
        setTransitionStage('stable')
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [transitionStage, location, duration])

  const getOpacity = () => {
    switch (transitionStage) {
      case 'exiting':
        return 0
      case 'entering':
        return 1
      case 'stable':
        return 1
      default:
        return 1
    }
  }

  return (
    <div
      className={`transition-opacity ease-in-out ${className}`}
      style={{
        opacity: getOpacity(),
        transitionDuration: `${duration}ms`,
      }}
      key={displayLocation.key} // Force re-render when location changes
    >
      <Outlet context={{ location: displayLocation }} />
    </div>
  )
}

// Advanced transition with slide effects
export function RouteTransitionAdvanced({
  duration = 300,
  className = '',
}: RouteTransitionProps): JSX.Element {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState<
    'stable' | 'exiting' | 'entering'
  >('stable')

  useEffect(() => {
    if (location.key !== displayLocation.key) {
      setTransitionStage('exiting')
    }
  }, [location.key, displayLocation.key])

  useEffect(() => {
    if (transitionStage === 'exiting') {
      const timer = setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('entering')
      }, duration)

      return () => clearTimeout(timer)
    } else if (transitionStage === 'entering') {
      const timer = setTimeout(() => {
        setTransitionStage('stable')
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [transitionStage, location, duration])

  const getTransitionClasses = () => {
    switch (transitionStage) {
      case 'exiting':
        return 'opacity-0 transform scale-95'
      case 'entering':
        return 'opacity-100 transform scale-100'
      case 'stable':
        return 'opacity-100 transform scale-100'
      default:
        return 'opacity-100 transform scale-100'
    }
  }

  return (
    <div
      className={`transition-all ease-in-out ${getTransitionClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
      }}
      key={displayLocation.key}
    >
      <Outlet context={{ location: displayLocation }} />
    </div>
  )
}

// No transition - just the outlet
export const NoTransition = ({
  className = '',
}: {
  className?: string
}): JSX.Element => (
  <div className={className}>
    <Outlet />
  </div>
)
