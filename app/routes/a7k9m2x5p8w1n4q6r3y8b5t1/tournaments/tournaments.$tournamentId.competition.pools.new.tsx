import { JSX } from 'react'
import { redirect, useActionData, useLoaderData, useNavigation } from 'react-router'

import { Category } from '@prisma/client'

import { ActionButton } from '~/components/buttons/ActionButton'
import { TextInputField } from '~/components/inputs/TextInputField'
import { createPoolSet, getTeamsByCategories } from '~/models/pool.server'
import { getTournamentById } from '~/models/tournament.server'
import { invariant } from '~/utils/misc'
import { requireAdminUser } from '~/utils/rbacMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'

import type { Route } from './+types/tournaments.$tournamentId.competition.pools.new'

type LoaderData = {
  readonly tournament: {
    readonly id: string
    readonly name: string
    readonly categories: readonly Category[]
  }
  readonly availableTeamsCount: Record<Category, number>
}

type ActionData = {
  readonly errors?: {
    name?: string
    categories?: string
    configPools?: string
    configSlots?: string
    general?: string
  }
  readonly fieldValues?: {
    name: string
    categories: string[]
    configPools: string
    configSlots: string
    autoFill: boolean
  }
}

export const handle: RouteMetadata = {
  isPublic: false,
  title: 'Create Pool Set',
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

  // Count available teams by category
  const availableTeamsCount = {} as Record<Category, number>

  for (const category of tournament.categories as Category[]) {
    const teams = await getTeamsByCategories(tournamentId, [category])
    availableTeamsCount[category] = teams.length
  }

  return {
    tournament: {
      id: tournament.id,
      name: tournament.name,
      categories: tournament.categories as Category[],
    },
    availableTeamsCount,
  }
}

export async function action({
  request,
  params,
}: Route.ActionArgs): Promise<ActionData | Response> {
  await requireAdminUser(request)

  const { tournamentId } = params as { tournamentId: string }
  invariant(tournamentId, 'Tournament ID is required')

  const formData = await request.formData()
  const name = formData.get('name')?.toString() || ''
  const selectedCategories = formData.getAll('categories') as string[]
  const configPools = formData.get('configPools')?.toString() || ''
  const configSlots = formData.get('configSlots')?.toString() || ''
  const autoFill = formData.get('autoFill') === 'on'

  // Validation
  const errors = {} as NonNullable<ActionData['errors']>

  if (!name.trim()) {
    errors.name = 'Pool set name is required'
  }

  if (selectedCategories.length === 0) {
    errors.categories = 'At least one category must be selected'
  }

  const poolsNum = parseInt(configPools, 10)
  if (!configPools || isNaN(poolsNum) || poolsNum < 2 || poolsNum > 8) {
    errors.configPools = 'Number of pools must be between 2 and 8'
  }

  const slotsNum = parseInt(configSlots, 10)
  if (!configSlots || isNaN(slotsNum) || slotsNum < 3 || slotsNum > 10) {
    errors.configSlots = 'Teams per pool must be between 3 and 10'
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      fieldValues: {
        name,
        categories: selectedCategories,
        configPools,
        configSlots,
        autoFill,
      },
    }
  }

  try {
    const poolSetId = await createPoolSet({
      tournamentId,
      name: name.trim(),
      categories: selectedCategories as Category[],
      configPools: poolsNum,
      configSlots: slotsNum,
      autoFill,
    })

    return redirect(
      `/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/${tournamentId}/competition/pools/${poolSetId}`
    )
  } catch (_error) {
    return {
      errors: { general: 'Failed to create pool set. Please try again.' },
      fieldValues: {
        name,
        categories: selectedCategories,
        configPools,
        configSlots,
        autoFill,
      },
    }
  }
}

