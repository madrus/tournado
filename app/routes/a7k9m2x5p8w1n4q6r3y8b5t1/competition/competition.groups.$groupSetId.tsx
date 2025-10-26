import { JSX } from 'react'
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router'

import type { Category } from '@prisma/client'

import { ActionButton } from '~/components/buttons/ActionButton'
import { TextInputField } from '~/components/inputs/TextInputField'
import type { GroupSetWithDetails, UnassignedTeam } from '~/models/group.server'
import {
  assignTeamToGroupSlot,
  clearGroupSlot,
  getGroupSetWithDetails,
  getTeamsByCategories,
  moveTeamToReserve,
  swapGroupSlots,
} from '~/models/group.server'
import { getTournamentById } from '~/models/tournament.server'
import { invariant } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

import type { Route } from './+types/competition.groups.$groupSetId'

type LoaderData = {
  readonly groupSet: GroupSetWithDetails
  readonly availableTeams: readonly UnassignedTeam[]
  readonly tournamentId: string
}

type ActionData = {
  readonly error?: string
}

export const handle: RouteMetadata = {
  authorization: {
    requiredRoles: ['REFEREE', 'MANAGER', 'ADMIN'],
  },
}

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireUserWithMetadata(request, handle)

  const { groupSetId } = params
  invariant(groupSetId, 'groupSetId is required')

  const groupSet = await getGroupSetWithDetails(groupSetId)
  if (!groupSet) throw new Response('Group set not found', { status: 404 })

  // Derive tournamentId from groupSet - this is the source of truth
  const tournamentId = groupSet.tournamentId

  // Validate query param if provided
  const url = new URL(request.url)
  const queryTournamentId = url.searchParams.get('tournament')
  if (queryTournamentId && queryTournamentId !== tournamentId) {
    throw new Response(
      'Tournament ID mismatch: query parameter does not match group set tournament',
      { status: 400 }
    )
  }

  const tournament = await getTournamentById({ id: tournamentId })
  if (!tournament) throw new Response('Tournament not found', { status: 404 })

  const categories = (groupSet.categories as Category[]).slice()
  const availableTeams = await getTeamsByCategories(tournamentId, categories)

  return { groupSet, availableTeams, tournamentId }
}

