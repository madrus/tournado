import { JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { SportsIcon, TrophyIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import { getTournamentById } from '~/models/tournament.server'
import { cn } from '~/utils/misc'
import { requireAdminUser } from '~/utils/rbacMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass } from '~/utils/rtlUtils'

import type { Route } from './+types/competition'

type LoaderData = {
  readonly tournament: {
    readonly id: string
    readonly name: string
    readonly location: string
  } | null
}

export const handle: RouteMetadata = {
  isPublic: false,
  title: 'Competition Management',
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin', 'manager'],
    redirectTo: '/unauthorized',
  },
}

export async function loader({
  request,
  params: _params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireAdminUser(request)

  // Get tournament ID from search params or default to first available
  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')

  let tournament = null
  if (tournamentId) {
    tournament = await getTournamentById({ id: tournamentId })
  }

  return {
    tournament: tournament
      ? {
          id: tournament.id,
          name: tournament.name,
          location: tournament.location,
        }
      : null,
  }
}

const tabs = [
  {
    name: 'Groups',
    href: 'groups',
    icon: SportsIcon,
    description: 'Manage group sets and team assignments',
    disabled: false,
  },
  {
    name: 'Playoffs',
    href: 'playoffs',
    icon: TrophyIcon,
    description: 'Configure knockout brackets',
    disabled: true, // Coming soon
  },
] as const

export default function CompetitionLayout(): JSX.Element {
  const { tournament } = useLoaderData<LoaderData>()
  const { i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<'groups' | 'playoffs'>('groups')

  return (
    <div className='w-full space-y-8'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            Competition Management
          </h1>
          <p className='text-foreground-light mt-2'>
            Manage groups and playoffs for tournaments
          </p>
        </div>

        {/* Tournament Selector */}
        <div className='flex items-center space-x-4'>
          <label className='text-foreground text-sm font-medium'>Tournament:</label>
          <select className='border-border bg-background text-foreground rounded-md border px-3 py-2'>
            {tournament ? (
              <option value={tournament.id}>{tournament.name}</option>
            ) : (
              <option value=''>Select a tournament...</option>
            )}
          </select>
        </div>
      </div>

      {/* Tab Navigation & Content */}
      <div className='space-y-0'>
        {/* Tab Headers */}
        <div className='border-border flex space-x-0 border-b'>
          {tabs.map(tab => (
            <button
              key={tab.href}
              onClick={() => setActiveTab(tab.href as 'groups' | 'playoffs')}
              disabled={tab.disabled}
              className={cn(
                'relative flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200',
                'border-t border-r border-b-2 border-l first:border-l last:border-r',
                '-mb-px rounded-t-lg focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none',
                activeTab === tab.href
                  ? [
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
                      'border-emerald-300 border-b-emerald-50 dark:border-emerald-700 dark:border-b-emerald-950/50',
                      'z-10 shadow-lg',
                    ]
                  : tab.disabled
                    ? [
                        'bg-background text-foreground-lighter cursor-not-allowed',
                        'border-border border-b-border',
                      ]
                    : [
                        'bg-background hover:bg-accent text-foreground-light hover:text-foreground',
                        'border-border border-b-border hover:border-emerald-200 dark:hover:border-emerald-800',
                      ]
              )}
            >
              <tab.icon
                className={cn(
                  'h-4 w-4',
                  activeTab === tab.href ? 'text-emerald-600 dark:text-emerald-400' : ''
                )}
              />
              <span>{tab.name}</span>
              {tab.disabled ? (
                <span className='bg-accent text-foreground-lighter rounded-full px-2 py-0.5 text-xs'>
                  Soon
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Content - Seamlessly Connected Panel */}
        <div className='relative'>
          {activeTab === 'groups' ? (
            <Panel color='emerald' className='rounded-t-none border-t-0 shadow-lg'>
              <div className='space-y-6'>
                <div>
                  <h3 className='mb-2 text-xl font-semibold text-emerald-800 dark:text-emerald-200'>
                    Group Sets Management
                  </h3>
                  <p className='text-foreground-light'>
                    Create and manage group sets for round-robin play. Organize teams
                    into competitive groups for the tournament.
                  </p>
                </div>

                {/* Placeholder for actual group content */}
                <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30'>
                  <div className='text-center'>
                    <SportsIcon className='mx-auto mb-4 h-12 w-12 text-emerald-400' />
                    <h4 className='mb-2 text-lg font-medium text-emerald-700 dark:text-emerald-300'>
                      Group Management
                    </h4>
                    <p className='text-foreground-light text-sm'>
                      Group creation and management functionality will be integrated
                      here.
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
          ) : activeTab === 'playoffs' ? (
            <Panel color='emerald' className='rounded-t-none border-t-0 shadow-lg'>
              <div className='space-y-6'>
                <div>
                  <h3 className='mb-2 text-xl font-semibold text-emerald-800 dark:text-emerald-200'>
                    Playoffs Configuration
                  </h3>
                  <p className='text-foreground-light'>
                    Configure knockout brackets and elimination rounds. Set up the
                    playoff structure for your tournament.
                  </p>
                </div>

                {/* Coming Soon Content */}
                <div className='rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30'>
                  <div className='text-center'>
                    <TrophyIcon className='mx-auto mb-4 h-16 w-16 text-emerald-500' />
                    <h4 className='mb-3 text-2xl font-semibold text-emerald-700 dark:text-emerald-300'>
                      Coming Soon
                    </h4>
                    <p className='text-foreground-light mb-4 text-lg'>
                      Playoff brackets and elimination rounds are being developed.
                    </p>
                    <div className='inline-flex items-center space-x-2 rounded-full bg-emerald-100 px-4 py-2 dark:bg-emerald-900/50'>
                      <div className='h-2 w-2 animate-pulse rounded-full bg-emerald-500'></div>
                      <span className='text-sm font-medium text-emerald-700 dark:text-emerald-300'>
                        In Development
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
