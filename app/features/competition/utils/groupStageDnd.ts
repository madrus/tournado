import type { Category } from '@prisma/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DndTeam = {
	readonly id: string
	readonly name: string
	readonly clubName: string
	readonly category: Category
}

export type DndSlot = {
	readonly slotId: string
	readonly groupId: string
	readonly slotIndex: number
	readonly team: DndTeam | null
}

export type DndGroup = {
	readonly id: string
	readonly name: string
	readonly order: number
	readonly slots: readonly DndSlot[]
}

export type DndUnassignedTeam = DndTeam & {
	readonly isWaitlist: boolean
}

export type GroupAssignmentSnapshot = {
	readonly groupStageId: string
	readonly groupStageName: string
	readonly tournamentId: string
	readonly updatedAt: string
	readonly groups: readonly DndGroup[]
	readonly unassignedTeams: readonly DndUnassignedTeam[]
	readonly totalSlots: number
}

// Drag item types for collision detection
export type DragItemType =
	| 'team-chip'
	| 'group-slot'
	| 'reserve-pool'
	| 'group-container'

export type DragData = {
	readonly type: DragItemType
	readonly teamId?: string
	readonly slotId?: string
	readonly groupId?: string
	readonly isWaitlist?: boolean
}

// ---------------------------------------------------------------------------
// ID Helpers - Create unique IDs for drag sources and drop targets
// ---------------------------------------------------------------------------

export const createTeamDragId = (teamId: string): string => `team:${teamId}`

export const createSlotDropId = (groupId: string, slotIndex: number): string =>
	`slot:${groupId}:${slotIndex}`

export const CONFIRMED_POOL_ID = 'confirmed-pool'
export const WAITLIST_POOL_ID = 'waitlist-pool'

// ---------------------------------------------------------------------------
// ID Parsers - Extract data from drag/drop IDs
// ---------------------------------------------------------------------------

export const parseTeamDragId = (id: string): string | null => {
	if (id.startsWith('team:')) {
		return id.slice(5)
	}
	return null
}

export const parseSlotDropId = (
	id: string,
): { groupId: string; slotIndex: number } | null => {
	if (id.startsWith('slot:')) {
		const parts = id.slice(5).split(':')
		if (parts.length === 2) {
			const slotIndex = Number.parseInt(parts[1], 10)
			// Validate that the parsed value is a valid integer
			if (Number.isInteger(slotIndex)) {
				return { groupId: parts[0], slotIndex }
			}
		}
	}
	return null
}

export const isConfirmedPoolId = (id: string): boolean => id === CONFIRMED_POOL_ID

export const isWaitlistPoolId = (id: string): boolean => id === WAITLIST_POOL_ID

// ---------------------------------------------------------------------------
// Collision Detection Helpers
// ---------------------------------------------------------------------------

/**
 * Find a slot by its ID across all groups
 */
export const findSlotById = (
	groups: readonly DndGroup[],
	slotId: string,
): { group: DndGroup; slot: DndSlot } | null => {
	for (const group of groups) {
		const slot = group.slots.find((s) => s.slotId === slotId)
		if (slot) {
			return { group, slot }
		}
	}
	return null
}

/**
 * Find a team in the reserve or groups
 */
type TeamLocationResult =
	| { location: 'reserve'; team: DndTeam; isWaitlist: boolean }
	| { location: 'group'; team: DndTeam; groupId: string; slotIndex: number }

export const findTeam = (
	snapshot: GroupAssignmentSnapshot,
	teamId: string,
): TeamLocationResult | null => {
	// Check reserve
	const reserveTeam = snapshot.unassignedTeams.find((t) => t.id === teamId)
	if (reserveTeam) {
		return {
			location: 'reserve',
			team: reserveTeam,
			isWaitlist: reserveTeam.isWaitlist,
		}
	}

	// Check groups
	for (const group of snapshot.groups) {
		for (const slot of group.slots) {
			if (slot.team?.id === teamId) {
				return {
					location: 'group',
					team: slot.team,
					groupId: group.id,
					slotIndex: slot.slotIndex,
				}
			}
		}
	}

	return null
}

/**
 * Calculate reserve pool capacity
 * Capacity = total group slots - currently assigned teams
 */
export const calculateConfirmedCapacity = (
	snapshot: GroupAssignmentSnapshot,
): number => {
	const assignedTeams = snapshot.groups.reduce(
		(count, group) => count + group.slots.filter((slot) => slot.team !== null).length,
		0,
	)
	return snapshot.totalSlots - assignedTeams
}

