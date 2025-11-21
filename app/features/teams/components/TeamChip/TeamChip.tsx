import type { JSX } from 'react'

import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

import { type TeamChipVariants, teamChipVariants } from './teamChip.variants'

type TeamChipProps = {
	team: {
		id: string
		clubName: string
		name: string
	}
	onClick?: () => void
	color?: TeamChipVariants['color']
	className?: string
}

export function TeamChip({
	team,
	onClick,
	color = 'brand',
	className = '',
}: TeamChipProps): JSX.Element {
	const baseClasses = cn(
		teamChipVariants({
			interactive: !!onClick,
			color,
		}),
		className,
	)

	const teamText = (
		<span className={cn('truncate', getLatinTextClass())}>{`${team.clubName} ${team.name}`}</span>
	)

	if (onClick) {
		return (
			<button onClick={onClick} className={baseClasses} type='button' data-testid='team-chip'>
				{teamText}
			</button>
		)
	}

	return (
		<div className={baseClasses} data-testid='team-chip'>
			{teamText}
		</div>
	)
}
