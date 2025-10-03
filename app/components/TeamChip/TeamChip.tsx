import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

import { teamChipVariants, type TeamChipVariants } from './teamChip.variants'

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
  const { i18n } = useTranslation()

  const baseClasses = cn(
    teamChipVariants({
      interactive: !!onClick,
      color,
    }),
    className
  )

  const teamText = (
    <span className={cn('truncate', getLatinTextClass(i18n.language))}>
      {`${team.clubName} ${team.name}`}
    </span>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={baseClasses}
        type='button'
        data-testid='team-chip'
      >
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
