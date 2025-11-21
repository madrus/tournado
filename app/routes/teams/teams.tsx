import type { JSX } from 'react'
import { Outlet } from 'react-router'

import { TeamsLayoutHeader } from '~/features/teams/components'
import type { RouteMetadata } from '~/utils/routeTypes'

// Route metadata
export const handle: RouteMetadata = {
	isPublic: true,
	title: 'common.titles.teams',
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
