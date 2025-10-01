import { JSX } from 'react'
import { Outlet } from 'react-router'

import { Role } from '@prisma/client'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { requireUserWithRole } from '~/utils/session.server'

import type { Route } from './+types/a7k9m2x5p8w1n4q6r3y8b5t1'

/**
/**
 * Admin loader - ensures only users with non-PUBLIC roles can access admin panel
 */
export async function loader({
  request,
}: Route.LoaderArgs): Promise<Record<string, never>> {
  // Only allow users with roles other than PUBLIC to access admin panel
  const allowedRoles = [
    Role.ADMIN,
    Role.MANAGER,
    Role.EDITOR,
    Role.BILLING,
    Role.REFEREE,
  ]
  await requireUserWithRole(request, allowedRoles)
  return {} satisfies Record<string, never>
}

/**
 * Admin layout route for authenticated admin pages.
 * Provides consistent styling and admin-specific behavior for all child routes.
 */
export default function AdminLayout(): JSX.Element {
  return <Outlet />
}

export { AuthErrorBoundary as ErrorBoundary }
