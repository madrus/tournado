import { JSX } from 'react'
import { Outlet } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'

/**
 * Admin layout route for authenticated admin pages.
 * Provides consistent styling and admin-specific behavior for all child routes.
 */
export default function AdminLayout(): JSX.Element {
  return <Outlet />
}

export { AuthErrorBoundary as ErrorBoundary }
