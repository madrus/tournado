import { JSX } from 'react'
import { Link, type MetaFunction, useLoaderData } from 'react-router'

import type { Category } from '@prisma/client'

import { ActionButton } from '~/components/buttons/ActionButton'
import { SportsIcon } from '~/components/icons'
import { getTournamentPoolSets, type PoolSetListItem } from '~/models/pool.server'
import { invariant } from '~/utils/misc'
import { requireAdminUser } from '~/utils/rbacMiddleware.server'

import type { Route } from './+types/tournaments.$tournamentId.competition.pools'

type LoaderData = {
  readonly poolSets: readonly PoolSetListItem[]
  readonly tournamentId: string
}

export const meta: MetaFunction<typeof loader> = () => [
  { title: 'Pools Management | Tournado' },
  { name: 'description', content: 'Manage tournament pools and team assignments' },
]

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireAdminUser(request)

  const { tournamentId } = params as { tournamentId: string }
  invariant(tournamentId, 'Tournament ID is required')

  const poolSets = await getTournamentPoolSets(tournamentId)

  return {
    poolSets,
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

export default function PoolsTab(): JSX.Element {
  const { poolSets } = useLoaderData<LoaderData>()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>Pool Sets</h2>
          <p className='mt-1 text-sm text-gray-500'>
            Create and manage pool groups for round-robin play
          </p>
        </div>

        <Link to='pools/new'>
          <ActionButton variant='primary' icon='add'>
            Create Pool Set
          </ActionButton>
        </Link>
      </div>

      {/* Pool Sets Grid */}
      {poolSets.length === 0 ? (
        <div className='py-12 text-center'>
          <SportsIcon className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-2 text-sm font-semibold text-gray-900'>No pool sets</h3>
          <p className='mt-1 text-sm text-gray-500'>
            Get started by creating a new pool set for round-robin group play.
          </p>
          <div className='mt-6'>
            <Link to='pools/new'>
              <ActionButton variant='primary' icon='add'>
                Create Pool Set
              </ActionButton>
            </Link>
          </div>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {poolSets.map(poolSet => (
            <Link
              key={poolSet.id}
              to={`pools/${poolSet.id}`}
              className='group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              <div className='flex items-center'>
                <SportsIcon className='h-6 w-6 text-blue-600 group-hover:text-blue-700' />
                <h3 className='ml-3 text-lg font-semibold text-gray-900 group-hover:text-gray-700'>
                  {poolSet.name}
                </h3>
              </div>

              <div className='mt-4 space-y-2 text-sm text-gray-500'>
                <p>
                  <span className='font-medium'>Categories:</span>{' '}
                  {formatCategories(poolSet.categories)}
                </p>
                <p>
                  <span className='font-medium'>Configuration:</span>{' '}
                  {poolSet.configPools} pools x {poolSet.configSlots} teams
                </p>
                <p>
                  <span className='font-medium'>Auto-fill:</span>{' '}
                  {poolSet.autoFill ? 'Enabled' : 'Disabled'}
                </p>
                <p>
                  <span className='font-medium'>Created:</span>{' '}
                  {formatDate(poolSet.createdAt)}
                </p>
              </div>

              <div className='absolute top-4 right-4'>
                <div className='flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700'>
                  {poolSet.configPools} pools
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
