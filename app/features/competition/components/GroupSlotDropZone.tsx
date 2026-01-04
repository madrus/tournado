import { useDroppable } from '@dnd-kit/core'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import type { DndSlot } from '../utils/groupStageDnd'
import { createSlotDropId } from '../utils/groupStageDnd'
import { DraggableTeamChip } from './DraggableTeamChip'
import { groupSlotVariants } from './groupAssignment.variants'

type GroupSlotDropZoneProps = {
	slot: DndSlot
	isHighlighted?: boolean
	disabled?: boolean
}

export function GroupSlotDropZone({
	slot,
	isHighlighted = false,
	disabled = false,
}: GroupSlotDropZoneProps): JSX.Element {
	const { t } = useTranslation()
	const dropId = createSlotDropId(slot.groupId, slot.slotIndex)

	const { isOver, setNodeRef } = useDroppable({
		id: dropId,
		data: {
			type: 'group-slot',
			slotId: slot.slotId,
			groupId: slot.groupId,
			slotIndex: slot.slotIndex,
		},
		disabled,
	})

	// Determine slot state
	const getSlotState = () => {
		if (slot.team) return 'occupied'
		if (isOver) return 'dropTarget'
		if (isHighlighted) return 'highlighted'
		return 'empty'
	}

	const slotState = getSlotState()

	return slot.team ? (
		<div ref={setNodeRef} data-testid={`group-slot-${slot.slotIndex}`}>
			<DraggableTeamChip team={slot.team} disabled={disabled} />
		</div>
	) : (
		<div
			ref={setNodeRef}
			data-testid={`group-slot-${slot.slotIndex}`}
			className={groupSlotVariants({ state: slotState, isDisabled: disabled })}
		>
			<span
				className={
					isHighlighted || isOver
						? 'text-xs font-medium text-brand animate-pulse'
						: 'text-xs font-medium text-foreground-lighter'
				}
			>
				{t('competition.groupAssignment.slot.label', {
					number: slot.slotIndex + 1,
				})}
			</span>
		</div>
	)
}
