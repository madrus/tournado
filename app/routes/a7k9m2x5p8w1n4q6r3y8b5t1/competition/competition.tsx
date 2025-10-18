import { JSX, useState } from 'react'
import { Outlet, useLoaderData } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { SportsIcon, TrophyIcon } from '~/components/icons'
import { CompetitionLayoutHeader } from '~/components/layouts'
import { Panel } from '~/components/Panel'
import type { TournamentListItem } from '~/features/tournaments/types'
import {
  getAllTournamentListItems,
  getTournamentById,
} from '~/models/tournament.server'
import { cn } from '~/utils/misc'
import { requireAdminUser } from '~/utils/rbacMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'

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

  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')

  const [tournamentListItemsRaw, tournament] = await Promise.all([
    getAllTournamentListItems(),
    tournamentId ? getTournamentById({ id: tournamentId }) : Promise.resolve(null),
  ])

  // Serialize dates to strings for JSON transport
  const tournamentListItems = tournamentListItemsRaw.map(item => ({
    ...item,
    startDate: item.startDate.toISOString().split('T')[0],
    endDate: item.endDate.toISOString().split('T')[0],
  }))

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
  const [activeTab, setActiveTab] = useState<'groups' | 'playoffs'>('groups')

  return (
    <div className='w-full space-y-8'>
      {/* Page Header */}
      <CompetitionLayoutHeader
        variant='admin'
        tournamentListItems={tournamentListItems}
        selectedTournamentId={selectedTournamentId}
      />

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
                '-mb-px rounded-t-lg focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:outline-none',
                activeTab === tab.href
                  ? [
                      'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300',
                      'border-fuchsia-300 border-b-fuchsia-50 dark:border-fuchsia-700 dark:border-b-fuchsia-950/50',
                      'z-10 shadow-lg',
                    ]
                  : tab.disabled
                    ? [
                        'bg-background text-foreground-lighter cursor-not-allowed',
                        'border-border border-b-border',
                      ]
                    : [
                        'bg-background hover:bg-accent text-foreground-light hover:text-foreground',
                        'border-border border-b-border hover:border-fuchsia-200 dark:hover:border-fuchsia-800',
                      ]
              )}
            >
              <tab.icon
                className={cn(
                  'h-4 w-4',
                  activeTab === tab.href ? 'text-fuchsia-600 dark:text-fuchsia-400' : ''
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
          <Panel color='fuchsia' className='rounded-t-none border-t-0 shadow-lg'>
            <Outlet />
          </Panel>
        </div>
      </div>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
