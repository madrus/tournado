import { JSX } from 'react'
import { Outlet } from 'react-router'

import { TeamsLayoutHeader } from '~/components/layouts'
import type { RouteMetadata } from '~/utils/route-types'

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
}

export default function PublicTeamsLayout(): JSX.Element {
  return (
    <div className='space-y-8' data-testid='teams-layout-container'>
      <TeamsLayoutHeader variant='public' />
      {/* Main Content */}
      <Outlet />
    </div>
  )
}
