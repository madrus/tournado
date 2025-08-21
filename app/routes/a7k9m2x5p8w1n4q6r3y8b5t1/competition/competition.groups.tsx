import { JSX } from 'react'
import { Link, type MetaFunction, useLoaderData } from 'react-router'

import type { Category } from '@prisma/client'

import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { SportsIcon } from '~/components/icons'
import type { GroupSetListItem } from '~/models/group.server'
import { getTournamentGroupSets } from '~/models/group.server'
import { invariant } from '~/utils/misc'
import { requireAdminUser } from '~/utils/rbacMiddleware.server'

import type { Route } from './+types/competition.groups'

type LoaderData = {
  readonly groupSets: readonly GroupSetListItem[]
  readonly tournamentId: string
}

export const meta: MetaFunction<typeof loader> = () => [
  { title: 'Groups Management | Tournado' },
  { name: 'description', content: 'Manage tournament groups and team assignments' },
]

export async function loader({
  request,
  params: _params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireAdminUser(request)

  // Get tournament ID from search params since competition is now top-level
  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')
  invariant(tournamentId, 'Tournament ID is required')

  const groupSets = await getTournamentGroupSets(tournamentId)

  return {
    groupSets,
    tournamentId,
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
  const { groupSets, tournamentId } = useLoaderData<LoaderData>()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='text-foreground text-lg font-semibold'>Group Sets</h4>
          <p className='text-foreground-light mt-1'>
            Create and manage group sets for round-robin play
          </p>
        </div>

        <ActionLinkButton
          to={`groups/new?tournament=${tournamentId}`}
          label='Create Group Set'
          variant='primary'
          icon='add'
        />
      </div>

      {/* Group Sets Grid */}
      {groupSets.length === 0 ? (
        <div className='border-border bg-accent rounded-xl border-2 border-dashed py-12 text-center'>
          <div className='mx-auto max-w-md'>
            <SportsIcon className='text-foreground-lighter mx-auto h-12 w-12' />
            <h3 className='text-foreground mt-4 text-lg font-semibold'>
              No group sets yet
            </h3>
            <p className='text-foreground-light mt-2'>
              Get started by creating your first group set for round-robin group play.
            </p>
            <div className='mt-6'>
              <ActionLinkButton
                to={`groups/new?tournament=${tournamentId}`}
                label='Create Your First Group Set'
                variant='primary'
                icon='add'
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {groupSets.map(groupSet => (
            <Link
              key={groupSet.id}
              to={`groups/${groupSet.id}?tournament=${tournamentId}`}
              className='group border-border bg-background relative rounded-lg border p-4 shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none'
            >
              {/* Header with icon and badge */}
              <div className='flex items-start justify-between'>
                <div className='flex items-center'>
                  <div className='rounded-lg bg-emerald-50 p-2 transition-colors group-hover:bg-emerald-100'>
                    <SportsIcon className='h-5 w-5 text-emerald-600' />
                  </div>
                  <h3 className='text-foreground ml-3 text-base font-semibold transition-colors group-hover:text-emerald-600'>
                    {groupSet.name}
                  </h3>
                </div>
                <div className='rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700'>
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
