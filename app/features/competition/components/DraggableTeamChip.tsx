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
	onDelete?: (teamId: string) => void
	disabled?: boolean
	className?: string
}

export function DraggableTeamChip({
	team,
	variant = 'default',
	size = 'md',
	onDelete,
	disabled = false,
	className,
}: DraggableTeamChipProps): JSX.Element {
	const { t } = useTranslation()
	const dragId = createTeamDragId(team.id)

	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: dragId,
		data: {
			type: 'team-chip',
			teamId: team.id,
		},
		disabled,
	})

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		e.preventDefault()
		onDelete?.(team.id)
	}

	const handleDeleteKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.stopPropagation()
			e.preventDefault()
			onDelete?.(team.id)
		}
	}

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'group relative',
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

			{onDelete && !disabled ? (
				<button
					type='button'
					onClick={handleDeleteClick}
					onKeyDown={handleDeleteKeyDown}
					className={cn(
						'absolute -top-2 -end-2',
						'flex items-center justify-center',
						'w-5 h-5 rounded-full',
						'bg-red-500 hover:bg-red-600 text-white',
						'shadow-md',
						'opacity-0 group-hover:opacity-100 focus:opacity-100',
						'transition-opacity duration-150',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2',
					)}
					aria-label={t('common.actions.delete')}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 20 20'
						fill='currentColor'
						className='w-3 h-3'
						aria-hidden='true'
					>
						<path d='M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z' />
					</svg>
				</button>
			) : null}
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
