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
  context: 'public' | 'admin'
  onTeamClick?: (teamId: string) => void
  onTeamDelete?: (teamId: string) => void
  className?: string
  emptyMessage?: string
}

export function TeamList({
  teams,
  context,
  onTeamClick,
  onTeamDelete,
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
            showActions={context === 'admin'}
            onDelete={onTeamDelete ? () => onTeamDelete(team.id) : undefined}
            deleteAriaLabel={`${t('teams.deleteTeam')} ${team.clubName} ${team.name}`}
          />
        ))}
      </div>
    </div>
  )
}
