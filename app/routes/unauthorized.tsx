import type { User } from '@prisma/client'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
import { ErrorRecoveryLink, PrimaryNavLink } from '~/components/PrefetchLink'
import { BlockIcon } from '~/components/icons'
import { cn } from '~/utils/misc'
import { getUserRole } from '~/utils/rbac'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass } from '~/utils/rtlUtils'
import { getUser } from '~/utils/session.server'
import type { Route } from './+types/unauthorized'

export const meta: MetaFunction = () => [
	{ title: 'Unauthorized | Tournado' },
	{
		name: 'description',
		content:
			'You do not have permission to access this page. Contact your administrator for access.',
	},
	{ property: 'og:title', content: 'Unauthorized | Tournado' },
	{
		property: 'og:description',
		content:
			'You do not have permission to access this page. Contact your administrator for access.',
	},
	{ property: 'og:type', content: 'website' },
]

export const handle: RouteMetadata = {
	isPublic: true, // Accessible to authenticated users who lack permissions
	title: 'Unauthorized',
}

type LoaderData = {
	user: User | null
	role: string
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	const user = await getUser(request)
	const role = getUserRole(user)

	return { user, role }
}

export default function UnauthorizedPage(): JSX.Element {
	const loaderData = useLoaderData<LoaderData>()
	const { user, role } = loaderData

	const { t } = useTranslation()

	const getRoleBasedMessage = () => {
		if (!user) {
			return {
				title: t('errors.auth.unauthorizedSignInRequiredTitle'),
				message: t('errors.auth.unauthorizedSignInRequired'),
			}
		}

		switch (role) {
			case 'PUBLIC':
				return {
					title: t('errors.auth.unauthorizedAdminRequiredTitle'),
					message: t('errors.auth.unauthorizedAdminRequired'),
				}
			case 'REFEREE':
				return {
					title: t('errors.auth.unauthorizedManagerRequiredTitle'),
					message: t('errors.auth.unauthorizedManagerRequired'),
				}
			case 'MANAGER':
				return {
					title: t('errors.auth.unauthorizedSuperAdminRequiredTitle'),
					message: t('errors.auth.unauthorizedSuperAdminRequired'),
				}
			default:
				return {
					title: t('errors.auth.unauthorizedDefaultTitle'),
					message: t('errors.auth.unauthorizedDefault'),
				}
		}
	}

	const { title, message } = getRoleBasedMessage()

	return (
		<div
			className='flex min-h-screen flex-col items-center justify-center bg-background'
			data-testid='main-container'
		>
			<div
				className='mx-auto max-w-md rounded-lg bg-background p-6 shadow-md'
				data-testid='content-card'
			>
				<div className='flex flex-col items-center gap-4' data-testid='content-wrapper'>
					{/* Icon */}
					<div
						className='flex h-12 w-12 items-center justify-center rounded-full bg-error'
						data-testid='icon-container'
					>
						<BlockIcon className='text-brand' size={24} />
					</div>

					{/* Title */}
					<h1 className={cn('font-bold text-2xl', getLatinTitleClass())}>{title}</h1>

					{/* Description */}
					<p className='text-center text-foreground'>{message}</p>

					{user ? (
						<p className='text-center text-muted-foreground text-sm'>
							Current role:{' '}
							<span className='font-medium capitalize'>{role.toLowerCase()}</span>
						</p>
					) : null}

					{/* Actions */}
					<div className='flex w-full flex-col gap-2' data-testid='actions-container'>
						<ErrorRecoveryLink
							to='/'
							className='flex w-full items-center justify-center rounded-md bg-button-primary-background px-4 py-2 font-medium text-button-primary-text text-sm hover:bg-button-primary-hover-background hover:ring-2 hover:ring-primary hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
						>
							{t('common.backToHome')}
						</ErrorRecoveryLink>

						<PrimaryNavLink
							to='/profile'
							className='flex w-full items-center justify-center rounded-md border border-button-secondary-border bg-button-secondary-background px-4 py-2 font-medium text-button-secondary-text text-sm hover:bg-button-secondary-hover-background hover:ring-2 hover:ring-primary hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
						>
							{t('common.titles.profile')}
						</PrimaryNavLink>
					</div>
				</div>
			</div>
		</div>
	)
}
