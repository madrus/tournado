import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useGroupAssignmentStore } from '../stores/useGroupAssignmentStore'
import {
	type DndTeam,
	isConfirmedPoolId,
	isWaitlistPoolId,
	parseSlotDropId,
	parseTeamDragId,
} from '../utils/groupStageDnd'

type UseGroupStageDndResult = {
	// Active drag state
	activeDragTeam: DndTeam | null
	isDragging: boolean

	// Event handlers
	handleDragStart: (event: DragStartEvent) => void
	handleDragOver: (event: DragOverEvent) => void
	handleDragEnd: (event: DragEndEvent) => void
	handleDragCancel: () => void

	// Drop target state
	activeDropTarget: string | null
	highlightedSlot: { groupId: string; slotIndex: number } | null
}

export const useGroupStageDnd = (): UseGroupStageDndResult => {
	const { t } = useTranslation()
	const [activeDragTeam, setActiveDragTeam] = useState<DndTeam | null>(null)
	const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null)
	const [highlightedSlot, setHighlightedSlot] = useState<{
		groupId: string
		slotIndex: number
	} | null>(null)

	const snapshot = useGroupAssignmentStore((s) => s.snapshot)
	const assignTeamToSlot = useGroupAssignmentStore((s) => s.assignTeamToSlot)
	const moveTeamToConfirmed = useGroupAssignmentStore((s) => s.moveTeamToConfirmed)
	const moveTeamToWaitlist = useGroupAssignmentStore((s) => s.moveTeamToWaitlist)
	const swapTeamWithSlot = useGroupAssignmentStore((s) => s.swapTeamWithSlot)
	const promoteFromWaitlist = useGroupAssignmentStore((s) => s.promoteFromWaitlist)
	const getTeamLocation = useGroupAssignmentStore((s) => s.getTeamLocation)
	const getConfirmedCapacity = useGroupAssignmentStore((s) => s.getConfirmedCapacity)

	// Find team by ID in snapshot
	const findTeamById = useCallback(
		(teamId: string): DndTeam | null => {
			if (!snapshot) return null

			// Check reserve
			const unassignedTeam = snapshot.unassignedTeams.find((t) => t.id === teamId)
			if (unassignedTeam) return unassignedTeam

			// Check groups
			for (const group of snapshot.groups) {
				for (const slot of group.slots) {
					if (slot.team?.id === teamId) {
						return slot.team
					}
				}
			}

			return null
		},
		[snapshot],
	)

	// Handle drag start
	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const teamId = parseTeamDragId(String(event.active.id))
			if (teamId) {
				const team = findTeamById(teamId)
				setActiveDragTeam(team)
			}
		},
		[findTeamById],
	)

	// Handle drag over - update visual indicators
	const handleDragOver = useCallback(
		(event: DragOverEvent) => {
			const { over } = event
			if (!over || !snapshot || !activeDragTeam) {
				setActiveDropTarget(null)
				setHighlightedSlot(null)
				return
			}

			const overId = String(over.id)
			setActiveDropTarget(overId)

			// No group-level highlighting - only individual slots are droppable
			setHighlightedSlot(null)
		},
		[snapshot, activeDragTeam],
	)

	// Handle drag end - perform the actual move
	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event

			// Reset drag state
			setActiveDragTeam(null)
			setActiveDropTarget(null)
			setHighlightedSlot(null)

			if (!over || !snapshot) return

			const teamId = parseTeamDragId(String(active.id))
			if (!teamId) return

			const overId = String(over.id)
			const teamLocation = getTeamLocation(teamId)
			const isFromWaitlist = teamLocation === 'waitlist'

			// Drop on confirmed pool
			if (isConfirmedPoolId(overId)) {
				if (teamLocation === 'waitlist') {
					// Promote from waitlist
					const capacity = getConfirmedCapacity()
					if (capacity > 0) {
						promoteFromWaitlist(teamId)
					} else {
						toast.error(t('competition.groupAssignment.errors.noCapacity'))
					}
				} else if (teamLocation === 'group') {
					moveTeamToConfirmed(teamId)
				}
				return
			}

			// Drop on waitlist pool
			if (isWaitlistPoolId(overId)) {
				// Allow moving teams from groups or confirmed reserve to waitlist
				if (teamLocation === 'group' || teamLocation === 'confirmed') {
					moveTeamToWaitlist(teamId)
				}
				return
			}

			// Block waitlist teams from going directly to group slots
			if (isFromWaitlist) {
				toast.error(t('competition.groupAssignment.errors.waitlistToGroup'))
				return
			}

			// Drop on specific slot
			const slotData = parseSlotDropId(overId)
			if (slotData) {
				const { groupId, slotIndex } = slotData

				// Find the target slot
				const group = snapshot.groups.find((g) => g.id === groupId)
				if (!group) return

				const targetSlot = group.slots.find((s) => s.slotIndex === slotIndex)
				if (!targetSlot) return

				// Check if dropping on same slot
				if (targetSlot.team?.id === teamId) {
					return // No action needed
				}

				// If slot is occupied, swap
				if (targetSlot.team) {
					swapTeamWithSlot(teamId, groupId, slotIndex)
				} else {
					assignTeamToSlot(teamId, groupId, slotIndex)
				}
				return
			}

			// No group container drops - only individual slots are droppable
		},
		[
			snapshot,
			getTeamLocation,
			getConfirmedCapacity,
			moveTeamToConfirmed,
			moveTeamToWaitlist,
			assignTeamToSlot,
			swapTeamWithSlot,
			promoteFromWaitlist,
			t,
		],
	)

	// Handle drag cancel
	const handleDragCancel = useCallback(() => {
		setActiveDragTeam(null)
		setActiveDropTarget(null)
		setHighlightedSlot(null)
	}, [])

	return {
		activeDragTeam,
		isDragging: activeDragTeam !== null,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
		activeDropTarget,
		highlightedSlot,
	}
}
