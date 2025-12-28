import { useDroppable } from '@dnd-kit/core'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'

import type { DndReserveTeam } from '../utils/groupStageDnd'
import { WAITLIST_POOL_ID } from '../utils/groupStageDnd'
import { DraggableTeamChip } from './DraggableTeamChip'
import { errorBannerVariants, reservePoolVariants } from './groupAssignment.variants'

type ReserveWaitlistProps = {
	teams: readonly DndReserveTeam[]
	canPromote: boolean
	onDeleteTeam?: (teamId: string) => void
	disabled?: boolean
	className?: string
}

export function ReserveWaitlist({
	teams,
	canPromote,
	onDeleteTeam,
	disabled = false,
	className,
}: ReserveWaitlistProps): JSX.Element {
	const { t } = useTranslation()

	const { setNodeRef } = useDroppable({
		id: WAITLIST_POOL_ID,
		data: {
			type: 'waitlist-pool',
		},
		disabled: true, // Cannot drop into waitlist
	})

	const waitlistTeams = teams.filter((team) => team.isWaitlist)

	if (waitlistTeams.length === 0) {
		return null as unknown as JSX.Element
	}

	return (
		<section
			ref={setNodeRef}
			className={cn(
				reservePoolVariants({ variant: 'waitlist', isDropTarget: false }),
				className,
			)}
			aria-label={t('competition.groupAssignment.waitlist.ariaLabel', {
				count: waitlistTeams.length,
			})}
		>
			{/* Header */}
			<div className='flex items-center justify-between mb-3'>
				<div className='flex items-center gap-2'>
					{/* Waitlist icon */}
					<div className='w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 20 20'
							fill='currentColor'
							className='w-4 h-4 text-amber-600 dark:text-amber-400'
							aria-hidden='true'
						>
							<path
								fillRule='evenodd'
								d='M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z'
								clipRule='evenodd'
							/>
						</svg>
					</div>
					<h3 className='font-semibold text-base text-foreground'>
						{t('competition.groupAssignment.waitlist.title')}
					</h3>
				</div>
				<span className='text-sm text-foreground-light'>
					{t('competition.groupAssignment.waitlist.count', {
						count: waitlistTeams.length,
					})}
				</span>
			</div>

			{/* Info banner */}
			{!canPromote ? (
				<div className={cn(errorBannerVariants({ variant: 'warning' }), 'mb-3')}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 20 20'
						fill='currentColor'
						className='w-4 h-4 shrink-0'
						aria-hidden='true'
					>
						<path
							fillRule='evenodd'
							d='M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z'
							clipRule='evenodd'
						/>
					</svg>
					<span>{t('competition.groupAssignment.waitlist.noCapacity')}</span>
				</div>
			) : null}

			{/* Teams list */}
			<div className='flex flex-wrap gap-2'>
				{waitlistTeams.map((team) => (
					<DraggableTeamChip
						key={team.id}
						team={team}
						variant='waitlist'
						onDelete={onDeleteTeam}
						disabled={disabled}
					/>
				))}
			</div>

			{/* Help text */}
			<p className='mt-3 text-xs text-foreground-lighter'>
				{canPromote
					? t('competition.groupAssignment.waitlist.helpPromote')
					: t('competition.groupAssignment.waitlist.helpBlocked')}
			</p>
		</section>
	)
}
