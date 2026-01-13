import type { JSX } from 'react'
import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
import { GeneralErrorBoundary } from '~/components/GeneralErrorBoundary'
import { AboutLayoutHeader } from '~/components/layouts'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass } from '~/utils/rtlUtils'
import type { Route } from './+types/about'

// Type definition for loader data
type LoaderData = {
	version: string
}

// Route metadata - this is a public route
export const handle: RouteMetadata = {
	isPublic: true,
	title: 'common.titles.about',
}

export const meta: MetaFunction = () => [
	{ title: 'About | Tournado' },
	{
		name: 'description',
		content:
			'Learn about Tournado - the comprehensive tournament management platform for sports organizations and teams.',
	},
	{ property: 'og:title', content: 'About | Tournado' },
	{
		property: 'og:description',
		content:
			'Learn about Tournado - the comprehensive tournament management platform for sports organizations and teams.',
	},
	{ property: 'og:type', content: 'website' },
]

export async function loader({
	request: _request,
}: Route.LoaderArgs): Promise<LoaderData> {
	// Read version from package.json
	const packageJson = await import('../../package.json')
	return { version: packageJson.version }
}

export default function AboutPage(): JSX.Element {
	const { version } = useLoaderData<LoaderData>()

	return (
		<div data-testid='about-container'>
			<AboutLayoutHeader />
			<div className='mt-8 space-y-6'>
				<section>
					<h3 className={cn('mb-4 font-semibold text-2xl', getLatinTitleClass())}>
						Version
					</h3>
					<p className='text-foreground'>{version}</p>
				</section>

				<section>
					<h3 className={cn('mb-4 font-semibold text-2xl', getLatinTitleClass())}>
						Features
					</h3>
					<ul className='space-y-2 text-foreground'>
						<li>• Tournament creation and management</li>
						<li>• Team registration and player management</li>
						<li>• Schedule generation and match tracking</li>
						<li>• Real-time updates and notifications</li>
						<li>• Comprehensive reporting and analytics</li>
					</ul>
				</section>

				<section>
					<h3 className={cn('mb-4 font-semibold text-2xl', getLatinTitleClass())}>
						Technology Stack
					</h3>
					<p className='text-foreground'>
						Built with modern web technologies including React Router v7, TypeScript,
						Prisma, and SQLite for a robust and scalable solution.
					</p>
				</section>
			</div>
		</div>
	)
}

export { GeneralErrorBoundary as ErrorBoundary }
