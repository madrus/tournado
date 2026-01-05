import { useDroppable } from '@dnd-kit/core'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { CheckMarkIcon } from '~/components/icons'
import { cn } from '~/utils/misc'

import type { DndUnassignedTeam } from '../utils/groupStageDnd'
import { CONFIRMED_POOL_ID } from '../utils/groupStageDnd'
import { DraggableTeamChip } from './DraggableTeamChip'
import { emptyStateVariants, unassignedPoolVariants } from './groupAssignment.variants'

type ConfirmedPoolProps = {
	teams: readonly DndUnassignedTeam[]
	capacity: number
	disabled?: boolean
	className?: string
}

export function ConfirmedPool({
	teams,
	capacity,
	disabled = false,
	className,
}: ConfirmedPoolProps): JSX.Element {
	const { t } = useTranslation()

	const { isOver, setNodeRef } = useDroppable({
		id: CONFIRMED_POOL_ID,
		data: {
			type: 'reserve-pool',
		},
		disabled,
	})

	const confirmedTeams = teams.filter((team) => !team.isWaitlist)

	return (
		<section
			ref={setNodeRef}
			data-testid='confirmed-pool'
			className={cn(
				unassignedPoolVariants({ variant: 'confirmed', isDropTarget: isOver }),
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
					<CheckMarkIcon
						backgroundClassName='h-6 w-6 rounded-full bg-primary-500/20'
						className='text-primary-600 dark:text-primary-400'
						size={16}
					/>
					<h3 className='font-semibold text-base text-title'>
						{t('competition.groupAssignment.reserve.title')}
					</h3>
				</div>
				<span className='text-sm text-foreground'>
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
