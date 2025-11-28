import type { User } from '@prisma/client'
import type { JSX } from 'react'
import type { MetaFunction } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { ProfileLayoutHeader } from '~/components/layouts'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { getLatinTitleClass } from '~/utils/rtlUtils'

import type { Route } from './+types/profile'

// Route metadata - this is a protected route with enhanced configuration

type LoaderData = {
	user: User
}

export const meta: MetaFunction = () => [
	{ title: 'Profile | Tournado' },
	{
		name: 'description',
		content:
			'Manage your profile settings and account information for tournament management.',
	},
	{ property: 'og:title', content: 'Profile | Tournado' },
	{
		property: 'og:description',
		content:
			'Manage your profile settings and account information for tournament management.',
	},
	{ property: 'og:type', content: 'website' },
]

export const handle: RouteMetadata = {
	isPublic: false,
	title: 'common.titles.profile',
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	// No authorization block - all authenticated users can access their profile
	protection: {
		autoCheck: true,
		// Custom check example: ensure user can only access their own profile
		customCheck: async (_request, _user) => true,
	},
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	// Use the enhanced protection system
	const user = await requireUserWithMetadata(request, handle)
	return { user }
}

export default function ProfilePage(): JSX.Element {
	return (
		<div data-testid='profile-container'>
			<ProfileLayoutHeader />
			<div className='mt-8 space-y-6'>
				<section>
					<h3 className={cn('mb-4 font-semibold text-2xl', getLatinTitleClass())}>
						Account Settings
					</h3>
					<ul className='space-y-2 text-foreground'>
						<li>• Personal information management</li>
						<li>• Password and security settings</li>
						<li>• Notification preferences</li>
						<li>• Privacy and data settings</li>
						<li>• Account deletion options</li>
					</ul>
				</section>

				<section>
					<h3 className={cn('mb-4 font-semibold text-2xl', getLatinTitleClass())}>
						Tournament Access
					</h3>
					<p className='text-foreground'>
						Your profile provides access to tournament management features based on your
						role and permissions.
					</p>
				</section>
			</div>
		</div>
	)
}

export { AuthErrorBoundary as ErrorBoundary }
