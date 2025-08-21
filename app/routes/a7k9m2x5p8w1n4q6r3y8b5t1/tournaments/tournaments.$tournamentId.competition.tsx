import { JSX } from 'react'
import { NavLink, Outlet, useLoaderData } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { SportsIcon, TrophyIcon } from '~/components/icons'
import { getTournamentById } from '~/models/tournament.server'
import { cn, invariant } from '~/utils/misc'
import { requireAdminUser } from '~/utils/rbacMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'

import type { Route } from './+types/tournaments.$tournamentId.competition'

type LoaderData = {
  readonly tournament: {
    readonly id: string
    readonly name: string
    readonly location: string
  }
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
  params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireAdminUser(request)

  const { tournamentId } = params as { tournamentId: string }
  invariant(tournamentId, 'Tournament ID is required')

  const tournament = await getTournamentById({ id: tournamentId })
  if (!tournament) {
    throw new Response('Tournament not found', { status: 404 })
  }

  return {
    tournament: {
      id: tournament.id,
      name: tournament.name,
      location: tournament.location,
    },
  }
}

const tabs = [
  {
    name: 'Pools',
    href: 'pools',
    icon: SportsIcon,
    description: 'Manage pool groups and team assignments',
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

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold'>Competition Management</h1>
        <p className='text-foreground mt-2 text-lg'>
          {tournament.name} - {tournament.location}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {tabs.map(tab => {
            const Icon = tab.icon

            if (tab.disabled) {
              return (
                <div
                  key={tab.name}
                  className='flex cursor-not-allowed items-center space-x-2 border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-400'
                  title='Coming Soon'
                >
                  <Icon className='h-5 w-5' />
                  <span>{tab.name}</span>
                  <span className='rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600'>
                    Soon
                  </span>
                </div>
              )
            }

            return (
              <NavLink
                key={tab.name}
                to={tab.href}
                className={({ isActive: _isActive }) =>
                  cn(
                    'flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium',
                    _isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )
                }
                title={tab.description}
              >
                {({ isActive: _isActive }) => {
                  const TabIcon = tab.icon
                  return (
                    <>
                      <TabIcon className='h-5 w-5' />
                      <span>{tab.name}</span>
                    </>
                  )
                }}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        <Outlet />
      </div>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
