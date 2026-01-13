import type { JSX } from 'react'
import { Outlet } from 'react-router'
import { TeamsLayoutHeader } from '~/features/teams/components'
import type { RouteMetadata } from '~/utils/routeTypes'

// Route metadata - authenticated users can access
export const handle: RouteMetadata = {
	isPublic: false,
	title: 'common.titles.teams',
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	// No authorization restrictions - all authenticated users can access
}

export default function AdminTeamsLayout(): JSX.Element {
	return (
		<div className='space-y-8' data-testid='admin-teams-layout-container'>
			<TeamsLayoutHeader variant='admin' />
			{/* Main Content */}
			<Outlet />
		</div>
	)
}
