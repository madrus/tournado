import { JSX } from 'react'
import { Outlet } from 'react-router'

import { TournamentsLayoutHeader } from '~/features/tournaments/components/TournamentsLayoutHeader'
import type { RouteMetadata } from '~/utils/routeTypes'

// Route metadata - requires tournaments read permission
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin', 'manager'],
    redirectTo: '/unauthorized',
  },
}

export default function AdminTournamentsLayout(): JSX.Element {
  return (
    <div className='space-y-8' data-testid='admin-tournaments-layout-container'>
      <TournamentsLayoutHeader variant='admin' />
      <Outlet />
    </div>
  )
}
