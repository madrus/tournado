import { JSX } from 'react'
import { Link, type MetaFunction, useLoaderData } from 'react-router'

import type { Category } from '@prisma/client'

import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { SportsIcon } from '~/components/icons'
import type { TournamentListItem } from '~/features/tournaments/types'
import type { GroupSetListItem } from '~/models/group.server'
import { getTournamentGroupSets } from '~/models/group.server'
import { getAllTournaments } from '~/models/tournament.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

import type { Route } from './+types/competition.groups'

type LoaderData = {
  readonly groupSets: readonly GroupSetListItem[]
  readonly tournamentListItems: readonly TournamentListItem[]
  readonly selectedTournamentId: string | undefined
}

export const meta: MetaFunction<typeof loader> = () => [
  { title: 'Groups Management | Tournado' },
  { name: 'description', content: 'Manage tournament groups and team assignments' },
]

export const handle: RouteMetadata = {
  authorization: {
    requiredRoles: ['REFEREE', 'MANAGER', 'ADMIN'],
  },
}

export async function loader({
  request,
  params: _params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireUserWithMetadata(request, handle)

  // Get tournament ID from search params
  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')

  // Load tournament list and group sets in parallel
  const [tournamentListItemsRaw, groupSets] = await Promise.all([
    getAllTournaments(),
    tournamentId ? getTournamentGroupSets(tournamentId) : Promise.resolve([]),
  ])

  // Serialize dates to ISO strings for JSON transport
  const tournamentListItems = tournamentListItemsRaw.map(tournament => ({
    ...tournament,
    startDate: tournament.startDate.toISOString(),
    endDate: tournament.endDate?.toISOString() || null,
  }))

  return {
    groupSets,
    tournamentListItems,
    selectedTournamentId: tournamentId || undefined,
  }
}

const formatCategories = (categories: readonly Category[]): string =>
  categories.join(', ')

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

export default function GroupsTab(): JSX.Element {
  const { groupSets, selectedTournamentId } = useLoaderData<LoaderData>()

  return (
    <div className='space-y-6'>
      {/* Header with Tournament Filter */}
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='text-foreground text-lg font-semibold'>Group Sets</h4>
          <p className='text-foreground-light mt-1'>
            Create and manage group sets for round-robin play
          </p>
        </div>

        {selectedTournamentId ? (
          <ActionLinkButton
            to={`new?tournament=${selectedTournamentId}`}
            label='Create Group Set'
            variant='primary'
            icon='add'
          />
        ) : null}
      </div>

      {/* Group Sets Grid */}
      {!selectedTournamentId ? (
        <div className='border-border bg-accent rounded-xl border-2 border-dashed py-12 text-center'>
          <div className='mx-auto max-w-md'>
            <SportsIcon className='text-foreground-lighter mx-auto h-12 w-12' />
            <h3 className='text-foreground mt-4 text-lg font-semibold'>
              Select a Tournament
            </h3>
            <p className='text-foreground-light mt-2'>
              Choose a tournament from the dropdown above to manage its group sets.
            </p>
          </div>
        </div>
      ) : groupSets.length === 0 ? (
        <div className='border-border bg-accent rounded-xl border-2 border-dashed py-12 text-center'>
          <div className='mx-auto max-w-md'>
            <SportsIcon className='text-foreground-lighter mx-auto h-12 w-12' />
            <h3 className='text-foreground mt-4 text-lg font-semibold'>
              No group sets yet
            </h3>
            <p className='text-foreground-light mt-2'>
              Get started by creating your first group set for round-robin group play.
            </p>
          </div>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {groupSets.map(groupSet => (
            <Link
              key={groupSet.id}
              to={`${groupSet.id}?tournament=${selectedTournamentId}`}
              className='group border-border bg-background relative rounded-lg border p-4 shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:outline-none'
            >
              {/* Header with icon and badge */}
              <div className='flex items-start justify-between'>
                <div className='flex items-center'>
                  <div className='rounded-lg bg-fuchsia-50 p-2 transition-colors group-hover:bg-fuchsia-100'>
                    <SportsIcon className='h-5 w-5 text-fuchsia-600' />
                  </div>
                  <h3 className='text-foreground ml-3 text-base font-semibold transition-colors group-hover:text-fuchsia-600'>
                    {groupSet.name}
                  </h3>
                </div>
                <div className='rounded-full bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700'>
                  {groupSet.configGroups} groups
                </div>
              </div>

              {/* Content */}
              <div className='mt-4 space-y-2'>
                <div className='flex items-center text-sm'>
                  <span className='text-foreground w-20 font-medium'>Categories:</span>
                  <span className='text-foreground-light flex-1'>
                    {formatCategories(groupSet.categories)}
                  </span>
                </div>
                <div className='flex items-center text-sm'>
                  <span className='text-foreground w-20 font-medium'>Setup:</span>
                  <span className='text-foreground-light'>
                    {groupSet.configGroups} groups × {groupSet.configSlots} teams
                  </span>
                </div>
                <div className='flex items-center text-sm'>
                  <span className='text-foreground w-20 font-medium'>Auto-fill:</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      groupSet.autoFill
                        ? 'bg-green-100 text-green-800'
                        : 'bg-accent text-foreground-light'
                    }`}
                  >
                    {groupSet.autoFill ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className='flex items-center text-sm'>
                  <span className='text-foreground w-20 font-medium'>Created:</span>
                  <span className='text-foreground-lighter text-xs'>
                    {formatDate(groupSet.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
