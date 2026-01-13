import type { Category } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import type {
	DndTeam,
	GroupAssignmentSnapshot,
} from '~/features/competition/utils/groupStageDnd'
import {
	assignTeamToSlot,
	getConfirmedCapacity,
	getTeamById,
	getTeamLocation,
	getWaitlistTeams,
	isGroupAssignmentDirty,
	moveTeamToConfirmed,
	moveTeamToWaitlist,
	promoteFromWaitlist,
	shouldInitialize,
	swapTeamWithSlot,
} from '../groupAssignmentStoreHelpers'

const createTeam = (id: string, name: string): DndTeam => ({
	id,
	name,
	clubName: `${name} Club`,
	category: 'JO8' as Category,
})

const createSnapshot = (): GroupAssignmentSnapshot => {
	const teamA = createTeam('team-a', 'Team A')
	const teamB = createTeam('team-b', 'Team B')
	const teamC = createTeam('team-c', 'Team C')

	return {
		groupStageId: 'group-stage-1',
		groupStageName: 'Group Stage',
		tournamentId: 'tournament-1',
		updatedAt: '2024-01-01T00:00:00.000Z',
		groups: [
			{
				id: 'group-1',
				name: 'Group 1',
				order: 1,
				slots: [
					{
						slotId: 'group-1-slot-0',
						groupId: 'group-1',
						slotIndex: 0,
						team: teamA,
					},
					{
						slotId: 'group-1-slot-1',
						groupId: 'group-1',
						slotIndex: 1,
						team: null,
					},
				],
			},
		],
		unassignedTeams: [
			{ ...teamB, isWaitlist: false },
			{ ...teamC, isWaitlist: true },
		],
		totalSlots: 3,
	}
}

