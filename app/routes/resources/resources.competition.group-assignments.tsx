import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import type { GroupStageWithDetails } from '~/models/group.server'
import {
	batchSaveGroupAssignments,
	deleteTeamFromGroupStage,
	getGroupStageWithDetails,
} from '~/models/group.server'
import { logger } from '~/utils/logger.server'
import {
	checkRoleBasedRateLimit,
	requireUserWithPermission,
} from '~/utils/rbacMiddleware.server'

type SlotAssignment = {
	groupId: string
	slotIndex: number
	teamId: string
}

const SlotAssignmentSchema = z
	.object({
		groupId: z.string().min(1),
		slotIndex: z.number().int().nonnegative(),
		teamId: z.string().min(1),
	})
	.strict()

const AssignmentsSchema = z
	.array(SlotAssignmentSchema)
	.superRefine((assignments, context) => {
		const usedSlots = new Set<string>()
		const usedTeams = new Set<string>()

		assignments.forEach((assignment, index) => {
			const slotKey = `${assignment.groupId}:${assignment.slotIndex}`
			if (usedSlots.has(slotKey)) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: [index],
					message: 'Duplicate group slot assignment',
				})
			} else {
				usedSlots.add(slotKey)
			}

			if (usedTeams.has(assignment.teamId)) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: [index],
					message: 'Duplicate team assignment',
				})
			} else {
				usedTeams.add(assignment.teamId)
			}
		})
	})

type SaveResponse = {
	success: boolean
	error?: string
	conflict?: boolean
}

type CancelResponse = {
	success: boolean
	snapshot?: GroupStageWithDetails | null
	error?: string
}

type DeleteResponse = {
	success: boolean
	error?: string
}

export async function action({
	request,
}: ActionFunctionArgs): Promise<SaveResponse | CancelResponse | DeleteResponse> {
	// Require groups:manage permission
	await requireUserWithPermission(request, 'groups:manage')
	await checkRoleBasedRateLimit(request, 'group-assignments:batch-save')

	const formData = await request.formData()
	const intent = formData.get('intent')?.toString()

	switch (intent) {
		case 'save': {
			const groupStageId = formData.get('groupStageId')?.toString()
			const tournamentId = formData.get('tournamentId')?.toString()
			const updatedAt = formData.get('updatedAt')?.toString()
			const assignmentsJson = formData.get('assignments')?.toString()

			if (!groupStageId || !tournamentId || !updatedAt || !assignmentsJson) {
				return { success: false, error: 'Missing required fields' }
			}

			let assignments: SlotAssignment[]
			try {
				assignments = AssignmentsSchema.parse(JSON.parse(assignmentsJson))
			} catch (error) {
				logger.error({ err: error }, 'Invalid assignments format received')
				return { success: false, error: 'Invalid assignments format' }
			}

			try {
				// Check for conflicts by comparing updatedAt
				const currentGroupStage = await getGroupStageWithDetails(groupStageId)
				if (!currentGroupStage) {
					return { success: false, error: 'Group stage not found' }
				}

				// Compare timestamps to detect conflicts
				const clientUpdatedAt = new Date(updatedAt).getTime()
				const serverUpdatedAt = currentGroupStage.updatedAt.getTime()

				if (serverUpdatedAt > clientUpdatedAt) {
					return { success: false, conflict: true }
				}

				// Perform batch save
				await batchSaveGroupAssignments({
					groupStageId,
					tournamentId,
					assignments,
				})

				return { success: true }
			} catch (error) {
				logger.error({ err: error }, 'Failed to save group assignments')
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Failed to save assignments',
				}
			}
		}

		case 'cancel': {
			const groupStageId = formData.get('groupStageId')?.toString()

			if (!groupStageId) {
				return { success: false, error: 'Missing groupStageId' }
			}

			try {
				const snapshot = await getGroupStageWithDetails(groupStageId)
				return { success: true, snapshot }
			} catch (error) {
				logger.error({ err: error }, 'Failed to fetch group stage snapshot')
				return { success: false, error: 'Failed to fetch snapshot' }
			}
		}

		case 'delete': {
			const groupStageId = formData.get('groupStageId')?.toString()
			const teamId = formData.get('teamId')?.toString()

			if (!groupStageId || !teamId) {
				return { success: false, error: 'Missing required fields' }
			}

			try {
				await deleteTeamFromGroupStage({ groupStageId, teamId })
				return { success: true }
			} catch (error) {
				logger.error({ err: error }, 'Failed to delete team from group stage')
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Failed to delete team',
				}
			}
		}

		default:
			logger.warn({ intent }, 'Unknown intent received in group assignments action')
			return { success: false, error: 'Unknown intent' }
	}
}
