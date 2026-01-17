import type { Category } from '@prisma/client'
import type { JSX } from 'react'
import { redirect, useActionData, useLoaderData } from 'react-router'
import { CompetitionGroupStageDetails } from '~/features/competition/components'
import { getServerT } from '~/i18n/i18n.server'
import type { GroupStageWithDetails, UnassignedTeam } from '~/models/group.server'
import {
  assignTeamToGroupSlot,
  canDeleteGroupStage,
  clearGroupSlot,
  deleteGroupStage,
  getGroupStageWithDetails,
  getUnassignedTeamsByCategories,
  moveTeamToReserve,
  swapGroupSlots,
} from '~/models/group.server'
import { getTournamentById } from '~/models/tournament.server'
import { adminPath } from '~/utils/adminRoutes'
import { invariant } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import type { Route } from './+types/competition.groups.$groupStageId'

type LoaderData = {
  readonly groupStage: GroupStageWithDetails
  readonly availableTeams: readonly UnassignedTeam[]
  readonly tournamentId: string
  readonly tournamentCreatedBy: string
  readonly deleteImpact: {
    groups: number
    assignedTeams: number
    matchesToDelete: number
  }
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

  const { groupStageId } = params
  invariant(groupStageId, 'groupStageId is required')

  const groupStage = await getGroupStageWithDetails(groupStageId)
  if (!groupStage) throw new Response('Group stage not found', { status: 404 })

  // Derive tournamentId from groupStage - this is the source of truth
  const tournamentId = groupStage.tournamentId

  // Validate query param if provided
  const url = new URL(request.url)
  const queryTournamentId = url.searchParams.get('tournament')
  if (queryTournamentId && queryTournamentId !== tournamentId) {
    throw new Response(
      'Tournament ID mismatch: query parameter does not match the selected tournament',
      { status: 400 },
    )
  }

  const tournament = await getTournamentById({ id: tournamentId })
  if (!tournament) throw new Response('Tournament not found', { status: 404 })

  const availableTeams = await getUnassignedTeamsByCategories(
    tournamentId,
    groupStage.categories as Category[],
  )

  const deleteImpact = await canDeleteGroupStage(groupStageId)

  return {
    groupStage,
    availableTeams,
    tournamentId,
    tournamentCreatedBy: tournament.createdBy,
    deleteImpact: deleteImpact.impact,
  }
}

export async function action({
  request,
  params,
}: Route.ActionArgs): Promise<ActionData | Response> {
  const user = await requireUserWithMetadata(request, handle)
  const t = getServerT(request)

  const { groupStageId } = params
  invariant(groupStageId, 'groupStageId is required')

  // Fetch groupStage to derive tournamentId - don't trust query params
  const groupStage = await getGroupStageWithDetails(groupStageId)
  if (!groupStage) throw new Response('Group stage not found', { status: 404 })

  // Derive tournamentId from groupStage - this is the source of truth
  const tournamentId = groupStage.tournamentId

  // Validate query param if provided (optional validation)
  const url = new URL(request.url)
  const queryTournamentId = url.searchParams.get('tournament')
  if (queryTournamentId && queryTournamentId !== tournamentId) {
    throw new Response(
      'Tournament ID mismatch: query parameter does not match the selected tournament',
      { status: 400 },
    )
  }

  const formData = await request.formData()
  const intent = formData.get('intent')?.toString()

  try {
    switch (intent) {
      case 'delete': {
        if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
          throw new Response('Unauthorized', { status: 403 })
        }

        if (user.role === 'MANAGER') {
          const tournament = await getTournamentById({ id: tournamentId })
          if (!tournament) throw new Response('Tournament not found', { status: 404 })

          const isOwner =
            tournament.createdBy === user.id || groupStage.createdBy === user.id

          if (!isOwner) {
            throw new Response('Unauthorized', { status: 403 })
          }
        }

        const deleteCheck = await canDeleteGroupStage(groupStageId)
        if (!deleteCheck.canDelete) {
          const reason =
            deleteCheck.reason === 'This group stage has matches with recorded results'
              ? t('groupAssignment.errors.deleteBlockedReason')
              : deleteCheck.reason

          return {
            error: reason
              ? t('groupAssignment.errors.deleteBlocked', { reason })
              : t('errors.somethingWentWrong'),
          }
        }

        await deleteGroupStage(groupStageId)

        return redirect(
          adminPath(`/competition/groups?tournament=${tournamentId}&success=deleted`),
        )
      }
      case 'assign': {
        const groupId = formData.get('groupId')?.toString() || ''
        const slotIndex = Number(formData.get('slotIndex'))
        const teamId = formData.get('teamId')?.toString() || ''
        invariant(
          groupId && !Number.isNaN(slotIndex) && teamId,
          'Invalid assign payload',
        )
        // assignTeamToGroupSlot now validates tournament consistency internally
        await assignTeamToGroupSlot({ groupStageId, groupId, slotIndex, teamId })
        break
      }
      case 'clear': {
        const groupSlotId = formData.get('groupSlotId')?.toString() || ''
        invariant(groupSlotId, 'Invalid clear payload')
        await clearGroupSlot({ groupSlotId })
        break
      }
      case 'reserve': {
        const teamId = formData.get('teamId')?.toString() || ''
        invariant(teamId, 'Invalid reserve payload')
        // moveTeamToReserve now validates tournament consistency internally
        await moveTeamToReserve({ groupStageId, teamId })
        break
      }
      case 'swap': {
        const sourceSlotId = formData.get('sourceSlotId')?.toString() || ''
        const targetSlotId = formData.get('targetSlotId')?.toString() || ''
        invariant(sourceSlotId && targetSlotId, 'Invalid swap payload')
        await swapGroupSlots({ sourceSlotId, targetSlotId })
        break
      }
      default:
        break
    }

    if (intent === 'reserve') {
      return {}
    }

    // Use derived tournamentId in redirect
    return redirect(
      adminPath(`/competition/groups/${groupStageId}?tournament=${tournamentId}`),
    )
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }

    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function GroupStageDetails(): JSX.Element {
  const {
    groupStage,
    availableTeams,
    tournamentId,
    tournamentCreatedBy,
    deleteImpact,
  } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()

  return (
    <CompetitionGroupStageDetails
      groupStage={groupStage}
      availableTeams={availableTeams}
      tournamentId={tournamentId}
      tournamentCreatedBy={tournamentCreatedBy}
      deleteImpact={deleteImpact}
      actionData={actionData}
    />
  )
}

// Default export for React Router
export default GroupStageDetails
