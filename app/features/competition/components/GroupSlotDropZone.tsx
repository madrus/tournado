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
	onDeleteTeam?: (teamId: string) => void
	disabled?: boolean
}

export function GroupSlotDropZone({
	slot,
	isHighlighted = false,
	onDeleteTeam,
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

	return (
		<div
			ref={setNodeRef}
			className={groupSlotVariants({ state: slotState, isDisabled: disabled })}
		>
			{slot.team ? (
				<DraggableTeamChip
					team={slot.team}
					onDelete={onDeleteTeam}
					disabled={disabled}
					className='w-full'
				/>
			) : (
				<div className='flex flex-col items-center justify-center gap-1 py-2'>
					{/* Slot number indicator */}
					<span className='text-xs font-medium text-foreground-lighter'>
						{t('competition.groupAssignment.slot.position', {
							position: slot.slotIndex + 1,
						})}
					</span>

					{/* Drop hint */}
					{isHighlighted || isOver ? (
						<span className='text-xs text-brand animate-pulse'>
							{t('competition.groupAssignment.slot.dropHere')}
						</span>
					) : (
						<span className='text-xs text-foreground-lighter opacity-60'>
							{t('competition.groupAssignment.slot.empty')}
						</span>
					)}
				</div>
			)}
		</div>
	)
}
