import { useDroppable } from '@dnd-kit/core'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'

import type { DndReserveTeam } from '../utils/groupStageDnd'
import { RESERVE_POOL_ID } from '../utils/groupStageDnd'
import { DraggableTeamChip } from './DraggableTeamChip'
import { emptyStateVariants, reservePoolVariants } from './groupAssignment.variants'

type ReservePoolProps = {
	teams: readonly DndReserveTeam[]
	capacity: number
	onDeleteTeam?: (teamId: string) => void
	disabled?: boolean
	className?: string
}

export function ReservePool({
	teams,
	capacity,
	onDeleteTeam,
	disabled = false,
	className,
}: ReservePoolProps): JSX.Element {
	const { t } = useTranslation()

	const { isOver, setNodeRef } = useDroppable({
		id: RESERVE_POOL_ID,
		data: {
			type: 'reserve-pool',
		},
		disabled,
	})

	const confirmedTeams = teams.filter((team) => !team.isWaitlist)

	return (
		<section
			ref={setNodeRef}
			className={cn(
				reservePoolVariants({ variant: 'confirmed', isDropTarget: isOver }),
				className,
			)}
			aria-label={t('competition.groupAssignment.reserve.ariaLabel', {
				count: confirmedTeams.length,
				capacity,
			})}
		>
			{/* Header */}
			<div className='flex items-center justify-between mb-3'>
				<div className='flex items-center gap-2'>
					{/* Confirmed icon */}
					<div className='w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 20 20'
							fill='currentColor'
							className='w-4 h-4 text-primary-600 dark:text-primary-400'
							aria-hidden='true'
						>
							<path
								fillRule='evenodd'
								d='M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z'
								clipRule='evenodd'
							/>
						</svg>
					</div>
					<h3 className='font-semibold text-base text-foreground'>
						{t('competition.groupAssignment.reserve.title')}
					</h3>
				</div>
				<span className='text-sm text-foreground-light'>
					{t('competition.groupAssignment.reserve.count', {
						count: confirmedTeams.length,
						capacity,
					})}
				</span>
			</div>

			{/* Teams list */}
			{confirmedTeams.length > 0 ? (
				<div className='flex flex-wrap gap-2'>
					{confirmedTeams.map((team) => (
						<DraggableTeamChip
							key={team.id}
							team={team}
							variant='confirmed'
							onDelete={onDeleteTeam}
							disabled={disabled}
						/>
					))}
				</div>
			) : (
				<div className={emptyStateVariants()}>
					<span className='text-sm'>
						{t('competition.groupAssignment.reserve.empty')}
					</span>
					{isOver ? (
						<span className='text-xs text-primary-600 dark:text-primary-400 mt-1 animate-pulse'>
							{t('competition.groupAssignment.reserve.dropToAdd')}
						</span>
					) : null}
				</div>
			)}

			{/* Drop hint */}
			{isOver && confirmedTeams.length > 0 ? (
				<div className='mt-3 text-center'>
					<span className='text-xs text-primary-600 dark:text-primary-400 font-medium animate-pulse'>
						{t('competition.groupAssignment.reserve.dropToAdd')}
					</span>
				</div>
			) : null}
		</section>
	)
}
