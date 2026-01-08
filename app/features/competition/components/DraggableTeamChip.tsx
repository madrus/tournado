import { useDraggable } from '@dnd-kit/core'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
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
	isDropTarget?: boolean
	className?: string
}

export function DraggableTeamChip({
	team,
	variant = 'default',
	size = 'md',
	disabled = false,
	isDropTarget = false,
	className,
}: Readonly<DraggableTeamChipProps>): JSX.Element {
	const dragId = createTeamDragId(team.id)
	const { t } = useTranslation()

	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: dragId,
		data: {
			type: 'team-chip',
			teamId: team.id,
		},
		disabled,
	})

	return (
		<button
			ref={setNodeRef}
			className={cn(
				draggableChipVariants({ isDragging, variant, size }),
				'motion-reduce:transition-none',
				isDropTarget && !isDragging && 'scale-[1.02]',
				disabled && 'opacity-50 cursor-not-allowed',
				className,
			)}
			aria-label={t('competition.groupAssignment.chip.ariaLabel', {
				club: team.clubName,
				team: team.name,
			})}
			data-team-id={team.id}
			{...listeners}
			{...attributes}
			data-testid={`team-chip-${team.id}`}
		>
			<span className={cn('truncate max-w-[180px]', getLatinTextClass())}>
				{team.clubName} {team.name}
			</span>
		</button>
	)
}

// Drag overlay version for smooth dragging animation
type DragOverlayChipProps = {
	team: DndTeam
	hideLabel?: boolean
}

export function DragOverlayChip({
	team,
	hideLabel = false,
}: DragOverlayChipProps): JSX.Element {
	return (
		<div
			className={cn(
				draggableChipVariants({ variant: 'confirmed', isDragging: false, size: 'md' }),
				'shadow-xl shadow-brand/30',
				'cursor-grabbing',
				'pointer-events-none',
				'transition-none',
			)}
		>
			{!hideLabel ? (
				<span className={cn('truncate max-w-[180px]', getLatinTextClass())}>
					{team.clubName} {team.name}
				</span>
			) : null}
		</div>
	)
}
