import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { type MetaFunction, useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

import { ActionLinkPanel } from '~/components/ActionLinkPanel'
import {
  ApparelIcon,
  PersonIcon,
  SettingsIcon,
  TrophyIcon,
  TuneIcon,
} from '~/components/icons'
import { getAllTeamListItems } from '~/models/team.server'
import { getAllTournamentListItems } from '~/models/tournament.server'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'
import { getLatinTitleClass } from '~/utils/rtlUtils'

import type { Route } from './+types/a7k9m2x5p8w1n4q6r3y8b5t1._index'

type LoaderData = {
  user: User
  teams: Array<{
    id: string
    clubName: string
    teamName: string
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
  title: 'Admin Panel',
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  // No authorization restrictions - all authenticated users can access admin panel
  protection: {
    autoCheck: true,
    // Custom check: additional validation for admin access
    customCheck: async (_request, user) => user !== null, // Placeholder logic
  },
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  // Enhanced protection automatically handles authentication and authorization
  const user = await requireUserWithMetadata(request, handle)

  // Load teams and tournaments data for the overview tiles
  const teams = await getAllTeamListItems()
  const tournaments = await getAllTournamentListItems()

  return { user, teams, tournaments }
}

export default function AdminDashboard(): JSX.Element {
  const { user, teams, tournaments } = useLoaderData<LoaderData>()
  const { t, i18n } = useTranslation()

  return (
    <>
      <h1 className={cn('mb-8 text-3xl font-bold', getLatinTitleClass(i18n.language))}>
        Admin Panel
      </h1>
      <p className='text-foreground-light mb-8'>
        Welcome back, {user.email}. Manage your tournament platform from here.
      </p>
      <div className='space-y-8'>
        {/* Dashboard Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Team Management */}
          <ActionLinkPanel
            title='Team Management'
            description='Manage team registrations and memberships.'
            icon={
              <ApparelIcon className='h-5 w-5 text-emerald-700 transition-colors group-hover:text-emerald-800' />
            }
            colorScheme='emerald'
            to='/a7k9m2x5p8w1n4q6r3y8b5t1/teams'
            language={i18n.language}
          >
            <div className='space-y-2'>
              <p className='text-foreground-light transition-colors group-hover:text-emerald-600'>
                <strong className='me-1'>{t('admin.teams.totalTeams')}:</strong>
                {teams.length}
              </p>
            </div>
          </ActionLinkPanel>

          {/* Tournament Management */}
          <ActionLinkPanel
            title='Tournament Management'
            description='Create and manage tournaments and competitions.'
            icon={
              <TrophyIcon className='h-5 w-5 text-blue-700 transition-colors group-hover:text-blue-800' />
            }
            colorScheme='blue'
            to='/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments'
            language={i18n.language}
          >
            <div className='space-y-2'>
              <p className='text-foreground-light transition-colors group-hover:text-blue-600'>
                <strong className='me-1'>
                  {t('admin.tournaments.totalTournaments')}:
                </strong>
                {tournaments.length}
              </p>
            </div>
          </ActionLinkPanel>

          {/* User Management */}
          <ActionLinkPanel
            title='User Management'
            description='Manage user accounts and permissions.'
            icon={
              <PersonIcon className='h-5 w-5 text-gray-700 transition-colors group-hover:text-gray-800' />
            }
            colorScheme='gray'
            language={i18n.language}
          >
            <div className='space-y-2'>
              <p className='text-foreground-light break-all transition-colors group-hover:text-gray-600'>
                <strong>Current User:</strong> {user.email}
              </p>
              <p className='text-foreground-light break-all transition-colors group-hover:text-gray-600'>
                <strong>User ID:</strong> {user.id}
              </p>
            </div>
          </ActionLinkPanel>

          {/* System Settings */}
          <ActionLinkPanel
            title='System Settings'
            description='Configure application settings and preferences.'
            icon={
              <SettingsIcon className='h-5 w-5 text-red-700 transition-colors group-hover:text-red-800' />
            }
            colorScheme='brand'
            language={i18n.language}
          />

          {/* Reports & Analytics */}
          <ActionLinkPanel
            title='Reports & Analytics'
            description='View platform usage and tournament statistics.'
            icon={
              <TuneIcon className='h-5 w-5 text-emerald-700 transition-colors group-hover:text-emerald-800' />
            }
            colorScheme='emerald'
            language={i18n.language}
          />
        </div>
      </div>
    </>
  )
}
