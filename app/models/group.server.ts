import type { Category, Prisma } from '@prisma/client'

import { prisma } from '~/db.server'
import { safeParseJSON } from '~/utils/json'

// Re-export types for client-side usage
export type GroupSlotTeam = {
	readonly id: string
	readonly name: string
	readonly clubName: string
	readonly category: Category
}

export type GroupSlotWithTeam = {
	readonly id: string
	readonly slotIndex: number
	readonly team: GroupSlotTeam | null
}

export type ConfirmedSlotWithTeam = {
	readonly id: string
	readonly team: GroupSlotTeam | null
}

export type GroupWithSlots = {
	readonly id: string
	readonly name: string
	readonly order: number
	readonly slots: readonly GroupSlotWithTeam[]
}

export type GroupStageWithDetails = {
	readonly id: string
	readonly name: string
	readonly tournamentId: string
	readonly categories: readonly Category[]
	readonly configGroups: number
	readonly configSlots: number
	readonly createdAt: Date
	readonly updatedAt: Date
	readonly groups: readonly GroupWithSlots[]
	readonly confirmedSlots: readonly ConfirmedSlotWithTeam[]
}

export type GroupStageListItem = {
	readonly id: string
	readonly name: string
	readonly categories: readonly Category[]
	readonly configGroups: number
	readonly configSlots: number
	readonly createdAt: Date
	readonly updatedAt: Date
}

export type UnassignedTeam = {
	readonly id: string
	readonly name: string
	readonly clubName: string
	readonly category: Category
}

export type CreateGroupStageParams = {
	readonly tournamentId: string
	readonly name: string
	readonly categories: readonly Category[]
	readonly configGroups: number
	readonly configSlots: number
}

// Server-side functions
export async function createGroupStage({
	tournamentId,
	name,
	categories,
	configGroups,
	configSlots,
}: CreateGroupStageParams): Promise<string> {
	return await prisma.$transaction(async (tx) => {
		// Create the GroupStage
		const groupStage = await tx.groupStage.create({
			data: {
				tournamentId,
				name,
				categories: JSON.stringify(categories), // Store as JSON string
				configGroups,
				configSlots,
				autoFill: true,
			},
		})

		// Create groups (Group A, Group B, etc.)
		const groups = []
		for (let i = 0; i < configGroups; i++) {
			const charCode = 65 + i // Start from 'A' (ASCII 65)
			const groupName = `Group ${String.fromCharCode(charCode)}` // A, B, C, etc.
			const group = await tx.group.create({
				data: {
					groupStageId: groupStage.id,
					name: groupName,
					order: i,
				},
			})
			groups.push(group)
		}

		// Create all group slots in a single batch
		const groupSlotData = groups.flatMap((group) =>
			Array.from({ length: configSlots }, (_, slotIndex) => ({
				groupStageId: groupStage.id,
				groupId: group.id,
				slotIndex,
			})),
		)
		if (groupSlotData.length > 0) {
			await tx.groupSlot.createMany({ data: groupSlotData })
		}

		// Always auto-fill reserve with matching teams
		const matchingTeams = await tx.team.findMany({
			where: {
				tournamentId,
				category: { in: [...categories] },
				groupSlot: null, // Only teams not already assigned to any group
			},
		})

		// Create reserve slots for matching teams
		if (matchingTeams.length > 0) {
			await tx.groupSlot.createMany({
				data: matchingTeams.map((team) => ({
					groupStageId: groupStage.id,
					groupId: null, // Reserve slot
					slotIndex: 0, // Reserve doesn't need ordering
					teamId: team.id,
				})),
			})
		}

		return groupStage.id
	})
}

export async function getGroupStageWithDetails(
	groupStageId: string,
): Promise<GroupStageWithDetails | null> {
	const groupStage = await prisma.groupStage.findUnique({
		where: { id: groupStageId },
		include: {
			groups: {
				include: {
					slots: {
						include: {
							team: {
								select: {
									id: true,
									name: true,
									clubName: true,
									category: true,
								},
							},
						},
						orderBy: { slotIndex: 'asc' },
					},
				},
				orderBy: { order: 'asc' },
			},
			groupSlots: {
				where: { groupId: null }, // Reserve slots
				include: {
					team: {
						select: {
							id: true,
							name: true,
							clubName: true,
							category: true,
						},
					},
				},
			},
		},
	})

	if (!groupStage) return null

	return {
		id: groupStage.id,
		name: groupStage.name,
		tournamentId: groupStage.tournamentId,
		categories: safeParseJSON<Category[]>(
			groupStage.categories,
			`getGroupStageWithDetails(${groupStageId})`,
			[],
		),
		configGroups: groupStage.configGroups,
		configSlots: groupStage.configSlots,
		createdAt: groupStage.createdAt,
		updatedAt: groupStage.updatedAt,
		groups: groupStage.groups,
		confirmedSlots: groupStage.groupSlots,
	}
}

