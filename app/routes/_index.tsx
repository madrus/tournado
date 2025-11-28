import type { User } from '@prisma/client'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import { ActionLinkButton } from '~/components/buttons'
import { useTheme } from '~/hooks/useTheme'
import type { Language } from '~/i18n/config'
import { ADMIN_DASHBOARD_URL } from '~/lib/lib.constants'
import { cn } from '~/utils/misc'
import { hasAdminPanelAccess } from '~/utils/rbac'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'
import { getUser } from '~/utils/session.server'

type LoaderData = {
	user: User | null
}

export const meta: MetaFunction = () => [
	{ title: 'Tournado - Tournament Management Made Easy' },
	{
		name: 'description',
		content:
			'Manage your sports tournaments with ease. Create, organize, and track your teams and matches in one place.',
	},
	{
		property: 'og:title',
		content: 'Tournado - Tournament Management Made Easy',
	},
	{
		property: 'og:description',
		content:
			'Manage your sports tournaments with ease. Create, organize, and track your teams and matches in one place.',
	},
	{ property: 'og:type', content: 'website' },
]

// Route metadata
export const handle: RouteMetadata = {
	isPublic: true,
	title: 'common.titles.welcome',
}

export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
	const user = await getUser(request)

	return { user }
}

export default function IndexPage(): JSX.Element {
	const { t, i18n } = useTranslation()
	const { user } = useLoaderData<LoaderData>()
	const { theme, getThemeColor } = useTheme()

	// Get current language for RTL utilities
	const currentLanguage = i18n.language as Language

	// Get RTL-aware typography classes
	const typography = getTypographyClasses(currentLanguage)

	// Determine the correct teams route based on user permissions
	const teamsRoute = hasAdminPanelAccess(user)
		? `${ADMIN_DASHBOARD_URL}/teams`
		: '/teams'

	return (
		<main className={`flex h-full flex-col ${theme}`}>
			{/* Hero Section */}
			<div className='pt-16 pb-8'>
				<div className='mx-auto max-w-7xl px-6 lg:px-8'>
					<div className='mx-auto max-w-2xl text-center'>
						<h1
							className={cn(
								'text-4xl sm:text-6xl',
								typography.appName,
								getLatinTitleClass(currentLanguage),
								getThemeColor('title'),
							)}
						>
							{t('common.appName')}
						</h1>
						<p
							className={cn(
								'mt-6 min-h-[3.5rem] text-foreground text-lg leading-8',
								typography.centerAlign,
							)}
						>
							{t('landing.hero.description')}
						</p>
						<div className='mt-10 flex items-center justify-center gap-x-6'>
							<ActionLinkButton
								to={teamsRoute}
								icon='apparel'
								label={t('landing.hero.viewTeams')}
								variant='primary'
								color='primary'
								data-testid='view-teams-button'
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className='py-24 sm:py-32'>
				<div className='mx-auto max-w-7xl px-6 lg:px-8'>
					<div className='mx-auto max-w-2xl lg:text-center'>
						<h2
							className={cn(
								'block font-semibold text-base text-brand-accent leading-7',
								typography.centerAlign,
							)}
							aria-level={2}
						>
							{t('landing.features.title')}
						</h2>
						<h3
							className={cn(
								'mt-2 font-bold text-3xl text-title sm:text-4xl',
								typography.title,
								typography.heading,
								typography.centerAlign,
								getThemeColor('title'),
							)}
						>
							{t('landing.features.subtitle')}
						</h3>
						<p
							className={cn(
								'mt-6 text-foreground text-lg leading-8',
								typography.centerAlign,
							)}
						>
							{t('landing.features.description')}
						</p>
					</div>
				</div>
			</div>
		</main>
	)
}
