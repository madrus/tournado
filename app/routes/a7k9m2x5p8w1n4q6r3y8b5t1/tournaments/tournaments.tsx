import { JSX } from 'react'
import { Outlet } from 'react-router'

import { TournamentsLayoutHeader } from '~/features/tournaments/components/TournamentsLayoutHeader'
import type { RouteMetadata } from '~/utils/routeTypes'

// Route metadata - requires tournaments read permission
export const handle: RouteMetadata = {
  isPublic: false,
  title: 'common.titles.tournaments',
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['ADMIN', 'MANAGER'],
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
