import type { JSX } from 'react'

import { groupTabVariants, paginationDotVariants } from './groupAssignment.variants'

type GroupTab = {
	id: string
	name: string
}

type GroupAssignmentMobileTabsProps = {
	groups: readonly GroupTab[]
	activeGroupIndex: number
	onTabChange: (index: number) => void
	getAriaLabel: (name: string) => string
}

export const GroupAssignmentMobileTabs = ({
	groups,
	activeGroupIndex,
	onTabChange,
	getAriaLabel,
}: Readonly<GroupAssignmentMobileTabsProps>): JSX.Element => (
	<div className='space-y-3'>
		{/* Tab buttons */}
		<div
			role='tablist'
			className='flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-foreground-lighter/30 hover:scrollbar-thumb-foreground-lighter/50'
		>
			{groups.map((group, index) => (
				<button
					key={group.id}
					id={`group-tab-${group.id}`}
					type='button'
					role='tab'
					aria-selected={index === activeGroupIndex}
					aria-controls={`group-panel-${group.id}`}
					ref={(el) => {
						if (el && index === activeGroupIndex) {
							el.scrollIntoView({
								behavior: 'smooth',
								block: 'nearest',
								inline: 'center',
							})
						}
					}}
					onClick={() => onTabChange(index)}
					className={groupTabVariants({
						isActive: index === activeGroupIndex,
					})}
				>
					{group.name}
				</button>
			))}
		</div>

		{/* Pagination dots */}
		<div className='flex justify-center gap-1.5'>
			{groups.map((group, index) => (
				<button
					key={group.id}
					type='button'
					onClick={() => onTabChange(index)}
					className={paginationDotVariants({
						isActive: index === activeGroupIndex,
					})}
					aria-label={getAriaLabel(group.name)}
				/>
			))}
		</div>
	</div>
)
