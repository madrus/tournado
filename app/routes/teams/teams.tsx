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
    <div className='container mx-auto px-4 py-8'>
      <TeamsLayoutHeader variant='public' />
      {/* Main Content */}
      <Outlet />
    </div>
  )
}
