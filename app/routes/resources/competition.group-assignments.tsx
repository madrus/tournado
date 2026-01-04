import type { ActionFunctionArgs } from 'react-router'

import {
	batchSaveGroupAssignments,
	deleteTeamFromGroupStage,
	getGroupStageWithDetails,
} from '~/models/group.server'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'

type SlotAssignment = {
	groupId: string
	slotIndex: number
	teamId: string
}

type SaveResponse = {
	success: boolean
	error?: string
	conflict?: boolean
}

type CancelResponse = {
	success: boolean
	snapshot?: unknown
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
				assignments = JSON.parse(assignmentsJson)
			} catch {
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
				console.error('Failed to save group assignments:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Failed to save assignments',
				}
			}
		}

		case 'cancel': {
			const groupStageId = formData.get('groupStageId')?.toString()

			if (!groupStageId) {
				return { success: false }
			}

			try {
				const snapshot = await getGroupStageWithDetails(groupStageId)
				return { success: true, snapshot }
			} catch {
				return { success: false }
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
				console.error('Failed to delete team from group stage:', error)
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Failed to delete team',
				}
			}
		}

		default:
			return { success: false, error: 'Unknown intent' }
	}
}
