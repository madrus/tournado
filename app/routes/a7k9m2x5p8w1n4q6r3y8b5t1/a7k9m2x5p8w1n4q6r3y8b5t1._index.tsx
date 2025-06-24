import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { type MetaFunction, useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

import { ActionLinkButton } from '~/components/buttons'
import { getAllTeamListItems } from '~/models/team.server'
import { getAllTournamentListItems } from '~/models/tournament.server'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'
import { getLatinTitleClass } from '~/utils/rtlUtils'

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

//! TODO: replace with generated type
type LoaderArgs = {
  request: Request
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

export async function loader({ request }: LoaderArgs): Promise<LoaderData> {
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
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-2'>
          {/* Teams Management */}
          <div className='rounded-lg border bg-white p-6 shadow-sm'>
            <h3
              className={cn(
                'mb-4 text-lg font-semibold',
                getLatinTitleClass(i18n.language)
              )}
            >
              Teams Management
            </h3>
            <p className='text-foreground-light mb-4'>
              Manage team registrations and memberships.
            </p>
            <div className='mb-4 space-y-2'>
              <p className='text-foreground-light'>
                <strong className='me-1'>{t('admin.teams.totalTeams')}:</strong>
                {teams.length}
              </p>
            </div>
            <ActionLinkButton
              to='/a7k9m2x5p8w1n4q6r3y8b5t1/teams'
              label='Manage Teams'
              icon='apparel'
              variant='emerald'
            />
          </div>

          {/* Tournament Management */}
          <div className='rounded-lg border bg-white p-6 shadow-sm'>
            <h3
              className={cn(
                'mb-4 text-lg font-semibold',
                getLatinTitleClass(i18n.language)
              )}
            >
              Tournament Management
            </h3>
            <p className='text-foreground-light mb-4'>
              Create and manage tournaments and competitions.
            </p>
            <div className='mb-4 space-y-2'>
              <p className='text-foreground-light'>
                <strong className='me-1'>
                  {t('admin.tournaments.totalTournaments')}:
                </strong>
                {tournaments.length}
              </p>
            </div>
            <ActionLinkButton
              to='/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments'
              label='Manage Tournaments'
              icon='trophy'
              variant='primary'
            />
          </div>

          {/* User Management */}
          <div className='rounded-lg border bg-white p-6 shadow-sm'>
            <h3
              className={cn(
                'mb-4 text-lg font-semibold',
                getLatinTitleClass(i18n.language)
              )}
            >
              User Management
            </h3>
            <p className='text-foreground-light mb-4'>
              Manage user accounts and permissions.
            </p>
            <div className='space-y-2'>
              <p className='text-foreground-light'>
                <strong>Current User:</strong> {user.email}
              </p>
              <p className='text-foreground-light'>
                <strong>User ID:</strong> {user.id}
              </p>
            </div>
          </div>

          {/* System Settings */}
          <div className='rounded-lg border bg-white p-6 shadow-sm'>
            <h3
              className={cn(
                'mb-4 text-lg font-semibold',
                getLatinTitleClass(i18n.language)
              )}
            >
              System Settings
            </h3>
            <p className='text-foreground-light mb-4'>
              Configure application settings and preferences.
            </p>
            <ActionLinkButton
              to=''
              label='System Config'
              icon='settings'
              className='border border-red-600 bg-white text-red-700 shadow-red-500/25 hover:border-red-500 hover:bg-red-50/30 hover:ring-2 hover:shadow-red-500/40 hover:ring-red-600/90 hover:ring-offset-2 focus:ring-red-600/90'
            />
          </div>

          {/* Reports & Analytics */}
          <div className='rounded-lg border bg-white p-6 shadow-sm'>
            <h3
              className={cn(
                'mb-4 text-lg font-semibold',
                getLatinTitleClass(i18n.language)
              )}
            >
              Reports & Analytics
            </h3>
            <p className='text-foreground-light mb-4'>
              View platform usage and tournament statistics.
            </p>
            <ActionLinkButton
              to=''
              label='View Reports'
              icon='tune'
              className='border border-emerald-600 bg-white text-emerald-700 shadow-emerald-500/25 hover:border-emerald-500 hover:bg-emerald-50/30 hover:ring-2 hover:shadow-emerald-500/40 hover:ring-emerald-600/90 hover:ring-offset-2 focus:ring-emerald-600/90'
            />
          </div>
        </div>
      </div>
    </>
  )
}
