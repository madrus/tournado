import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, type MetaFunction, useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

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
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'

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
  const typographyClasses = getTypographyClasses(i18n.language)

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
          <Link
            to='/a7k9m2x5p8w1n4q6r3y8b5t1/teams'
            className='group rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none'
          >
            <div
              className={cn(
                'flex flex-col items-start space-y-4',
                typographyClasses.textAlign
              )}
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 shadow-emerald-500/25 transition-shadow group-hover:shadow-emerald-500/40'>
                <ApparelIcon className='h-5 w-5 text-white' />
              </div>
              <h3
                className={cn(
                  'text-lg font-semibold transition-colors group-hover:text-emerald-700',
                  getLatinTitleClass(i18n.language)
                )}
              >
                Teams Management
              </h3>
              <p className='text-foreground-light transition-colors group-hover:text-emerald-600'>
                Manage team registrations and memberships.
              </p>
              <div className='space-y-2'>
                <p className='text-foreground-light transition-colors group-hover:text-emerald-600'>
                  <strong className='me-1'>{t('admin.teams.totalTeams')}:</strong>
                  {teams.length}
                </p>
              </div>
            </div>
          </Link>

          {/* Tournament Management */}
          <Link
            to='/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments'
            className='group rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <div
              className={cn(
                'flex flex-col items-start space-y-4',
                typographyClasses.textAlign
              )}
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-blue-500/25 transition-shadow group-hover:shadow-blue-500/40'>
                <TrophyIcon className='h-5 w-5 text-white' />
              </div>
              <h3
                className={cn(
                  'text-lg font-semibold transition-colors group-hover:text-blue-700',
                  getLatinTitleClass(i18n.language)
                )}
              >
                Tournament Management
              </h3>
              <p className='text-foreground-light transition-colors group-hover:text-blue-600'>
                Create and manage tournaments and competitions.
              </p>
              <div className='space-y-2'>
                <p className='text-foreground-light transition-colors group-hover:text-blue-600'>
                  <strong className='me-1'>
                    {t('admin.tournaments.totalTournaments')}:
                  </strong>
                  {tournaments.length}
                </p>
              </div>
            </div>
          </Link>

          {/* User Management */}
          <div className='group cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50/30 hover:shadow-md'>
            <div
              className={cn(
                'flex flex-col items-start space-y-4',
                typographyClasses.textAlign
              )}
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 shadow-gray-500/25 transition-shadow group-hover:shadow-gray-500/40'>
                <PersonIcon className='h-5 w-5 text-white' />
              </div>
              <h3
                className={cn(
                  'text-lg font-semibold transition-colors group-hover:text-gray-700',
                  getLatinTitleClass(i18n.language)
                )}
              >
                User Management
              </h3>
              <p className='text-foreground-light transition-colors group-hover:text-gray-600'>
                Manage user accounts and permissions.
              </p>
              <div className='space-y-2'>
                <p className='text-foreground-light transition-colors group-hover:text-gray-600'>
                  <strong>Current User:</strong> {user.email}
                </p>
                <p className='text-foreground-light transition-colors group-hover:text-gray-600'>
                  <strong>User ID:</strong> {user.id}
                </p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className='group cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:border-red-300 hover:bg-red-50/30 hover:shadow-md'>
            <div
              className={cn(
                'flex flex-col items-start space-y-4',
                typographyClasses.textAlign
              )}
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-600 shadow-red-500/25 transition-shadow group-hover:shadow-red-500/40'>
                <SettingsIcon className='h-5 w-5 text-white' />
              </div>
              <h3
                className={cn(
                  'text-lg font-semibold transition-colors group-hover:text-red-700',
                  getLatinTitleClass(i18n.language)
                )}
              >
                System Settings
              </h3>
              <p className='text-foreground-light transition-colors group-hover:text-red-600'>
                Configure application settings and preferences.
              </p>
            </div>
          </div>

          {/* Reports & Analytics */}
          <div className='group cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md'>
            <div
              className={cn(
                'flex flex-col items-start space-y-4',
                typographyClasses.textAlign
              )}
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 shadow-emerald-500/25 transition-shadow group-hover:shadow-emerald-500/40'>
                <TuneIcon className='h-5 w-5 text-white' />
              </div>
              <h3
                className={cn(
                  'text-lg font-semibold transition-colors group-hover:text-emerald-700',
                  getLatinTitleClass(i18n.language)
                )}
              >
                Reports & Analytics
              </h3>
              <p className='text-foreground-light transition-colors group-hover:text-emerald-600'>
                View platform usage and tournament statistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
