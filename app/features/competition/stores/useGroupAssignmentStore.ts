import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import { isBrowser } from '~/lib/lib.helpers'

import {
	assignTeamToSlotSnapshot,
	moveTeamToConfirmedSnapshot,
	moveTeamToWaitlistSnapshot,
	promoteFromWaitlistSnapshot,
	removeTeamFromGroupStageSnapshot,
	shouldInitializeSnapshot,
	swapTeamWithSlotSnapshot,
} from './helpers/groupAssignmentStoreHelpers'
import type {
	GroupAssignmentStoreActions,
	GroupAssignmentStoreState,
} from './helpers/groupAssignmentStoreTypes'

const storeName = 'GroupAssignmentStore'

const initialStoreState: GroupAssignmentStoreState = {
	snapshot: null,
	originalSnapshot: null,
	isSaving: false,
	saveError: null,
	hasConflict: false,
	activeGroupIndex: 0,
}

type SnapshotUpdater = (
	snapshot: NonNullable<GroupAssignmentStoreState['snapshot']>,
) => GroupAssignmentStoreState['snapshot'] | null

// Server-side storage mock
const createServerSideStorage = () => ({
	getItem: () => null,
	setItem: () => {
		// no-op
	},
	removeItem: () => {
		// no-op
	},
})

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------

export const useGroupAssignmentStore = create<
	GroupAssignmentStoreState & GroupAssignmentStoreActions
>()(
	devtools(
		persist(
			(set, get) => {
				const updateSnapshot = (updater: SnapshotUpdater, actionName: string) => {
					const snapshot = get().snapshot
					if (!snapshot) return

					const nextSnapshot = updater(snapshot)
					if (!nextSnapshot) return

					set({ snapshot: nextSnapshot }, false, actionName)
				}

				return {
					...initialStoreState,

					// Initialize from loader data
					setSnapshotPair: (snapshot) => {
						if (!shouldInitializeSnapshot(get().snapshot, snapshot)) return
						set(
							{
								snapshot,
								originalSnapshot: snapshot,
								saveError: null,
								hasConflict: false,
								activeGroupIndex: 0,
							},
							false,
							'setSnapshotPair',
						)
					},

					// Reset to original state
					resetSnapshotPair: () => {
						const original = get().originalSnapshot
						if (!original) return
						set(
							{
								snapshot: original,
								saveError: null,
								hasConflict: false,
							},
							false,
							'resetSnapshotPair',
						)
					},

					// Mark current state as saved (resets dirty flag)
					markAsSaved: () => {
						const currentSnapshot = get().snapshot
						if (!currentSnapshot) return
						set(
							{
								originalSnapshot: currentSnapshot,
							},
							false,
							'markAsSaved',
						)
					},

					// Clear store completely
					clearStore: () => {
						set(initialStoreState, false, 'clearStore')
					},

					// Assign a team to a specific slot
					assignTeamToSlot: (teamId, groupId, slotIndex) => {
						updateSnapshot(
							(snapshot) =>
								assignTeamToSlotSnapshot(snapshot, teamId, groupId, slotIndex),
							'assignTeamToSlot',
						)
					},

					// Move a team back to reserve
					moveTeamToConfirmed: (teamId) => {
						updateSnapshot(
							(snapshot) => moveTeamToConfirmedSnapshot(snapshot, teamId),
							'moveTeamToConfirmed',
						)
					},

					// Move team to waitlist (from group or confirmed reserve)
					moveTeamToWaitlist: (teamId) => {
						updateSnapshot(
							(snapshot) => moveTeamToWaitlistSnapshot(snapshot, teamId),
							'moveTeamToWaitlist',
						)
					},

					// Swap a team with an occupied slot
					swapTeamWithSlot: (teamId, groupId, slotIndex) => {
						updateSnapshot(
							(snapshot) =>
								swapTeamWithSlotSnapshot(snapshot, teamId, groupId, slotIndex),
							'swapTeamWithSlot',
						)
					},

					// Promote a team from waitlist to confirmed pool
					promoteFromWaitlist: (teamId) => {
						updateSnapshot(
							(snapshot) => promoteFromWaitlistSnapshot(snapshot, teamId),
							'promoteFromWaitlist',
						)
					},

					// Remove a team from the group stage entirely
					removeTeamFromGroupStage: (teamId: string) => {
						updateSnapshot(
							(snapshot) => removeTeamFromGroupStageSnapshot(snapshot, teamId),
							'removeTeamFromGroupStage',
						)
					},

					// UI state actions
					setActiveGroupIndex: (index) => {
						set({ activeGroupIndex: index }, false, 'setActiveGroupIndex')
					},

					setSaving: (saving) => {
						set({ isSaving: saving }, false, 'setSaving')
					},

					setSaveError: (error) => {
						set({ saveError: error }, false, 'setSaveError')
					},

					setConflict: (hasConflict) => {
						set({ hasConflict }, false, 'setConflict')
					},
				}
			},
			{
				name: 'group-assignment-storage',
				storage: isBrowser
					? createJSONStorage(() => sessionStorage)
					: createJSONStorage(createServerSideStorage),
				skipHydration: !isBrowser,
				partialize: (state) =>
					isBrowser
						? {
								snapshot: state.snapshot,
								originalSnapshot: state.originalSnapshot,
								activeGroupIndex: state.activeGroupIndex,
							}
						: {},
			},
		),
		{
			name: storeName,
		},
	),
)

export const useGroupAssignmentSnapshot = () =>
	useGroupAssignmentStore((state) => state.snapshot)

export const useGroupAssignmentSnapshots = () =>
	useGroupAssignmentStore(
		useShallow((state) => ({
			snapshot: state.snapshot,
			originalSnapshot: state.originalSnapshot,
		})),
	)

export const useGroupAssignmentUiState = () =>
	useGroupAssignmentStore(
		useShallow((state) => ({
			isSaving: state.isSaving,
			saveError: state.saveError,
			hasConflict: state.hasConflict,
			activeGroupIndex: state.activeGroupIndex,
		})),
	)

export const useGroupAssignmentActions = () =>
	useGroupAssignmentStore(
		useShallow((state) => ({
			setSnapshotPair: state.setSnapshotPair,
			resetSnapshotPair: state.resetSnapshotPair,
			markAsSaved: state.markAsSaved,
			clearStore: state.clearStore,
			assignTeamToSlot: state.assignTeamToSlot,
			moveTeamToConfirmed: state.moveTeamToConfirmed,
			moveTeamToWaitlist: state.moveTeamToWaitlist,
			swapTeamWithSlot: state.swapTeamWithSlot,
			promoteFromWaitlist: state.promoteFromWaitlist,
			removeTeamFromGroupStage: state.removeTeamFromGroupStage,
			setActiveGroupIndex: state.setActiveGroupIndex,
			setSaving: state.setSaving,
			setSaveError: state.setSaveError,
			setConflict: state.setConflict,
		})),
	)
