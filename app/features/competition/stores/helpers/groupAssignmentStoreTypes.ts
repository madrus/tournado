import type { GroupAssignmentSnapshot } from '../../utils/groupStageDnd'

export type GroupAssignmentStoreState = {
  snapshot: GroupAssignmentSnapshot | null
  originalSnapshot: GroupAssignmentSnapshot | null
  isSaving: boolean
  saveError: string | null
  hasConflict: boolean
  activeGroupIndex: number
}

export type GroupAssignmentTeamLocation = 'confirmed' | 'waitlist' | 'group' | null

export type GroupAssignmentStoreActions = {
  setSnapshotPair: (snapshot: GroupAssignmentSnapshot) => void
  resetSnapshotPair: () => void
  markAsSaved: () => void
  clearStore: () => void

  assignTeamToSlot: (teamId: string, groupId: string, slotIndex: number) => void
  moveTeamToConfirmed: (teamId: string) => void
  moveTeamToWaitlist: (teamId: string) => void
  swapTeamWithSlot: (teamId: string, groupId: string, slotIndex: number) => void
  promoteFromWaitlist: (teamId: string) => void

  setActiveGroupIndex: (index: number) => void
  setSaving: (saving: boolean) => void
  setSaveError: (error: string | null) => void
  setConflict: (hasConflict: boolean) => void
}

export type GroupAssignmentStore = GroupAssignmentStoreState &
  GroupAssignmentStoreActions