/**
 * Check if a team is on the waitlist
 */
export const isTeamOnWaitlist = (
	snapshot: GroupAssignmentSnapshot,
	teamId: string,
): boolean => {
	const team = snapshot.unassignedTeams.find((t) => t.id === teamId)
	return team?.isWaitlist ?? false
}

/**
 * Determine if a drop from waitlist to group is allowed
 * Only allowed if there's capacity in the confirmed pool
 */
export const canPromoteFromWaitlist = (snapshot: GroupAssignmentSnapshot): boolean =>
	calculateConfirmedCapacity(snapshot) > 0

// ---------------------------------------------------------------------------
// Snapshot Transformation Helpers
// ---------------------------------------------------------------------------

/**
 * Create initial snapshot from loader data
 */
export type LoaderGroupStage = {
	readonly id: string
	readonly name: string
	readonly tournamentId: string
	readonly updatedAt: Date
	readonly configGroups: number
	readonly configSlots: number
	readonly groups: readonly {
		readonly id: string
		readonly name: string
		readonly order: number
		readonly slots: readonly {
			readonly id: string
			readonly slotIndex: number
			readonly team: {
				readonly id: string
				readonly name: string
				readonly clubName: string
				readonly category: Category
			} | null
		}[]
	}[]
	readonly confirmedSlots: readonly {
		readonly id: string
		readonly team: {
			readonly id: string
			readonly name: string
			readonly clubName: string
			readonly category: Category
		} | null
	}[]
}

export type LoaderAvailableTeam = {
	readonly id: string
	readonly name: string
	readonly clubName: string
	readonly category: Category
}

export const createSnapshotFromLoader = (
	groupStage: LoaderGroupStage,
	availableTeams: readonly LoaderAvailableTeam[],
): GroupAssignmentSnapshot => {
	const totalSlots = groupStage.configGroups * groupStage.configSlots

	// Map groups with slots
	const groups: DndGroup[] = groupStage.groups.map((group) => ({
		id: group.id,
		name: group.name,
		order: group.order,
		slots: group.slots.map((slot) => ({
			slotId: slot.id,
			groupId: group.id,
			slotIndex: slot.slotIndex,
			team: slot.team
				? {
						id: slot.team.id,
						name: slot.team.name,
						clubName: slot.team.clubName,
						category: slot.team.category,
					}
				: null,
		})),
	}))

	// Count assigned teams
	const assignedTeamIds = new Set<string>()
	for (const group of groups) {
		for (const slot of group.slots) {
			if (slot.team) {
				assignedTeamIds.add(slot.team.id)
			}
		}
	}

	// Build reserve teams from reserve slots and available teams
	const confirmedCapacity = totalSlots - assignedTeamIds.size

	// Teams from reserve slots (already in group stage context)
	const confirmedSlotTeams: DndUnassignedTeam[] = groupStage.confirmedSlots
		.filter(
			(slot): slot is typeof slot & { team: NonNullable<typeof slot.team> } =>
				slot.team !== null,
		)
		.map((slot) => ({
			id: slot.team.id,
			name: slot.team.name,
			clubName: slot.team.clubName,
			category: slot.team.category,
			isWaitlist: false, // Will be recalculated below
		}))

	// Teams from available teams (not in group stage yet)
	const availableTeamsList: DndUnassignedTeam[] = availableTeams.map((team) => ({
		id: team.id,
		name: team.name,
		clubName: team.clubName,
		category: team.category,
		isWaitlist: false, // Will be recalculated below
	}))

	// Combine and deduplicate
	const allUnassignedTeams = [
		...confirmedSlotTeams,
		...availableTeamsList.filter((t) => !confirmedSlotTeams.some((r) => r.id === t.id)),
	]

	// Mark waitlist teams (those beyond capacity)
	const unassignedTeams: DndUnassignedTeam[] = allUnassignedTeams.map(
		(team, index) => ({
			...team,
			isWaitlist: index >= confirmedCapacity,
		}),
	)

	return {
		groupStageId: groupStage.id,
		groupStageName: groupStage.name,
		tournamentId: groupStage.tournamentId,
		updatedAt: groupStage.updatedAt.toISOString(),
		groups,
		unassignedTeams,
		totalSlots,
	}
}
