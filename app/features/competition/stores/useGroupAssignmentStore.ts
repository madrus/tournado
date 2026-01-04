import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { isBrowser } from '~/lib/lib.helpers'

import type {
	DndGroup,
	DndSlot,
	DndTeam,
	DndUnassignedTeam,
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
	moveTeamToConfirmed: (teamId: string) => void
	moveTeamToWaitlist: (teamId: string) => void
	swapTeamWithSlot: (teamId: string, groupId: string, slotIndex: number) => void
	promoteFromWaitlist: (teamId: string) => void
	removeTeamFromGroupStage: (teamId: string) => void

	// UI state actions
	setActiveGroupIndex: (index: number) => void
	setSaving: (saving: boolean) => void
	setSaveError: (error: string | null) => void
	setConflict: (hasConflict: boolean) => void

	// Derived state selectors
	isDirty: () => boolean
	getTeamLocation: (teamId: string) => 'confirmed' | 'waitlist' | 'group' | null
	getConfirmedCapacity: () => number
	getConfirmedTeams: () => readonly DndUnassignedTeam[]
	getWaitlistTeams: () => readonly DndUnassignedTeam[]
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
					const unassignedTeam = snapshot.unassignedTeams.find((t) => t.id === teamId)
					if (unassignedTeam) {
						team = unassignedTeam
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
					const newUnassignedTeams = snapshot.unassignedTeams.filter(
						(t) => t.id !== teamId,
					)

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								unassignedTeams: newUnassignedTeams,
							},
						},
						false,
						'assignTeamToSlot',
					)
				},

				// Move a team back to reserve
				moveTeamToConfirmed: (teamId) => {
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

					// Add to reserve as confirmed (we just freed a slot by removing from group)
					const newUnassignedTeams: DndUnassignedTeam[] = [
						...snapshot.unassignedTeams,
						{ ...teamToAdd, isWaitlist: false },
					]

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								unassignedTeams: newUnassignedTeams,
							},
						},
						false,
						'moveTeamToConfirmed',
					)
				},

				// Move team to waitlist (from group or confirmed reserve)
				moveTeamToWaitlist: (teamId) => {
					const snapshot = get().snapshot
					if (!snapshot) return

					// Find the team (could be in groups or reserve)
					let foundTeam: DndTeam | null = null

					// Check groups first
					for (const g of snapshot.groups) {
						for (const s of g.slots) {
							if (s.team?.id === teamId) {
								foundTeam = s.team
								break
							}
						}
						if (foundTeam) break
					}

					// Check reserve if not found in groups
					if (!foundTeam) {
						const unassignedTeam = snapshot.unassignedTeams.find((t) => t.id === teamId)
						if (unassignedTeam) {
							foundTeam = unassignedTeam
						}
					}

					if (!foundTeam) return

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

					// Remove from reserve if it was there
					const filteredUnassigned = snapshot.unassignedTeams.filter(
						(t) => t.id !== teamId,
					)

					// Add to end of reserve as waitlisted
					const newUnassignedTeams: DndUnassignedTeam[] = [
						...filteredUnassigned,
						{ ...foundTeam, isWaitlist: true },
					]

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								unassignedTeams: newUnassignedTeams,
							},
						},
						false,
						'moveTeamToWaitlist',
					)
				},

				// Swap a team with an occupied slot
				swapTeamWithSlot: (teamId, groupId, slotIndex) => {
					const snapshot = get().snapshot
					if (!snapshot) return

					// Find the incoming team
					let incomingTeam: DndTeam | null = null

					const unassignedTeam = snapshot.unassignedTeams.find((t) => t.id === teamId)
					if (unassignedTeam) {
						incomingTeam = unassignedTeam
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

					// Update reserve: remove incoming team, add displaced team as confirmed
					let newUnassignedTeams = snapshot.unassignedTeams.filter(
						(t) => t.id !== teamId,
					)
					if (displacedTeam) {
						newUnassignedTeams = [
							...newUnassignedTeams,
							{ ...displacedTeam, isWaitlist: false },
						]
					}

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								unassignedTeams: newUnassignedTeams,
							},
						},
						false,
						'swapTeamWithSlot',
					)
				},

				// Remove a team from the group stage entirely
				removeTeamFromGroupStage: (teamId: string) => {
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
					const newUnassignedTeams = snapshot.unassignedTeams.filter(
						(t) => t.id !== teamId,
					)

					set(
						{
							snapshot: {
								...snapshot,
								groups: newGroups,
								unassignedTeams: newUnassignedTeams,
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

					const capacity = get().getConfirmedCapacity()
					if (capacity <= 0) return // No room in confirmed pool

					// Check if we're already at the confirmed team limit
					const currentConfirmedCount = snapshot.unassignedTeams.filter(
						(t) => !t.isWaitlist,
					).length
					if (currentConfirmedCount >= capacity) return // Already at capacity

					const teamIndex = snapshot.unassignedTeams.findIndex((t) => t.id === teamId)
					if (teamIndex === -1) return

					// Promote the team to confirmed status (capacity was already checked)
					const newUnassignedTeams: DndUnassignedTeam[] = snapshot.unassignedTeams.map(
						(t) => (t.id === teamId ? { ...t, isWaitlist: false } : t),
					)

					set(
						{
							snapshot: {
								...snapshot,
								unassignedTeams: newUnassignedTeams,
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
				getTeamLocation: (teamId: string) => {
					const snapshot = get().snapshot
					if (!snapshot) return null

					const unassignedTeam = snapshot.unassignedTeams.find((t) => t.id === teamId)
					if (unassignedTeam) {
						return unassignedTeam.isWaitlist ? 'waitlist' : 'confirmed'
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
				getConfirmedCapacity: () => {
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
					return snapshot.unassignedTeams.filter((t) => !t.isWaitlist)
				},

				// Get waitlist teams
				getWaitlistTeams: () => {
					const snapshot = get().snapshot
					if (!snapshot) return []
					return snapshot.unassignedTeams.filter((t) => t.isWaitlist)
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
