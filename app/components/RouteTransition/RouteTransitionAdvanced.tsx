import { type JSX, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { cn } from '~/utils/misc'
import {
  type TransitionStage,
  type TransitionWithDurationProps,
  getTransitionClassesForStage,
} from './utils'

// Advanced transition with slide effects
export function RouteTransitionAdvanced({
  duration = 300,
  className = '',
}: Readonly<TransitionWithDurationProps>): JSX.Element {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState<TransitionStage>('stable')

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
    }
    if (transitionStage === 'entering') {
      const timer = setTimeout(() => {
        setTransitionStage('stable')
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [transitionStage, location, duration])

  return (
    <div
      className={cn(
        'transition-all ease-in-out',
        getTransitionClassesForStage(transitionStage),
        className,
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
      key={displayLocation.key}
    >
      <Outlet context={{ location: displayLocation }} />
    </div>
  )
}