export async function action({
  request,
  params,
}: Route.ActionArgs): Promise<ActionData | Response> {
  await requireUserWithMetadata(request, handle)

  const { groupSetId } = params
  invariant(groupSetId, 'groupSetId is required')

  // Fetch groupSet to derive tournamentId - don't trust query params
  const groupSet = await getGroupSetWithDetails(groupSetId)
  if (!groupSet) throw new Response('Group set not found', { status: 404 })

  // Derive tournamentId from groupSet - this is the source of truth
  const tournamentId = groupSet.tournamentId

  // Validate query param if provided (optional validation)
  const url = new URL(request.url)
  const queryTournamentId = url.searchParams.get('tournament')
  if (queryTournamentId && queryTournamentId !== tournamentId) {
    throw new Response(
      'Tournament ID mismatch: query parameter does not match group set tournament',
      { status: 400 }
    )
  }

  const formData = await request.formData()
  const intent = formData.get('intent')?.toString()

  try {
    if (intent === 'assign') {
      const groupId = formData.get('groupId')?.toString() || ''
      const slotIndex = Number(formData.get('slotIndex'))
      const teamId = formData.get('teamId')?.toString() || ''
      invariant(groupId && !Number.isNaN(slotIndex) && teamId, 'Invalid assign payload')
      // assignTeamToGroupSlot now validates tournament consistency internally
      await assignTeamToGroupSlot({ groupSetId, groupId, slotIndex, teamId })
    } else if (intent === 'clear') {
      const groupSlotId = formData.get('groupSlotId')?.toString() || ''
      invariant(groupSlotId, 'Invalid clear payload')
      await clearGroupSlot({ groupSlotId })
    } else if (intent === 'reserve') {
      const teamId = formData.get('teamId')?.toString() || ''
      invariant(teamId, 'Invalid reserve payload')
      // moveTeamToReserve now validates tournament consistency internally
      await moveTeamToReserve({ groupSetId, teamId })
    } else if (intent === 'swap') {
      const sourceSlotId = formData.get('sourceSlotId')?.toString() || ''
      const targetSlotId = formData.get('targetSlotId')?.toString() || ''
      invariant(sourceSlotId && targetSlotId, 'Invalid swap payload')
      await swapGroupSlots({ sourceSlotId, targetSlotId })
    }

    // Use derived tournamentId in redirect
    return redirect(
      `/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups/${groupSetId}?tournament=${tournamentId}`
    )
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function GroupSetDetails(): JSX.Element {
  const { groupSet, availableTeams, tournamentId } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>{groupSet.name}</h2>
          <p className='text-foreground-light mt-1'>Manage team assignments</p>
        </div>
        <Link
          to={`/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups?tournament=${tournamentId}`}
          className='text-primary-600 underline'
        >
          Back to Groups
        </Link>
      </div>

      {actionData?.error ? (
        <div className='rounded-md bg-red-50 p-4 text-red-700'>{actionData.error}</div>
      ) : null}

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-4 lg:col-span-2'>
          {groupSet.groups.map(group => (
            <div key={group.id} className='border-border rounded-lg border p-4'>
              <h3 className='text-lg font-semibold'>{group.name}</h3>
              <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'>
                {group.slots.map(slot => (
                  <div key={slot.id} className='border-border rounded-md border p-3'>
                    {slot.team ? (
                      <div className='space-y-2'>
                        <div className='text-sm'>
                          <span className='font-medium'>{slot.team.clubName}</span>{' '}
                          <span className='text-foreground-light'>
                            {slot.team.name} ({slot.team.category})
                          </span>
                        </div>
                        <Form method='post' className='flex gap-2'>
                          <input type='hidden' name='intent' value='clear' />
                          <input type='hidden' name='groupSlotId' value={slot.id} />
                          <ActionButton
                            type='submit'
                            variant='secondary'
                            disabled={isSubmitting}
                          >
                            Clear
                          </ActionButton>
                        </Form>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <Form method='post' className='space-y-2'>
                          <input type='hidden' name='intent' value='assign' />
                          <input type='hidden' name='groupId' value={group.id} />
                          <input
                            type='hidden'
                            name='slotIndex'
                            value={slot.slotIndex}
                          />
                          <TextInputField
                            name='teamId'
                            label='Assign team'
                            placeholder='Paste team ID'
                            required
                          />
                          <ActionButton
                            type='submit'
                            variant='primary'
                            disabled={isSubmitting}
                          >
                            Assign
                          </ActionButton>
                        </Form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='space-y-4'>
          <div className='border-border rounded-lg border p-4'>
            <h3 className='text-lg font-semibold'>Reserve</h3>
            <div className='mt-3 space-y-2'>
              {groupSet.reserveSlots.length === 0 ? (
                <p className='text-foreground-light text-sm'>No teams in reserve</p>
              ) : (
                groupSet.reserveSlots.map(slot => (
                  <div key={slot.id} className='flex items-center justify-between'>
                    <div className='text-sm'>
                      {slot.team ? (
                        <>
                          <span className='font-medium'>{slot.team.clubName}</span>{' '}
                          <span className='text-foreground-light'>
                            {slot.team.name} ({slot.team.category})
                          </span>
                        </>
                      ) : (
                        <span className='text-foreground-light'>Empty</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className='border-border rounded-lg border p-4'>
            <h3 className='text-lg font-semibold'>Available teams</h3>
            <div className='mt-3 space-y-2'>
              {availableTeams.length === 0 ? (
                <p className='text-foreground-light text-sm'>No unassigned teams</p>
              ) : (
                availableTeams.map(team => (
                  <div key={team.id} className='flex items-center justify-between'>
                    <div className='text-sm'>
                      <span className='font-medium'>{team.clubName}</span>{' '}
                      <span className='text-foreground-light'>
                        {team.name} ({team.category})
                      </span>
                    </div>
                    <Form method='post'>
                      <input type='hidden' name='intent' value='reserve' />
                      <input type='hidden' name='teamId' value={team.id} />
                      <ActionButton
                        type='submit'
                        variant='secondary'
                        disabled={isSubmitting}
                      >
                        Move to reserve
                      </ActionButton>
                    </Form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export for React Router
export default GroupSetDetails
