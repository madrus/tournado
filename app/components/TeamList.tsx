import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'

import { TeamChip } from './TeamChip'

type TeamListProps = {
  teams: Array<{
    id: string
    clubName: string
    name: string
  }>
  onTeamClick?: (teamId: string) => void
  className?: string
  emptyMessage?: string
}

export function TeamList({
  teams,
  onTeamClick,
  className = '',
  emptyMessage,
}: TeamListProps): JSX.Element {
  const { t } = useTranslation()

  if (teams.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <p className='text-foreground text-center'>
          {emptyMessage || t('teams.noTeams')}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Flex container for chips */}
      <div className='flex flex-wrap items-start gap-3'>
        {teams.map(team => (
          <TeamChip
            key={team.id}
            team={team}
            onClick={onTeamClick ? () => onTeamClick(team.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
