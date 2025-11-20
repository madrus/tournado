import type { User } from '@prisma/client'
import type { JSX } from 'react'
import type { MetaFunction } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { SettingsLayoutHeader } from '~/components/layouts'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass } from '~/utils/rtlUtils'
import { requireUser } from '~/utils/session.server'

import type { Route } from './+types/settings'

// Route metadata - this is a protected route

type LoaderData = {
	user: User
}

export const meta: MetaFunction = () => [
	{ title: 'Settings | Tournado' },
	{
		name: 'description',
		content: 'Configure your tournament settings, preferences, and account options.',
	},
	{ property: 'og:title', content: 'Settings | Tournado' },
	{
		property: 'og:description',
		content: 'Configure your tournament settings, preferences, and account options.',
	},
	{ property: 'og:type', content: 'website' },
]

// Route metadata - this is a protected route
export const handle: RouteMetadata = {
	isPublic: false,
	// When roles are implemented:
	// roles: ['tournamentOrganiser', 'admin']
	title: 'common.titles.settings',
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	const user = await requireUser(request)
	return { user }
}

export default function SettingsPage(): JSX.Element {
	return (
		<div data-testid='settings-container'>
			<SettingsLayoutHeader />
			<div className='mt-8 space-y-6'>
				<section>
					<h3 className={cn('mb-4 font-semibold text-2xl', getLatinTitleClass())}>Preferences</h3>
					<ul className='space-y-2 text-foreground'>
						<li>• Language and regional settings</li>
						<li>• Theme and appearance options</li>
						<li>• Notification preferences</li>
						<li>• Privacy and security settings</li>
						<li>• Data export and backup options</li>
					</ul>
				</section>

				<section>
					<h3 className={cn('mb-4 font-semibold text-2xl', getLatinTitleClass())}>
						Tournament Configuration
					</h3>
					<p className='text-foreground'>
						Customize tournament management settings and default configurations for your
						organization.
					</p>
				</section>
			</div>
		</div>
	)
}

export { AuthErrorBoundary as ErrorBoundary }
