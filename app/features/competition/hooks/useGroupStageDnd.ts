import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useGroupAssignmentStore } from '../stores/useGroupAssignmentStore'
import {
	type DndTeam,
	findFirstEmptySlot,
	isReservePoolId,
	isWaitlistPoolId,
	parseGroupDropId,
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
	const moveTeamToReserve = useGroupAssignmentStore((s) => s.moveTeamToReserve)
	const swapTeamWithSlot = useGroupAssignmentStore((s) => s.swapTeamWithSlot)
	const promoteFromWaitlist = useGroupAssignmentStore((s) => s.promoteFromWaitlist)
	const getTeamLocation = useGroupAssignmentStore((s) => s.getTeamLocation)
	const getReserveCapacity = useGroupAssignmentStore((s) => s.getReserveCapacity)

	// Find team by ID in snapshot
	const findTeamById = useCallback(
		(teamId: string): DndTeam | null => {
			if (!snapshot) return null

			// Check reserve
			const reserveTeam = snapshot.reserveTeams.find((t) => t.id === teamId)
			if (reserveTeam) return reserveTeam

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

			// Check if dragging over a group container
			const groupId = parseGroupDropId(overId)
			if (groupId) {
				const group = snapshot.groups.find((g) => g.id === groupId)
				if (group) {
					const emptySlot = findFirstEmptySlot(group)
					if (emptySlot) {
						setHighlightedSlot({ groupId, slotIndex: emptySlot.slotIndex })
					} else {
						setHighlightedSlot(null)
					}
				}
			} else {
				setHighlightedSlot(null)
			}
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

			// Drop on reserve pool
			if (isReservePoolId(overId)) {
				if (teamLocation === 'group') {
					moveTeamToReserve(teamId)
				}
				return
			}

			// Drop on waitlist pool - not allowed from group
			if (isWaitlistPoolId(overId)) {
				return
			}

			// Block waitlist teams from going directly to group slots
			if (isFromWaitlist) {
				// Check if dropping on confirmed pool
				if (isReservePoolId(overId)) {
					const capacity = getReserveCapacity()
					if (capacity > 0) {
						promoteFromWaitlist(teamId)
					} else {
						toast.error(t('competition.groupAssignment.errors.noCapacity'))
					}
				} else {
					// Trying to drop waitlist team on group slot
					toast.error(t('competition.groupAssignment.errors.waitlistToGroup'))
				}
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

			// Drop on group container (auto-assign to first empty slot)
			const groupId = parseGroupDropId(overId)
			if (groupId) {
				const group = snapshot.groups.find((g) => g.id === groupId)
				if (!group) return

				const emptySlot = findFirstEmptySlot(group)
				if (emptySlot) {
					assignTeamToSlot(teamId, groupId, emptySlot.slotIndex)
				} else {
					// Group is full, need to drop on specific slot for swap
					toast.info(t('competition.groupAssignment.hints.groupFull'))
				}
			}
		},
		[
			snapshot,
			getTeamLocation,
			getReserveCapacity,
			moveTeamToReserve,
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
