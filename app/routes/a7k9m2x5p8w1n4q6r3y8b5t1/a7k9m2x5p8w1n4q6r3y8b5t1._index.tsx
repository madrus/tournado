import { JSX } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { type MetaFunction, useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

import { ActionLinkPanel } from '~/components/ActionLinkPanel'
import {
  ApparelIcon,
  PersonIcon,
  SettingsIcon,
  SportsIcon,
  TrophyIcon,
  TuneIcon,
} from '~/components/icons'
import { getAllTeamListItems } from '~/models/team.server'
import { getAllTournamentListItems } from '~/models/tournament.server'
import { cn } from '~/utils/misc'
import { hasPermission } from '~/utils/rbac'
import { requireAdminUser } from '~/utils/rbacMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'

import type { Route } from './+types/a7k9m2x5p8w1n4q6r3y8b5t1._index'

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
    requiredRoles: ['admin', 'manager', 'referee'],
    redirectTo: '/unauthorized',
  },
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  // Require admin panel access (ADMIN, MANAGER, or REFEREE roles)
  const user = await requireAdminUser(request)

  // Load teams and tournaments data for the overview tiles
  const teams = await getAllTeamListItems()
  const tournaments = await getAllTournamentListItems()

  return { user, teams, tournaments }
}

export default function AdminDashboard(): JSX.Element {
  const { user, teams, tournaments } = useLoaderData<LoaderData>()
  const { t, i18n } = useTranslation()

  // Get typography classes for Arabic support
  const typography = getTypographyClasses(i18n.language)

  // Check user permissions for conditional rendering
  const canManageTeams = hasPermission(user, 'teams:manage')
  const canManageTournaments = hasPermission(user, 'tournaments:manage')
  const canRefereeMatches = hasPermission(user, 'matches:referee')
  const canAccessSystemSettings = hasPermission(user, 'system:settings')
  const canViewReports = hasPermission(user, 'system:reports')

  return (
    <div className='space-y-8' data-testid='admin-dashboard-container'>
      <div>
        <h1
          className={cn(
            'mb-8 text-3xl font-bold',
            typography.title,
            typography.textAlign
          )}
        >
          {t('common.titles.adminPanel')}
        </h1>
        <p
          className={cn('text-foreground mb-8 text-lg leading-7', typography.textAlign)}
        >
          <Trans
            i18nKey='admin.panel.description'
            values={{ email: user.email }}
            components={{
              email: <span className={getLatinTitleClass(i18n.language)} />,
            }}
          />
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className='grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Panel 1 - Team Management (only for ADMIN and MANAGER) */}
        {canManageTeams ? (
          <ActionLinkPanel
            title='Team Management'
            description='Manage team registrations and memberships.'
            icon={<ApparelIcon className='h-5 w-5' />}
            mainColor='teal'
            hoverColor='brand'
            iconColor='green'
            to='/a7k9m2x5p8w1n4q6r3y8b5t1/teams'
            language={i18n.language}
          >
            <div className='space-y-2'>
              <p>
                <strong className='me-1'>{t('admin.team.totalTeams')}:</strong>
                {teams.length}
              </p>
            </div>
          </ActionLinkPanel>
        ) : null}

        {/* Panel 2 - Tournament Management (only for ADMIN and MANAGER) */}
        {canManageTournaments ? (
          <ActionLinkPanel
            title='Tournament Management'
            description='Create and manage tournaments and competitions.'
            icon={<TrophyIcon className='h-5 w-5' />}
            mainColor='teal'
            hoverColor='brand'
            iconColor='cyan'
            to='/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments'
            language={i18n.language}
          >
            <div className='space-y-2'>
              <p>
                <strong className='me-1'>
                  {t('admin.tournament.totalTournaments')}:
                </strong>
                {tournaments.length}
              </p>
            </div>
          </ActionLinkPanel>
        ) : null}

        {/* Panel 3 - Match Management (for REFEREE, MANAGER, and ADMIN) */}
        {canRefereeMatches ? (
          <ActionLinkPanel
            title='Match Management'
            description='Manage match scores and referee assignments.'
            icon={<SportsIcon className='h-5 w-5' />}
            mainColor='teal'
            hoverColor='brand'
            iconColor='lime'
            to='/a7k9m2x5p8w1n4q6r3y8b5t1/matches'
            language={i18n.language}
          >
            <div className='space-y-2'>
              <p>
                <strong className='me-1'>Role:</strong>
                {user.role}
              </p>
            </div>
          </ActionLinkPanel>
        ) : null}

        {/* Panel 4 - User Management (for ADMIN and MANAGER) */}
        <ActionLinkPanel
          title='User Management'
          description='Manage user accounts and permissions.'
          icon={<PersonIcon className='h-5 w-5' />}
          mainColor='teal'
          hoverColor='brand'
          iconColor='yellow'
          language={i18n.language}
        >
          <div className='space-y-2'>
            <p className='break-all'>
              <strong data-color='action'>Current User:</strong> {user.email}
            </p>
            <p className='break-all'>
              <strong data-color='action'>User ID:</strong> {user.id}
            </p>
          </div>
        </ActionLinkPanel>

        {/* Panel 5 - System Settings (for ADMIN only) */}
        {canAccessSystemSettings ? (
          <ActionLinkPanel
            title='System Settings'
            description='Configure application settings and preferences.'
            icon={<SettingsIcon className='h-5 w-5' />}
            mainColor='teal'
            hoverColor='brand'
            iconColor='brand'
            language={i18n.language}
          />
        ) : null}

        {/* Panel 6 - Reports & Analytics (for ADMIN and MANAGER) */}
        {canViewReports ? (
          <ActionLinkPanel
            title='Reports & Analytics'
            description='View platform usage and tournament statistics.'
            icon={<TuneIcon className='h-5 w-5' />}
            mainColor='teal'
            hoverColor='brand'
            iconColor='violet'
            language={i18n.language}
          />
        ) : null}
      </div>
    </div>
  )
}
