import { useDroppable } from '@dnd-kit/core'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/utils/misc'
import type { DndSlot } from '../utils/groupStageDnd'
import { createSlotDropId } from '../utils/groupStageDnd'
import { DraggableTeamChip } from './DraggableTeamChip'
import { groupSlotVariants } from './groupAssignment.variants'

type GroupSlotDropZoneProps = {
	slot: DndSlot
	disabled?: boolean
}

export function GroupSlotDropZone({
	slot,
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
	function getSlotState(): 'empty' | 'occupied' | 'dropTarget' {
		if (slot.team) return 'occupied'
		if (isOver) return 'dropTarget'
		return 'empty'
	}

	const slotState = getSlotState()

	return slot.team ? (
		<div
			ref={setNodeRef}
			data-testid={`group-slot-${slot.slotIndex}`}
			className={cn(
				'relative rounded-lg',
				isOver &&
					"bg-brand/10 ring-2 ring-brand/30 shadow-md shadow-brand/20 before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-dashed before:border-brand before:content-[''] before:pointer-events-none",
			)}
		>
			<DraggableTeamChip team={slot.team} disabled={disabled} isDropTarget={isOver} />
		</div>
	) : (
		<div
			ref={setNodeRef}
			data-testid={`group-slot-${slot.slotIndex}`}
			className={groupSlotVariants({ state: slotState, isDisabled: disabled })}
		>
			<span
				className={cn(
					'text-xs font-medium',
					isOver ? 'text-brand animate-pulse' : 'text-foreground-lighter',
				)}
			>
				{t('competition.groupAssignment.slot.label', {
					number: slot.slotIndex + 1,
				})}
			</span>
		</div>
	)
}
