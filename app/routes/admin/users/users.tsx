import type { JSX } from 'react'
import { Outlet } from 'react-router'
import { UsersLayoutHeader } from '~/features/users/components/UsersLayoutHeader'
import type { RouteMetadata } from '~/utils/routeTypes'

// Route metadata - requires user management permissions
export const handle: RouteMetadata = {
	isPublic: false,
	title: 'common.titles.users',
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	authorization: {
		requiredRoles: ['ADMIN'],
		redirectTo: '/unauthorized',
	},
}

export default function AdminUsersLayout(): JSX.Element {
	return (
		<div className='space-y-8' data-testid='admin-users-layout-container'>
			<UsersLayoutHeader />
			<Outlet />
		</div>
	)
}
