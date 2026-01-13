import type { JSX } from 'react'
import { Outlet } from 'react-router'
import type { BaseTransitionProps } from './utils'

// No transition - just the outlet
export function NoTransition({
  className = '',
}: Readonly<BaseTransitionProps>): JSX.Element {
  return (
    <div className={className}>
      <Outlet />
    </div>
  )
}
