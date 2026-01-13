import type { Category } from '@prisma/client'
import { beforeEach, describe, expect, it } from 'vitest'
import type {
  DndTeam,
  GroupAssignmentSnapshot,
} from '~/features/competition/utils/groupStageDnd'
import { useGroupAssignmentStore } from '../useGroupAssignmentStore'

const state = useGroupAssignmentStore.getState

const teamIds = {
  groupTeam: 'team-a',
  confirmedTeam: 'team-b',
  waitlistTeam: 'team-c',
} as const

const createTeam = (id: string, name: string): DndTeam => ({
  id,
  name,
  clubName: `${name} Club`,
  category: 'JO8' as Category,
})

const createSnapshot = (): GroupAssignmentSnapshot => {
  const teamA = createTeam(teamIds.groupTeam, 'Team A')
  const teamB = createTeam(teamIds.confirmedTeam, 'Team B')
  const teamC = createTeam(teamIds.waitlistTeam, 'Team C')

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

describe('useGroupAssignmentStore', () => {
  beforeEach(() => {
    state().clearStore()
  })

  it('should set snapshot pair on first load', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)

    expect(state().snapshot).toEqual(snapshot)
    expect(state().originalSnapshot).toEqual(snapshot)
    expect(state().hasConflict).toBe(false)
    expect(state().saveError).toBe(null)
    expect(state().activeGroupIndex).toBe(0)
  })

  it('should ignore snapshot pair when the group stage matches', () => {
    const snapshot = createSnapshot()
    const nextSnapshot = {
      ...snapshot,
      groupStageName: 'Updated Group Stage',
    }

    state().setSnapshotPair(snapshot)
    state().setSnapshotPair(nextSnapshot)

    expect(state().snapshot).toEqual(snapshot)
  })

  it('should update snapshot pair when updatedAt changes', () => {
    const snapshot = createSnapshot()
    const nextSnapshot = {
      ...snapshot,
      updatedAt: '2024-02-01T00:00:00.000Z',
    }

    state().setSnapshotPair(snapshot)
    state().setSnapshotPair(nextSnapshot)

    expect(state().snapshot).toEqual(nextSnapshot)
    expect(state().originalSnapshot).toEqual(nextSnapshot)
  })

  it('should reset snapshot to the original pair', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)
    state().assignTeamToSlot(teamIds.confirmedTeam, 'group-1', 1)
    expect(state().snapshot).not.toEqual(snapshot)

    state().resetSnapshotPair()

    expect(state().snapshot).toEqual(snapshot)
  })

  it('should mark the current snapshot as saved', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)
    state().assignTeamToSlot(teamIds.confirmedTeam, 'group-1', 1)

    state().markAsSaved()

    expect(state().originalSnapshot).toEqual(state().snapshot)
  })

  it('should assign a team to a slot and remove from unassigned', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)
    state().assignTeamToSlot(teamIds.confirmedTeam, 'group-1', 1)

    const slot = state().snapshot?.groups[0].slots[1]
    expect(slot?.team?.id).toBe(teamIds.confirmedTeam)
    expect(
      state().snapshot?.unassignedTeams.some(team => team.id === teamIds.confirmedTeam),
    ).toBe(false)
  })

  it('should move a group team to confirmed reserve', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)
    state().moveTeamToConfirmed(teamIds.groupTeam)

    expect(state().snapshot?.groups[0].slots[0].team).toBe(null)
    expect(
      state().snapshot?.unassignedTeams.some(
        team => team.id === teamIds.groupTeam && !team.isWaitlist,
      ),
    ).toBe(true)
  })

  it('should move a team to the waitlist', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)
    state().moveTeamToWaitlist(teamIds.groupTeam)

    expect(state().snapshot?.groups[0].slots[0].team).toBe(null)
    expect(
      state().snapshot?.unassignedTeams.some(
        team => team.id === teamIds.groupTeam && team.isWaitlist,
      ),
    ).toBe(true)
  })

  it('should swap a team with an occupied slot', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)
    state().swapTeamWithSlot(teamIds.confirmedTeam, 'group-1', 0)

    expect(state().snapshot?.groups[0].slots[0].team?.id).toBe(teamIds.confirmedTeam)
    expect(
      state().snapshot?.unassignedTeams.some(
        team => team.id === teamIds.groupTeam && !team.isWaitlist,
      ),
    ).toBe(true)
    expect(
      state().snapshot?.unassignedTeams.some(team => team.id === teamIds.confirmedTeam),
    ).toBe(false)
  })

  it('should promote a team from waitlist when capacity allows', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)
    state().promoteFromWaitlist(teamIds.waitlistTeam)

    expect(
      state().snapshot?.unassignedTeams.some(
        team => team.id === teamIds.waitlistTeam && !team.isWaitlist,
      ),
    ).toBe(true)
  })

  it('should update UI state flags', () => {
    state().setActiveGroupIndex(2)
    state().setSaving(true)
    state().setSaveError('Failed')
    state().setConflict(true)

    expect(state().activeGroupIndex).toBe(2)
    expect(state().isSaving).toBe(true)
    expect(state().saveError).toBe('Failed')
    expect(state().hasConflict).toBe(true)
  })

  it('should clear the store to initial state', () => {
    const snapshot = createSnapshot()

    state().setSnapshotPair(snapshot)
    state().setSaving(true)
    state().setConflict(true)

    state().clearStore()

    expect(state().snapshot).toBe(null)
    expect(state().originalSnapshot).toBe(null)
    expect(state().isSaving).toBe(false)
    expect(state().saveError).toBe(null)
    expect(state().hasConflict).toBe(false)
    expect(state().activeGroupIndex).toBe(0)
  })
})
