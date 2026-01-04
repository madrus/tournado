import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'

import type { DndGroup } from '../utils/groupStageDnd'
import { GroupSlotDropZone } from './GroupSlotDropZone'
import { groupCardVariants } from './groupAssignment.variants'

type GroupCardProps = {
	group: DndGroup
	highlightedSlot?: { groupId: string; slotIndex: number } | null
	disabled?: boolean
	className?: string
}

export function GroupCard({
	group,
	highlightedSlot,
	disabled = false,
	className,
}: GroupCardProps): JSX.Element {
	const { t } = useTranslation()

	// Count filled and empty slots
	const filledSlots = group.slots.filter((s) => s.team !== null).length
	const totalSlots = group.slots.length

	return (
		<section
			className={cn(
				groupCardVariants({ isDropTarget: false, isDragOver: false }),
				className,
			)}
			data-testid={`group-card-${group.id}`}
			aria-label={t('competition.groupAssignment.group.ariaLabel', {
				name: group.name,
				filled: filledSlots,
				total: totalSlots,
			})}
		>
			{/* Group header */}
			<div className='flex items-center justify-between mb-3'>
				<h3 className='font-semibold text-lg text-title'>{group.name}</h3>
				<span className='text-sm text-foreground-light'>
					{t('competition.groupAssignment.group.slotsCount', {
						filled: filledSlots,
						total: totalSlots,
					})}
				</span>
			</div>

			{/* Slots list */}
			<div className='flex flex-col gap-2'>
				{group.slots.map((slot) => (
					<GroupSlotDropZone
						key={slot.slotId}
						slot={slot}
						isHighlighted={
							highlightedSlot?.groupId === group.id &&
							highlightedSlot?.slotIndex === slot.slotIndex
						}
						disabled={disabled}
					/>
				))}
			</div>
		</section>
	)
}
