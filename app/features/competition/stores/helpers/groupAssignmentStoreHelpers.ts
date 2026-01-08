import type {
	DndGroup,
	DndSlot,
	DndTeam,
	DndUnassignedTeam,
	GroupAssignmentSnapshot,
} from '../../utils/groupStageDnd'
import {
	calculateConfirmedCapacity,
	findTeam,
	isTeamOnWaitlist,
} from '../../utils/groupStageDnd'

import type { GroupAssignmentTeamLocation } from './groupAssignmentStoreTypes'

type SlotTarget = {
	groupId: string
	slotIndex: number
}

const stripWaitlist = (team: DndTeam): DndTeam => ({
	id: team.id,
	name: team.name,
	clubName: team.clubName,
	category: team.category,
})

const toUnassignedTeam = (team: DndTeam, isWaitlist: boolean): DndUnassignedTeam => ({
	...stripWaitlist(team),
	isWaitlist,
})

const withoutTeam = (
	teams: readonly DndUnassignedTeam[],
	teamId: string,
): DndUnassignedTeam[] => teams.filter((team) => team.id !== teamId)

const clearTeamFromGroups = (groups: readonly DndGroup[], teamId: string): DndGroup[] =>
	groups.map((group) => ({
		...group,
		slots: group.slots.map((slot) =>
			slot.team?.id === teamId ? { ...slot, team: null } : slot,
		),
	}))

const setTeamInSlot = (
	groups: readonly DndGroup[],
	{ groupId, slotIndex }: SlotTarget,
	team: DndTeam,
): DndGroup[] =>
	groups.map((group) =>
		group.id !== groupId
			? group
			: {
					...group,
					slots: group.slots.map((slot) =>
						slot.slotIndex === slotIndex
							? { ...slot, team: stripWaitlist(team) }
							: slot,
					),
				},
	)

const findSlotByPosition = (
	snapshot: GroupAssignmentSnapshot,
	{ groupId, slotIndex }: SlotTarget,
): DndSlot | null => {
	const group = snapshot.groups.find((g) => g.id === groupId)
	if (!group) return null
	return group.slots.find((slot) => slot.slotIndex === slotIndex) || null
}

export const shouldInitialize = (
	currentSnapshot: GroupAssignmentSnapshot | null,
	originalSnapshotOrNext: GroupAssignmentSnapshot | null,
	nextSnapshot?: GroupAssignmentSnapshot,
): boolean => {
	const hasOriginalSnapshot = typeof nextSnapshot !== 'undefined'
	const originalSnapshot = hasOriginalSnapshot ? originalSnapshotOrNext : null
	const incomingSnapshot = nextSnapshot ?? originalSnapshotOrNext

	if (!incomingSnapshot) return false
	if (!currentSnapshot) return true
	if (hasOriginalSnapshot && !originalSnapshot) return true

	if (currentSnapshot.groupStageId !== incomingSnapshot.groupStageId) {
		return true
	}

	return currentSnapshot.updatedAt !== incomingSnapshot.updatedAt
}

export const isGroupAssignmentDirty = (
	snapshot: GroupAssignmentSnapshot | null,
	originalSnapshot: GroupAssignmentSnapshot | null,
): boolean => {
	if (!snapshot || !originalSnapshot) return false
	// JSON.stringify is simple but scales with snapshot size; consider tracking mutations if this becomes hot.
	return JSON.stringify(snapshot) !== JSON.stringify(originalSnapshot)
}

export const getTeamById = (
	snapshot: GroupAssignmentSnapshot | null,
	teamId: string,
): DndTeam | null => {
	if (!snapshot) return null
	return findTeam(snapshot, teamId)?.team ?? null
}

export const getTeamLocation = (
	snapshot: GroupAssignmentSnapshot | null,
	teamId: string,
): GroupAssignmentTeamLocation => {
	if (!snapshot) return null
	const found = findTeam(snapshot, teamId)
	if (!found) return null
	if (found.location === 'group') return 'group'
	return isTeamOnWaitlist(snapshot, teamId) ? 'waitlist' : 'confirmed'
}

export const getConfirmedCapacity = (
	snapshot: GroupAssignmentSnapshot | null,
): number => (snapshot ? calculateConfirmedCapacity(snapshot) : 0)

export const getWaitlistTeams = (
	snapshot: GroupAssignmentSnapshot | null,
): readonly DndUnassignedTeam[] =>
	snapshot ? snapshot.unassignedTeams.filter((team) => team.isWaitlist) : []

