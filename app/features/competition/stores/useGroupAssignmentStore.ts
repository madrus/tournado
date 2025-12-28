import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { isBrowser } from '~/lib/lib.helpers'

import type {
	DndGroup,
	DndReserveTeam,
	DndSlot,
	DndTeam,
	GroupAssignmentSnapshot,
} from '../utils/groupStageDnd'

// ---------------------------------------------------------------------------
// State Types
// ---------------------------------------------------------------------------

type StoreState = {
	// Current snapshot being edited
	snapshot: GroupAssignmentSnapshot | null
	// Original snapshot for dirty checking and reset
	originalSnapshot: GroupAssignmentSnapshot | null
	// UI state
	isSaving: boolean
	saveError: string | null
	hasConflict: boolean
	// Active group for mobile view
	activeGroupIndex: number
}

type Actions = {
	// Initialize store from loader data
	initializeFromSnapshot: (snapshot: GroupAssignmentSnapshot) => void
	// Reset to original state
	resetToOriginal: () => void
	// Clear store completely
	clearStore: () => void

	// Team assignment actions
	assignTeamToSlot: (teamId: string, groupId: string, slotIndex: number) => void
	moveTeamToReserve: (teamId: string) => void
	swapTeamWithSlot: (teamId: string, groupId: string, slotIndex: number) => void
	removeTeamFromGroupStage: (teamId: string) => void
	promoteFromWaitlist: (teamId: string) => void

	// UI state actions
	setActiveGroupIndex: (index: number) => void
	setSaving: (saving: boolean) => void
	setSaveError: (error: string | null) => void
	setConflict: (hasConflict: boolean) => void

	// Derived state selectors
	isDirty: () => boolean
	getTeamLocation: (teamId: string) => 'reserve' | 'waitlist' | 'group' | null
	getReserveCapacity: () => number
	getConfirmedTeams: () => readonly DndReserveTeam[]
	getWaitlistTeams: () => readonly DndReserveTeam[]
}

const storeName = 'GroupAssignmentStore'

const initialStoreState: StoreState = {
	snapshot: null,
	originalSnapshot: null,
	isSaving: false,
	saveError: null,
	hasConflict: false,
	activeGroupIndex: 0,
}

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