describe('groupAssignmentStoreHelpers', () => {
	describe('snapshot checks', () => {
		it('should initialize snapshot when empty or group stage differs', () => {
			const snapshot = createSnapshot()

			expect(shouldInitialize(null, snapshot)).toBe(true)
			expect(shouldInitialize(snapshot, snapshot)).toBe(false)
			expect(
				shouldInitialize(snapshot, {
					...snapshot,
					groupStageId: 'group-stage-2',
				}),
			).toBe(true)
			expect(
				shouldInitialize(snapshot, {
					...snapshot,
					updatedAt: '2024-02-01T00:00:00.000Z',
				}),
			).toBe(true)
		})

		it('should detect dirty snapshot changes', () => {
			const snapshot = createSnapshot()
			const modified = {
				...snapshot,
				groupStageName: 'Updated',
			}

			expect(isGroupAssignmentDirty(snapshot, snapshot)).toBe(false)
			expect(isGroupAssignmentDirty(modified, snapshot)).toBe(true)
			expect(isGroupAssignmentDirty(null, snapshot)).toBe(false)
			expect(isGroupAssignmentDirty(snapshot, null)).toBe(false)
		})
	})

	describe('selectors', () => {
		it('should return team by id', () => {
			const snapshot = createSnapshot()

			expect(getTeamById(snapshot, 'team-a')?.id).toBe('team-a')
			expect(getTeamById(snapshot, 'team-b')?.id).toBe('team-b')
			expect(getTeamById(snapshot, 'missing')).toBe(null)
		})

		it('should return team location', () => {
			const snapshot = createSnapshot()

			expect(getTeamLocation(snapshot, 'team-a')).toBe('group')
			expect(getTeamLocation(snapshot, 'team-b')).toBe('confirmed')
			expect(getTeamLocation(snapshot, 'team-c')).toBe('waitlist')
			expect(getTeamLocation(snapshot, 'missing')).toBe(null)
		})

		it('should return confirmed capacity', () => {
			const snapshot = createSnapshot()

			expect(getConfirmedCapacity(snapshot)).toBe(2)
			expect(getConfirmedCapacity(null)).toBe(0)
		})

		it('should return waitlist teams only', () => {
			const snapshot = createSnapshot()

			expect(getWaitlistTeams(snapshot).map((team) => team.id)).toEqual(['team-c'])
			expect(getWaitlistTeams(null)).toEqual([])
		})
	})

	describe('snapshot mutations', () => {
		it('should assign a team to a slot and remove from unassigned', () => {
			const snapshot = createSnapshot()

			const next = assignTeamToSlot(snapshot, 'team-b', 'group-1', 1)

			expect(next?.groups[0].slots[1].team?.id).toBe('team-b')
			expect(next?.unassignedTeams.some((team) => team.id === 'team-b')).toBe(false)
		})

		it('should return null when assigning to invalid slot', () => {
			const snapshot = createSnapshot()

			expect(assignTeamToSlot(snapshot, 'team-b', 'group-9', 1)).toBe(null)
		})

		it('should move a group team to confirmed reserve', () => {
			const snapshot = createSnapshot()

			const next = moveTeamToConfirmed(snapshot, 'team-a')

			expect(next?.groups[0].slots[0].team).toBe(null)
			expect(
				next?.unassignedTeams.some((team) => team.id === 'team-a' && !team.isWaitlist),
			).toBe(true)
		})

		it('should move a team to the waitlist', () => {
			const snapshot = createSnapshot()

			const next = moveTeamToWaitlist(snapshot, 'team-a')

			expect(next?.groups[0].slots[0].team).toBe(null)
			expect(
				next?.unassignedTeams.some((team) => team.id === 'team-a' && team.isWaitlist),
			).toBe(true)
		})

		it('should replace an occupied slot when dragging from confirmed', () => {
			const snapshot = createSnapshot()

			const next = swapTeamWithSlot(snapshot, 'team-b', 'group-1', 0)

			expect(next?.groups[0].slots[0].team?.id).toBe('team-b')
			expect(
				next?.unassignedTeams.some((team) => team.id === 'team-a' && !team.isWaitlist),
			).toBe(true)
		})

		it('should swap teams within the same group', () => {
			const teamA = createTeam('team-a', 'Team A')
			const teamB = createTeam('team-b', 'Team B')

			const snapshot: GroupAssignmentSnapshot = {
				groupStageId: 'group-stage-1',
				groupStageName: 'Group Stage',
				tournamentId: 'tournament-1',
				updatedAt: '2024-01-01T00:00:00.000Z',
				groups: [
					{
						id: 'group-1',
						name: 'Group 1',
						order: 1,
						slots: [
							{
								slotId: 'group-1-slot-0',
								groupId: 'group-1',
								slotIndex: 0,
								team: teamA,
							},
							{
								slotId: 'group-1-slot-1',
								groupId: 'group-1',
								slotIndex: 1,
								team: teamB,
							},
						],
					},
				],
				unassignedTeams: [],
				totalSlots: 2,
			}

			const next = swapTeamWithSlot(snapshot, 'team-a', 'group-1', 1)

			expect(next?.groups[0].slots[0].team?.id).toBe('team-b')
			expect(next?.groups[0].slots[1].team?.id).toBe('team-a')
			expect(next?.unassignedTeams).toHaveLength(0)
		})

		it('should promote a team from waitlist when capacity allows', () => {
			const snapshot = createSnapshot()

			const next = promoteFromWaitlist(snapshot, 'team-c')

			expect(
				next?.unassignedTeams.some((team) => team.id === 'team-c' && !team.isWaitlist),
			).toBe(true)
		})

		it('should not promote from waitlist when capacity is full', () => {
			const snapshot = {
				...createSnapshot(),
				totalSlots: 1,
			}

			expect(promoteFromWaitlist(snapshot, 'team-c')).toBe(null)
		})

		it('should not promote from waitlist when confirmed reaches capacity', () => {
			const teamA = createTeam('team-a', 'Team A')
			const teamB = createTeam('team-b', 'Team B')
			const teamC = createTeam('team-c', 'Team C')
			const teamD = createTeam('team-d', 'Team D')

			const snapshot: GroupAssignmentSnapshot = {
				groupStageId: 'group-stage-1',
				groupStageName: 'Group Stage',
				tournamentId: 'tournament-1',
				updatedAt: '2024-01-01T00:00:00.000Z',
				groups: [
					{
						id: 'group-1',
						name: 'Group 1',
						order: 1,
						slots: [
							{
								slotId: 'group-1-slot-0',
								groupId: 'group-1',
								slotIndex: 0,
								team: teamA,
							},
							{
								slotId: 'group-1-slot-1',
								groupId: 'group-1',
								slotIndex: 1,
								team: teamD,
							},
						],
					},
				],
				unassignedTeams: [
					{ ...teamB, isWaitlist: false },
					{ ...teamC, isWaitlist: true },
				],
				totalSlots: 3,
			}

			expect(promoteFromWaitlist(snapshot, 'team-c')).toBe(null)
		})
	})
})