export async function getTournamentGroupStages(
	tournamentId: string,
): Promise<readonly GroupStageListItem[]> {
	const groupStages = await prisma.groupStage.findMany({
		where: { tournamentId },
		select: {
			id: true,
			name: true,
			categories: true,
			configGroups: true,
			configSlots: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: { createdAt: 'desc' },
	})

	return groupStages.map((groupStage) => ({
		...groupStage,
		categories: safeParseJSON<Category[]>(
			groupStage.categories,
			`getTournamentGroupStages(${tournamentId}) - groupStage ${groupStage.id}`,
			[],
		),
	}))
}

export const getUnassignedTeamsByCategories = async (
	tournamentId: string,
	categories?: readonly Category[],
): Promise<readonly UnassignedTeam[]> => {
	const where: Prisma.TeamWhereInput = {
		tournamentId,
		groupSlot: null, // Only unassigned teams
	}

	if (categories && categories.length > 0) {
		where.category = { in: [...categories] }
	}

	return await prisma.team.findMany({
		where,
		select: {
			id: true,
			name: true,
			clubName: true,
			category: true,
		},
		orderBy: [{ category: 'asc' }, { clubName: 'asc' }, { name: 'asc' }],
	})
}

// --------------------------------------------------------------------------------------
// Group assignment utilities
// --------------------------------------------------------------------------------------

type AssignTeamToGroupSlotProps = {
	readonly groupStageId: string
	readonly groupId: string
	readonly slotIndex: number
	readonly teamId: string
}

/**
 * Assign a team to a specific group slot
 * - Validates the slot belongs to the given group and group stage
 * - Ensures slot is empty (use clear or swap for occupied slots)
 * - Clears any previous assignment for teamId across the same group stage
 */
export async function assignTeamToGroupSlot(
	props: Readonly<AssignTeamToGroupSlotProps>,
): Promise<void> {
	const { groupStageId, groupId, slotIndex, teamId } = props

	await prisma.$transaction(async (tx) => {
		const slot = await tx.groupSlot.findFirst({
			where: { groupStageId, groupId, slotIndex },
			select: { id: true, teamId: true },
		})

		if (!slot) {
			throw new Error('Target slot not found for provided group')
		}

		if (slot.teamId) {
			throw new Error('Slot is occupied, clear or swap before assigning')
		}

		// Validate team and group stage belong to the same tournament
		const [groupStage, team] = await Promise.all([
			tx.groupStage.findUnique({
				where: { id: groupStageId },
				select: { tournamentId: true },
			}),
			tx.team.findUnique({
				where: { id: teamId },
				select: { tournamentId: true },
			}),
		])

		if (!groupStage) {
			throw new Error('Group stage not found')
		}

		if (!team) {
			throw new Error('Team not found')
		}

		if (groupStage.tournamentId !== team.tournamentId) {
			throw new Error('Team and group stage must belong to the same tournament')
		}

		// Clear any previous assignment of this team within the group stage (including reserve)
		await tx.groupSlot.updateMany({
			where: { groupStageId, teamId },
			data: { teamId: null },
		})

		// Assign the team to the target slot
		await tx.groupSlot.update({
			where: { id: slot.id },
			data: { teamId },
		})
	})
}

type ClearGroupSlotProps = {
	readonly groupSlotId: string
}

/** Clear a specific group slot (set teamId to null) */
export async function clearGroupSlot(
	props: Readonly<ClearGroupSlotProps>,
): Promise<void> {
	const { groupSlotId } = props
	await prisma.groupSlot.update({
		where: { id: groupSlotId },
		data: { teamId: null },
	})
}

type MoveTeamToReserveProps = {
	readonly groupStageId: string
	readonly teamId: string
}

/**
 * Move a team to reserve within a group stage
 * - Clears any existing group assignment
 * - Creates a reserve slot (groupId null) for that team if not present
 */
export async function moveTeamToReserve(
	props: Readonly<MoveTeamToReserveProps>,
): Promise<void> {
	const { groupStageId, teamId } = props

	await prisma.$transaction(async (tx) => {
		// Validate team and group stage belong to the same tournament
		const [groupStage, team] = await Promise.all([
			tx.groupStage.findUnique({
				where: { id: groupStageId },
				select: { tournamentId: true },
			}),
			tx.team.findUnique({
				where: { id: teamId },
				select: { tournamentId: true },
			}),
		])

		if (!groupStage) {
			throw new Error('Group stage not found')
		}

		if (!team) {
			throw new Error('Team not found')
		}

		if (groupStage.tournamentId !== team.tournamentId) {
			throw new Error('Team and group stage must belong to the same tournament')
		}

		// Clear any existing assignment (group or reserve)
		await tx.groupSlot.updateMany({
			where: { groupStageId, teamId },
			data: { teamId: null },
		})

		// Ensure a reserve slot exists for this team
		const existingReserve = await tx.groupSlot.findFirst({
			where: { groupStageId, teamId, groupId: null },
			select: { id: true },
		})

		if (existingReserve) {
			// Already exists (but cleared above), simply set teamId again
			await tx.groupSlot.update({
				where: { id: existingReserve.id },
				data: { teamId },
			})
		} else {
			await tx.groupSlot.create({
				data: {
					groupStageId,
					groupId: null,
					slotIndex: 0,
					teamId,
				},
			})
		}
	})
}

type SwapGroupSlotsProps = {
	readonly sourceSlotId: string
	readonly targetSlotId: string
}

/** Swap teams assigned between two slots atomically */
export async function swapGroupSlots(
	props: Readonly<SwapGroupSlotsProps>,
): Promise<void> {
	const { sourceSlotId, targetSlotId } = props

	if (sourceSlotId === targetSlotId) return

	await prisma.$transaction(async (tx) => {
		const [source, target] = await Promise.all([
			tx.groupSlot.findUnique({
				where: { id: sourceSlotId },
				select: { teamId: true },
			}),
			tx.groupSlot.findUnique({
				where: { id: targetSlotId },
				select: { teamId: true },
			}),
		])

		if (!source || !target) throw new Error('One of the slots was not found')

		const sourceTeamId = source.teamId
		const targetTeamId = target.teamId

		// Clear source first to satisfy unique(teamId) constraint when re-assigning
		await tx.groupSlot.update({
			where: { id: sourceSlotId },
			data: { teamId: null },
		})

		// Assign source team to target
		await tx.groupSlot.update({
			where: { id: targetSlotId },
			data: { teamId: sourceTeamId },
		})

		// Assign target team to source
		await tx.groupSlot.update({
			where: { id: sourceSlotId },
			data: { teamId: targetTeamId },
		})
	})
}

// --------------------------------------------------------------------------------------
// Batch operations for drag-and-drop group assignment
// --------------------------------------------------------------------------------------

type SlotAssignment = {
	readonly groupId: string
	readonly slotIndex: number
	readonly teamId: string
}

type BatchSaveGroupAssignmentsProps = {
	readonly groupStageId: string
	readonly tournamentId: string
	readonly assignments: readonly SlotAssignment[]
}

/**
 * Batch save all group slot assignments in a single transaction.
 * Clears all existing assignments and applies the new ones atomically.
 */
export async function batchSaveGroupAssignments(
	props: Readonly<BatchSaveGroupAssignmentsProps>,
): Promise<void> {
	const { groupStageId, tournamentId, assignments } = props

	await prisma.$transaction(async (tx) => {
		// Validate group stage exists and belongs to tournament
		const groupStage = await tx.groupStage.findUnique({
			where: { id: groupStageId },
			select: { tournamentId: true },
		})

		if (!groupStage) {
			throw new Error('Group stage not found')
		}

		if (groupStage.tournamentId !== tournamentId) {
			throw new Error('Group stage does not belong to specified tournament')
		}

		// Validate all teams belong to the tournament
		const teamIds = assignments.map((a) => a.teamId)
		if (teamIds.length > 0) {
			const teams = await tx.team.findMany({
				where: { id: { in: [...teamIds] } },
				select: { id: true, tournamentId: true },
			})

			const invalidTeams = teams.filter((t) => t.tournamentId !== tournamentId)
			if (invalidTeams.length > 0) {
				throw new Error('Some teams do not belong to the tournament')
			}

			const foundIds = new Set(teams.map((t) => t.id))
			const missingIds = teamIds.filter((id) => !foundIds.has(id))
			if (missingIds.length > 0) {
				throw new Error('Some teams were not found')
			}
		}

		// Clear all group slot assignments for this group stage (not reserve slots)
		await tx.groupSlot.updateMany({
			where: {
				groupStageId,
				groupId: { not: null },
			},
			data: { teamId: null },
		})

		// Clear all reserve slots for this group stage
		await tx.groupSlot.deleteMany({
			where: {
				groupStageId,
				groupId: null,
			},
		})

		// Apply new assignments
		for (const assignment of assignments) {
			const slot = await tx.groupSlot.findFirst({
				where: {
					groupStageId,
					groupId: assignment.groupId,
					slotIndex: assignment.slotIndex,
				},
				select: { id: true },
			})

			if (!slot) {
				throw new Error(
					`Slot not found: group ${assignment.groupId}, index ${assignment.slotIndex}`,
				)
			}

			await tx.groupSlot.update({
				where: { id: slot.id },
				data: { teamId: assignment.teamId },
			})
		}

		// Update group stage timestamp
		await tx.groupStage.update({
			where: { id: groupStageId },
			data: { updatedAt: new Date() },
		})
	})
}

type DeleteTeamFromGroupStageProps = {
	readonly groupStageId: string
	readonly teamId: string
}

/**
 * Remove a team from a group stage entirely.
 * Clears the team from any slot (group or reserve).
 */
export async function deleteTeamFromGroupStage(
	props: Readonly<DeleteTeamFromGroupStageProps>,
): Promise<void> {
	const { groupStageId, teamId } = props

	await prisma.$transaction(async (tx) => {
		// Clear any assignment in group slots
		await tx.groupSlot.updateMany({
			where: {
				groupStageId,
				teamId,
				groupId: { not: null },
			},
			data: { teamId: null },
		})

		// Delete any reserve slots for this team
		await tx.groupSlot.deleteMany({
			where: {
				groupStageId,
				teamId,
				groupId: null,
			},
		})
	})
}