export const useGroupAssignmentStore = create<StoreState & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialStoreState,

				// Initialize from loader data
				initializeFromSnapshot: (snapshot) => {
					const currentSnapshot = get().snapshot
					// Only initialize if we don't have data or it's a different group stage
					if (
						!currentSnapshot ||
						currentSnapshot.groupStageId !== snapshot.groupStageId
					) {
						set(
							{
								snapshot,
								originalSnapshot: snapshot,
								saveError: null,
								hasConflict: false,
								activeGroupIndex: 0,
							},
							false,
							'initializeFromSnapshot',
						)
					}
				},

				// Reset to original state
				resetToOriginal: () => {
					const original = get().originalSnapshot
					if (original) {
						set(
							{
								snapshot: original,
								saveError: null,
								hasConflict: false,
							},
							false,
							'resetToOriginal',
						)
					}
				},

				// Clear store completely
				clearStore: () => {
					set(initialStoreState, false, 'clearStore')
				},

				// Assign a team to a specific slot
				assignTeamToSlot: (teamId, groupId, slotIndex) => {
					const snapshot = get().snapshot
					if (!snapshot) return

					// Find the team in reserve or another slot
					let team: DndTeam | null = null
					let sourceGroupId: string | null = null
					let sourceSlotIndex: number | null = null

					// Check reserve
					const reserveTeam = snapshot.reserveTeams.find((t) => t.id === teamId)
					if (reserveTeam) {
						team = reserveTeam
					} else {
						// Check other slots
						for (const g of snapshot.groups) {
							for (const s of g.slots) {
								if (s.team?.id === teamId) {
									team = s.team
									sourceGroupId = g.id
									sourceSlotIndex = s.slotIndex
									break
								}
							}
							if (team) break
						}
					}

					if (!team) return

					// Update groups
					const newGroups: DndGroup[] = snapshot.groups.map((g) => {
						const newSlots: DndSlot[] = g.slots.map((s) => {
							// Clear source slot if moving from another group slot
							if (sourceGroupId === g.id && sourceSlotIndex === s.slotIndex) {
								return { ...s, team: null }
							}
							// Assign to target slot
							if (g.id === groupId && s.slotIndex === slotIndex) {
								return { ...s, team }
							}
							return s
						})
						return { ...g, slots: newSlots }
					})

					// Remove from reserve if it was there
					const newReserveTeams = snapshot.reserveTeams.filter((t) => t.id !== teamId)

					// Recalculate waitlist status
					const assignedCount = newGroups.reduce(
						(count, g) => count + g.slots.filter((s) => s.team !== null).length,
						0,
					)
					const capacity = snapshot.totalSlots - assignedCount
					const updatedReserve: DndReserveTeam[] = newReserveTeams.map((t, i) => ({
						...t,
						isWaitlist: i >= capacity,
					}))

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								reserveTeams: updatedReserve,
							},
						},
						false,
						'assignTeamToSlot',
					)
				},

				// Move a team back to reserve
				moveTeamToReserve: (teamId) => {
					const snapshot = get().snapshot
					if (!snapshot) return

					// Find the team first
					let foundTeam: DndTeam | null = null
					for (const g of snapshot.groups) {
						for (const s of g.slots) {
							if (s.team?.id === teamId) {
								foundTeam = s.team
								break
							}
						}
						if (foundTeam) break
					}

					if (!foundTeam) return

					// Now remove from groups (foundTeam is guaranteed non-null here)
					const teamToAdd = foundTeam
					const newGroups: DndGroup[] = snapshot.groups.map((g) => ({
						...g,
						slots: g.slots.map((s) => {
							if (s.team?.id === teamId) {
								return { ...s, team: null }
							}
							return s
						}),
					}))

					// Add to reserve
					const newReserveTeams: DndReserveTeam[] = [
						...snapshot.reserveTeams,
						{ ...teamToAdd, isWaitlist: false },
					]

					// Recalculate waitlist status
					const assignedCount = newGroups.reduce(
						(count, g) => count + g.slots.filter((s) => s.team !== null).length,
						0,
					)
					const capacity = snapshot.totalSlots - assignedCount
					const updatedReserve: DndReserveTeam[] = newReserveTeams.map((t, i) => ({
						...t,
						isWaitlist: i >= capacity,
					}))

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								reserveTeams: updatedReserve,
							},
						},
						false,
						'moveTeamToReserve',
					)
				},

				// Swap a team with an occupied slot
				swapTeamWithSlot: (teamId, groupId, slotIndex) => {
					const snapshot = get().snapshot
					if (!snapshot) return

					// Find the incoming team
					let incomingTeam: DndTeam | null = null

					const reserveTeam = snapshot.reserveTeams.find((t) => t.id === teamId)
					if (reserveTeam) {
						incomingTeam = reserveTeam
					} else {
						for (const g of snapshot.groups) {
							for (const s of g.slots) {
								if (s.team?.id === teamId) {
									incomingTeam = s.team
									break
								}
							}
							if (incomingTeam) break
						}
					}

					if (!incomingTeam) return

					// Find the displaced team
					let displacedTeam: DndTeam | null = null
					for (const g of snapshot.groups) {
						if (g.id === groupId) {
							const slot = g.slots.find((s) => s.slotIndex === slotIndex)
							if (slot?.team) {
								displacedTeam = slot.team
							}
						}
					}

					// Update groups
					const newGroups: DndGroup[] = snapshot.groups.map((g) => ({
						...g,
						slots: g.slots.map((s) => {
							// Clear incoming team's old slot (if from a group)
							if (s.team?.id === teamId) {
								return { ...s, team: null }
							}
							// Place incoming team in target slot
							if (g.id === groupId && s.slotIndex === slotIndex) {
								return { ...s, team: incomingTeam }
							}
							return s
						}),
					}))

					// Update reserve
					let newReserveTeams = snapshot.reserveTeams.filter((t) => t.id !== teamId)
					if (displacedTeam) {
						newReserveTeams = [
							...newReserveTeams,
							{ ...displacedTeam, isWaitlist: false },
						]
					}

					// Recalculate waitlist status
					const assignedCount = newGroups.reduce(
						(count, g) => count + g.slots.filter((s) => s.team !== null).length,
						0,
					)
					const capacity = snapshot.totalSlots - assignedCount
					const updatedReserve: DndReserveTeam[] = newReserveTeams.map((t, i) => ({
						...t,
						isWaitlist: i >= capacity,
					}))

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								reserveTeams: updatedReserve,
							},
						},
						false,
						'swapTeamWithSlot',
					)
				},

				// Remove a team from the group stage entirely
				removeTeamFromGroupStage: (teamId) => {
					const snapshot = get().snapshot
					if (!snapshot) return

					// Remove from groups
					const newGroups: DndGroup[] = snapshot.groups.map((g) => ({
						...g,
						slots: g.slots.map((s) => {
							if (s.team?.id === teamId) {
								return { ...s, team: null }
							}
							return s
						}),
					}))

					// Remove from reserve
					const newReserveTeams = snapshot.reserveTeams.filter((t) => t.id !== teamId)

					// Recalculate waitlist status
					const assignedCount = newGroups.reduce(
						(count, g) => count + g.slots.filter((s) => s.team !== null).length,
						0,
					)
					const capacity = snapshot.totalSlots - assignedCount
					const updatedReserve: DndReserveTeam[] = newReserveTeams.map((t, i) => ({
						...t,
						isWaitlist: i >= capacity,
					}))

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								reserveTeams: updatedReserve,
							},
						},
						false,
						'removeTeamFromGroupStage',
					)
				},

				// Promote a team from waitlist to confirmed pool
				promoteFromWaitlist: (teamId) => {
					const snapshot = get().snapshot
					if (!snapshot) return

					const capacity = get().getReserveCapacity()
					if (capacity <= 0) return // No room in confirmed pool

					const teamIndex = snapshot.reserveTeams.findIndex((t) => t.id === teamId)
					if (teamIndex === -1) return

					// Move team to front of reserve (will be in confirmed pool)
					const team = snapshot.reserveTeams[teamIndex]
					const otherTeams = snapshot.reserveTeams.filter((t) => t.id !== teamId)
					const newReserveTeams: DndReserveTeam[] = [
						{ ...team, isWaitlist: false },
						...otherTeams,
					]

					// Recalculate waitlist status
					const assignedCount = snapshot.groups.reduce(
						(count, g) => count + g.slots.filter((s) => s.team !== null).length,
						0,
					)
					const newCapacity = snapshot.totalSlots - assignedCount
					const updatedReserve: DndReserveTeam[] = newReserveTeams.map((t, i) => ({
						...t,
						isWaitlist: i >= newCapacity,
					}))

					set(
						{
							snapshot: {
								...snapshot,
								reserveTeams: updatedReserve,
							},
						},
						false,
						'promoteFromWaitlist',
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

				// Check if state has changed from original
				isDirty: () => {
					const { snapshot, originalSnapshot } = get()
					if (!snapshot || !originalSnapshot) return false
					return JSON.stringify(snapshot) !== JSON.stringify(originalSnapshot)
				},

				// Get team location
				getTeamLocation: (teamId) => {
					const snapshot = get().snapshot
					if (!snapshot) return null

					const reserveTeam = snapshot.reserveTeams.find((t) => t.id === teamId)
					if (reserveTeam) {
						return reserveTeam.isWaitlist ? 'waitlist' : 'reserve'
					}

					for (const g of snapshot.groups) {
						for (const s of g.slots) {
							if (s.team?.id === teamId) {
								return 'group'
							}
						}
					}

					return null
				},

				// Get remaining reserve capacity
				getReserveCapacity: () => {
					const snapshot = get().snapshot
					if (!snapshot) return 0

					const assignedCount = snapshot.groups.reduce(
						(count, g) => count + g.slots.filter((s) => s.team !== null).length,
						0,
					)
					return snapshot.totalSlots - assignedCount
				},

				// Get confirmed teams (not on waitlist)
				getConfirmedTeams: () => {
					const snapshot = get().snapshot
					if (!snapshot) return []
					return snapshot.reserveTeams.filter((t) => !t.isWaitlist)
				},

				// Get waitlist teams
				getWaitlistTeams: () => {
					const snapshot = get().snapshot
					if (!snapshot) return []
					return snapshot.reserveTeams.filter((t) => t.isWaitlist)
				},
			}),
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