export default function CreatePoolSet(): JSX.Element {
  const { tournament, availableTeamsCount } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  // Calculate total teams for selected categories
  const selectedCategories = actionData?.fieldValues?.categories || []
  const totalSelectedTeams = selectedCategories.reduce(
    (sum, category) => sum + (availableTeamsCount[category as Category] || 0),
    0
  )

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold'>Create Pool Set</h2>
        <p className='mt-2 text-gray-600'>
          Set up round-robin pools for {tournament.name}
        </p>
      </div>

      <div className='max-w-2xl'>
        <form method='post' className='space-y-6'>
          {actionData?.errors?.general ? (
            <div className='rounded-md bg-red-50 p-4'>
              <p className='text-sm text-red-700'>{actionData.errors.general}</p>
            </div>
          ) : null}

          {/* Pool Set Name */}
          <TextInputField
            name='name'
            label='Pool Set Name'
            placeholder='e.g., Group Stage, Qualifiers'
            defaultValue={actionData?.fieldValues?.name || ''}
            error={actionData?.errors?.name}
            required
          />

          {/* Categories Selection */}
          <div>
            <label className='mb-3 block text-sm font-medium text-gray-700'>
              Age Categories
            </label>
            <p className='mb-3 text-sm text-gray-500'>
              Select which age categories will participate in this pool set
            </p>
            <div className='space-y-2'>
              {tournament.categories.map(category => (
                <label key={category} className='flex items-center space-x-3'>
                  <input
                    type='checkbox'
                    name='categories'
                    value={category}
                    defaultChecked={actionData?.fieldValues?.categories?.includes(
                      category
                    )}
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm font-medium'>{category}</span>
                  <span className='text-xs text-gray-500'>
                    ({availableTeamsCount[category]} teams available)
                  </span>
                </label>
              ))}
            </div>
            {actionData?.errors?.categories ? (
              <p className='mt-1 text-sm text-red-600'>
                {actionData.errors.categories}
              </p>
            ) : null}
          </div>

          {/* Configuration */}
          <div className='grid grid-cols-2 gap-4'>
            <TextInputField
              name='configPools'
              label='Number of Pools'
              type='text'
              placeholder='4'
              defaultValue={actionData?.fieldValues?.configPools || ''}
              error={actionData?.errors?.configPools}
              required
            />

            <TextInputField
              name='configSlots'
              label='Teams per Pool'
              type='text'
              placeholder='6'
              defaultValue={actionData?.fieldValues?.configSlots || ''}
              error={actionData?.errors?.configSlots}
              required
            />
          </div>

          {/* Auto-fill Option */}
          <div>
            <label className='flex items-start space-x-3'>
              <input
                type='checkbox'
                name='autoFill'
                defaultChecked={actionData?.fieldValues?.autoFill ?? true}
                className='mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <div>
                <span className='text-sm font-medium'>Auto-fill pools</span>
                <p className='text-xs text-gray-500'>
                  Automatically assign teams to Reserve and distribute them to pools
                  round-robin
                </p>
              </div>
            </label>
          </div>

          {/* Summary */}
          {selectedCategories.length > 0 ? (
            <div className='rounded-lg bg-blue-50 p-4'>
              <h4 className='text-sm font-medium text-blue-900'>Summary</h4>
              <p className='mt-1 text-xs text-blue-700'>
                {totalSelectedTeams} teams available in selected categories
              </p>
              {actionData?.fieldValues?.configPools &&
              actionData?.fieldValues?.configSlots ? (
                <p className='text-xs text-blue-700'>
                  Will create {actionData.fieldValues.configPools} pools with{' '}
                  {actionData.fieldValues.configSlots} slots each (
                  {parseInt(actionData.fieldValues.configPools, 10) *
                    parseInt(actionData.fieldValues.configSlots, 10)}{' '}
                  total slots)
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Actions */}
          <div className='flex justify-end space-x-3'>
            <ActionButton
              type='button'
              variant='secondary'
              onClick={() => window.history.back()}
            >
              Cancel
            </ActionButton>
            <ActionButton type='submit' variant='primary' disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Pool Set'}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  )
}
