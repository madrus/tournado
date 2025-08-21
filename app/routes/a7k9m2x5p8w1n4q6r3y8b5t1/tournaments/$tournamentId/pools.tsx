import { JSX } from 'react'
import { Outlet } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'

/**
 * Pools layout route for tournament pool management.
 * Provides consistent styling and behavior for all pool-related child routes.
 */
export default function PoolsLayout(): JSX.Element {
  return <Outlet />
}

export { AuthErrorBoundary as ErrorBoundary }
