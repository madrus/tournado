import { JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLoaderData } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { SportsIcon, TrophyIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import { TournamentFilter } from '~/components/TournamentFilter'
import type { TournamentListItem } from '~/lib/lib.types'
import {
  getAllTournamentListItems,
  getTournamentById,
} from '~/models/tournament.server'
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
  readonly tournamentListItems: readonly TournamentListItem[]
  readonly selectedTournamentId: string | undefined
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

  // Get tournament ID from search params
  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')

  // Load tournament list and current tournament in parallel
  const [tournamentListItems, tournament] = await Promise.all([
    getAllTournamentListItems(),
    tournamentId ? getTournamentById({ id: tournamentId }) : Promise.resolve(null),
  ])

  return {
    tournament: tournament
      ? {
          id: tournament.id,
          name: tournament.name,
          location: tournament.location,
        }
      : null,
    tournamentListItems,
    selectedTournamentId: tournamentId || undefined,
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
  const { tournamentListItems, selectedTournamentId } = useLoaderData<LoaderData>()
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
        <div className='flex items-center'>
          <TournamentFilter
            tournamentListItems={tournamentListItems}
            selectedTournamentId={selectedTournamentId}
            className='min-w-64'
            color='emerald'
            label='Tournament'
            placeholder='Choose tournament'
            showAllOption={false}
          />
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

        {/* Tab Content - Render nested routes */}
        <div className='relative'>
          <Panel color='emerald' className='rounded-t-none border-t-0 shadow-lg'>
            <Outlet />
          </Panel>
        </div>
      </div>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