export const assignTeamToSlot = (
	snapshot: GroupAssignmentSnapshot,
	teamId: string,
	groupId: string,
	slotIndex: number,
): GroupAssignmentSnapshot | null => {
	const targetSlot = findSlotByPosition(snapshot, { groupId, slotIndex })
	if (!targetSlot || targetSlot.team?.id === teamId) return null

	const found = findTeam(snapshot, teamId)
	if (!found) return null

	const clearedGroups =
		found.location === 'group'
			? clearTeamFromGroups(snapshot.groups, teamId)
			: snapshot.groups

	const updatedGroups = setTeamInSlot(clearedGroups, { groupId, slotIndex }, found.team)
	const updatedUnassignedTeams = withoutTeam(snapshot.unassignedTeams, teamId)

	return {
		...snapshot,
		groups: updatedGroups,
		unassignedTeams: updatedUnassignedTeams,
	}
}

export const moveTeamToConfirmed = (
	snapshot: GroupAssignmentSnapshot,
	teamId: string,
): GroupAssignmentSnapshot | null => {
	const found = findTeam(snapshot, teamId)
	if (!found || found.location !== 'group') return null

	const updatedGroups = clearTeamFromGroups(snapshot.groups, teamId)
	const updatedUnassignedTeams = [
		...withoutTeam(snapshot.unassignedTeams, teamId),
		toUnassignedTeam(found.team, false),
	]

	return {
		...snapshot,
		groups: updatedGroups,
		unassignedTeams: updatedUnassignedTeams,
	}
}

export const moveTeamToWaitlist = (
	snapshot: GroupAssignmentSnapshot,
	teamId: string,
): GroupAssignmentSnapshot | null => {
	const found = findTeam(snapshot, teamId)
	if (!found) return null

	const updatedGroups =
		found.location === 'group'
			? clearTeamFromGroups(snapshot.groups, teamId)
			: snapshot.groups
	const updatedUnassignedTeams = [
		...withoutTeam(snapshot.unassignedTeams, teamId),
		toUnassignedTeam(found.team, true),
	]

	return {
		...snapshot,
		groups: updatedGroups,
		unassignedTeams: updatedUnassignedTeams,
	}
}

export const swapTeamWithSlot = (
	snapshot: GroupAssignmentSnapshot,
	teamId: string,
	groupId: string,
	slotIndex: number,
): GroupAssignmentSnapshot | null => {
	const targetSlot = findSlotByPosition(snapshot, { groupId, slotIndex })
	if (!targetSlot || targetSlot.team?.id === teamId) return null

	const found = findTeam(snapshot, teamId)
	if (!found) return null

	if (found.location === 'group' && found.groupId === groupId && targetSlot.team) {
		const targetTeam = targetSlot.team
		const sourceSlotIndex = found.slotIndex
		const updatedGroups = snapshot.groups.map((group) =>
			group.id !== groupId
				? group
				: {
						...group,
						slots: group.slots.map((slot) => {
							if (slot.slotIndex === slotIndex) {
								return { ...slot, team: stripWaitlist(found.team) }
							}
							if (slot.slotIndex === sourceSlotIndex) {
								return { ...slot, team: stripWaitlist(targetTeam) }
							}
							return slot
						}),
					},
		)

		return {
			...snapshot,
			groups: updatedGroups,
		}
	}

	const updatedGroups = setTeamInSlot(
		clearTeamFromGroups(snapshot.groups, teamId),
		{ groupId, slotIndex },
		found.team,
	)

	const updatedUnassignedTeams = [
		...withoutTeam(snapshot.unassignedTeams, teamId),
		...(targetSlot.team ? [toUnassignedTeam(targetSlot.team, false)] : []),
	]

	return {
		...snapshot,
		groups: updatedGroups,
		unassignedTeams: updatedUnassignedTeams,
	}
}

export const promoteFromWaitlist = (
	snapshot: GroupAssignmentSnapshot,
	teamId: string,
): GroupAssignmentSnapshot | null => {
	const capacity = calculateConfirmedCapacity(snapshot)
	if (capacity <= 0) return null

	const confirmedCount = snapshot.unassignedTeams.filter(
		(team) => !team.isWaitlist,
	).length
	if (confirmedCount >= capacity) return null

	const team = snapshot.unassignedTeams.find((t) => t.id === teamId)
	if (!team || !team.isWaitlist) return null

	const updatedUnassignedTeams = snapshot.unassignedTeams.map((t) =>
		t.id === teamId ? { ...t, isWaitlist: false } : t,
	)

	return {
		...snapshot,
		unassignedTeams: updatedUnassignedTeams,
	}
}

export const removeTeamFromGroupStage = (
	snapshot: GroupAssignmentSnapshot,
	teamId: string,
): GroupAssignmentSnapshot | null => {
	const found = findTeam(snapshot, teamId)
	if (!found) return null

	const updatedGroups = clearTeamFromGroups(snapshot.groups, teamId)
	const updatedUnassignedTeams = withoutTeam(snapshot.unassignedTeams, teamId)

	return {
		...snapshot,
		groups: updatedGroups,
		unassignedTeams: updatedUnassignedTeams,
	}
}
