import { JSX } from 'react'
import { Outlet } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'

/**
 * Groups layout route for tournament group management.
 * Provides consistent styling and behavior for all group-related child routes.
 */
export default function GroupsLayout(): JSX.Element {
  return <Outlet />
}

export { AuthErrorBoundary as ErrorBoundary }
