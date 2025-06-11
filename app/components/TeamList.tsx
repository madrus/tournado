import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { TeamChip } from './TeamChip'

type TeamListProps = {
  teams: Array<{
    id: string
    clubName: string
    teamName: string
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
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <p className='text-center text-gray-500'>
          {emptyMessage || t('teams.noTeams')}
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Grid container for chips */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {teams.map(team => (
          <TeamChip
            key={team.id}
            team={team}
            onClick={onTeamClick ? () => onTeamClick(team.id) : undefined}
            showActions={context === 'admin'}
            onDelete={onTeamDelete ? () => onTeamDelete(team.id) : undefined}
            className='w-full justify-start'
          />
        ))}
      </div>
    </div>
  )
}
