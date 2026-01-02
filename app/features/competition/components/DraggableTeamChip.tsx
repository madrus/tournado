import { useDraggable } from '@dnd-kit/core'
import type { JSX } from 'react'

import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

import type { DndTeam } from '../utils/groupStageDnd'
import { createTeamDragId } from '../utils/groupStageDnd'
import {
	type DraggableChipVariants,
	draggableChipVariants,
} from './groupAssignment.variants'

type DraggableTeamChipProps = {
	team: DndTeam
	variant?: DraggableChipVariants['variant']
	size?: DraggableChipVariants['size']
	disabled?: boolean
	className?: string
}

export function DraggableTeamChip({
	team,
	variant = 'default',
	size = 'md',
	disabled = false,
	className,
}: DraggableTeamChipProps): JSX.Element {
	const dragId = createTeamDragId(team.id)

	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: dragId,
		data: {
			type: 'team-chip',
			teamId: team.id,
		},
		disabled,
	})

	return (
		<div
			ref={setNodeRef}
			className={cn(
				draggableChipVariants({ isDragging, variant, size }),
				disabled && 'opacity-50 cursor-not-allowed',
				className,
			)}
			{...listeners}
			{...attributes}
		>
			<span className={cn('truncate max-w-[180px]', getLatinTextClass())}>
				{team.clubName} {team.name}
			</span>
		</div>
	)
}

// Drag overlay version for smooth dragging animation
type DragOverlayChipProps = {
	team: DndTeam
}

export function DragOverlayChip({ team }: DragOverlayChipProps): JSX.Element {
	return (
		<div
			className={cn(
				draggableChipVariants({ variant: 'confirmed', isDragging: false, size: 'md' }),
				'shadow-xl shadow-brand/30',
				'cursor-grabbing',
			)}
		>
			<span className={cn('truncate max-w-[180px]', getLatinTextClass())}>
				{team.clubName} {team.name}
			</span>
		</div>
	)
}
