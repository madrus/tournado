import type { User } from '@prisma/client'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { type MetaFunction, useLoaderData } from 'react-router'
import { ActionLinkPanel } from '~/components/ActionLinkPanel'
import {
	ApparelIcon,
	GroupIcon,
	SettingsIcon,
	SportsIcon,
	TrophyIcon,
	TuneIcon,
} from '~/components/icons'
import { AdminPanelLayoutHeader } from '~/components/layouts'
import { getAllTeams } from '~/models/team.server'
import { getAllTournaments } from '~/models/tournament.server'
import { getActiveUsersCount } from '~/models/user.server'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { adminPath } from '~/utils/adminRoutes'
import { cn } from '~/utils/misc'
import { canAccess, hasPermission } from '~/utils/rbac'
import { requireAdminUser } from '~/utils/rbacMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import type { Route } from './+types/admin._index'

type LoaderData = {
	user: User
	teams: Array<{
		id: string
		name: string
		clubName: string
	}>
	tournaments: Array<{
		id: string
		name: string
		location: string
		startDate: Date
		endDate: Date | null
	}>
	activeUsersCount: number
}

export const meta: MetaFunction = () => [
	{ title: 'Admin Panel | Tournado' },
	{
		name: 'description',
		content: 'Administrative panel for tournament management and user administration.',
	},
	{ property: 'og:title', content: 'Admin Panel | Tournado' },
	{
		property: 'og:description',
		content: 'Administrative panel for tournament management and user administration.',
	},
	{ property: 'og:type', content: 'website' },
]

export const handle: RouteMetadata = {
	isPublic: false,
	title: 'common.titles.adminPanel',
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	authorization: {
		requiredRoles: ['ADMIN', 'MANAGER', 'REFEREE', 'EDITOR', 'BILLING'],
		redirectTo: '/unauthorized',
	},
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	// Require admin panel access (all non-PUBLIC roles)
	const user = await requireAdminUser(request)

	// Load teams, tournaments, and active users count data for the overview tiles
	const [teams, tournaments, activeUsersCount] = await Promise.all([
		getAllTeams(),
		getAllTournaments(),
		getActiveUsersCount(),
	])

	return { user, teams, tournaments, activeUsersCount }
}

export default function AdminDashboard(): JSX.Element {
	const { user, teams, tournaments, activeUsersCount } = useLoaderData<LoaderData>()
	const { t } = useTranslation()
	const isRTL = useSettingsStore((state) => state.isRTL)

	// Check user permissions for conditional rendering
	// Admin tiles: delete permission implies full admin access (create, read, update, delete)
	const canManageTeams = canAccess(user, 'teams:delete')
	const canManageTournaments = canAccess(user, 'tournaments:delete')
	const canRefereeMatches = hasPermission(user, 'matches:referee')
	const canManageUsers = hasPermission(user, 'users:approve')
	const canAccessSystemSettings = hasPermission(user, 'system:settings')
	const canViewReports = hasPermission(user, 'system:reports')

	return (
		<div className='space-y-8' data-testid='admin-dashboard-container'>
			<AdminPanelLayoutHeader userEmail={user.email} />

			{/* Dashboard Grid */}
			<div className='grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{/* Panel 1 - Tournament Management (only for ADMIN and MANAGER) */}
				{canManageTournaments ? (
					<ActionLinkPanel
						title={t('admin.tournaments.title')}
						description={t('admin.tournaments.description')}
						icon={<TrophyIcon className='h-5 w-5' />}
						mainColor='teal'
						hoverColor='brand'
						iconColor='sky'
						to={adminPath('/tournaments')}
						testId='admin-panel-tournament-management'
					>
						<div className='space-y-2'>
							<p>
								<strong className='me-1'>
									{t('admin.tournaments.totalTournaments')}:
								</strong>
								<span className={cn(isRTL ? 'latin-text' : '')}>
									{tournaments.length}
								</span>
							</p>
						</div>
					</ActionLinkPanel>
				) : null}

				{/* Panel 2 - Team Management (only for ADMIN and MANAGER) */}
				{canManageTeams ? (
					<ActionLinkPanel
						title={t('admin.teams.title')}
						description={t('admin.teams.description')}
						icon={<ApparelIcon className='h-5 w-5' />}
						mainColor='teal'
						hoverColor='brand'
						iconColor='green'
						to={adminPath('/teams')}
						testId='admin-panel-team-management'
					>
						<div className='space-y-2'>
							<p>
								<strong className='me-1'>{t('admin.teams.totalTeams')}:</strong>
								<span className={cn(isRTL ? 'latin-text' : '')}>{teams.length}</span>
							</p>
						</div>
					</ActionLinkPanel>
				) : null}

				{/* Panel 3 - Competition Management (for REFEREE, MANAGER, and ADMIN) */}
				{canRefereeMatches ? (
					<ActionLinkPanel
						title={t('admin.competition.title')}
						description={t('admin.competition.description')}
						icon={<SportsIcon className='h-5 w-5' />}
						mainColor='teal'
						hoverColor='brand'
						iconColor='lime'
						to={adminPath('/competition')}
						testId='admin-panel-competition-management'
					>
						<div className='space-y-2'>
							<p>
								<strong className='me-1'>{t('users.fields.role')}: </strong>
								<span className='latin-text'>{user.role}</span>
							</p>
						</div>
					</ActionLinkPanel>
				) : null}

				{/* Panel 4 - User Management (only for ADMIN) */}
				{canManageUsers ? (
					<ActionLinkPanel
						title={t('admin.users.title')}
						description={t('admin.users.description')}
						icon={<GroupIcon className='h-5 w-5' />}
						mainColor='teal'
						hoverColor='brand'
						iconColor='yellow'
						to={adminPath('/users')}
						testId='admin-panel-user-management'
					>
						<div className='space-y-2'>
							<p>
								<strong className='me-1'>{t('admin.users.totalUsers')}:</strong>
								<span className={cn(isRTL ? 'latin-text' : '')}>
									{activeUsersCount}
								</span>
							</p>
						</div>
					</ActionLinkPanel>
				) : null}

				{/* Panel 5 - System Settings (for ADMIN only) */}
				{canAccessSystemSettings ? (
					<ActionLinkPanel
						title={t('admin.settings.title')}
						description={t('admin.settings.description')}
						icon={<SettingsIcon className='h-5 w-5' />}
						mainColor='teal'
						hoverColor='brand'
						iconColor='brand'
						testId='admin-panel-system-settings'
					/>
				) : null}

				{/* Panel 6 - Reports & Analytics (for ADMIN and MANAGER) */}
				{canViewReports ? (
					<ActionLinkPanel
						title={t('admin.reports.title')}
						description={t('admin.reports.description')}
						icon={<TuneIcon className='h-5 w-5' />}
						mainColor='teal'
						hoverColor='brand'
						iconColor='fuchsia'
						testId='admin-panel-reports-&-analytics'
					/>
				) : null}
			</div>
		</div>
	)
}
