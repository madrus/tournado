import { JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRevalidator } from 'react-router'

import { ApparelIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import { TeamList } from '~/features/teams/components/TeamList'
import type { TeamListItem } from '~/features/teams/types'
import { TournamentFilter } from '~/features/tournaments/components/TournamentFilter'
import type { TournamentListItem } from '~/features/tournaments/types'
import { STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type TeamsPageContentProps = {
  teamListItems: TeamListItem[]
  tournamentListItems: TournamentListItem[]
  selectedTournamentId: string | null
  onTeamClick: (teamId: string) => void
  showStats?: boolean
  testId?: string
}

// Teal is a valid ColorAccent token from the project's semantic palette
const PANEL_COLOR = 'teal' as const

export function TeamsPageContent({
  teamListItems,
  tournamentListItems,
  selectedTournamentId,
  onTeamClick,
  showStats = false,
  testId = 'teams-layout',
}: TeamsPageContentProps): JSX.Element {
  const { t } = useTranslation()
  const revalidator = useRevalidator()

  useEffect(() => {
    const handlePopState = () => {
      revalidator.revalidate()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [revalidator])

  if (showStats) {
    // Admin layout with stats panel
    return (
      <div className='space-y-6' data-testid={testId}>
        {/* Stats using optimized dashboard panels */}
        <div
          className={cn(
            'grid w-full grid-cols-1 gap-5 lg:w-fit',
            STATS_PANEL_MIN_WIDTH
          )}
        >
          <Panel
            color={PANEL_COLOR}
            variant='dashboard-panel'
            icon={<ApparelIcon size={24} variant='outlined' />}
            iconColor='brand'
            title={t('admin.team.totalTeams')}
            showGlow
            data-testid='teams-total-stat'
          >
            {teamListItems.length}
          </Panel>
        </div>

        {/* Teams List */}
        <div className={cn('w-full lg:w-fit', STATS_PANEL_MIN_WIDTH)}>
          <Panel color={PANEL_COLOR} variant='content-panel'>
            {/* Tournament Filter */}
            <div className='mb-6'>
              <TournamentFilter
                tournamentListItems={tournamentListItems}
                selectedTournamentId={selectedTournamentId ?? undefined}
                color={PANEL_COLOR}
              />
            </div>

            <TeamList
              teams={teamListItems}
              onTeamClick={onTeamClick}
              emptyMessage={t('teams.noTeams')}
            />
          </Panel>
        </div>
      </div>
    )
  }

  // Public layout without stats
  return (
    <div className='space-y-6' data-testid={testId}>
      {/* Tournament Filter */}
      <Panel color={PANEL_COLOR}>
        <TournamentFilter
          tournamentListItems={tournamentListItems}
          selectedTournamentId={selectedTournamentId ?? undefined}
          color={PANEL_COLOR}
        />
      </Panel>

      {/* Teams Count */}
      {teamListItems.length > 0 ? (
        <div className='text-foreground text-sm'>
          {t('teams.count', { count: teamListItems.length })}
          {selectedTournamentId ? (
            <span>
              {' '}
              (
              {
                tournamentListItems.find(
                  tournament => tournament.id === selectedTournamentId
                )?.name
              }
              )
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Teams Grid */}
      <TeamList
        teams={teamListItems}
        onTeamClick={onTeamClick}
        emptyMessage={t('teams.noTeams')}
        className='min-h-52'
      />

      {/* Info Section */}
      {teamListItems.length === 0 ? (
        <Panel color={PANEL_COLOR} className='mt-8'>
          <h3 className={cn('text-lg font-medium', getLatinTitleClass())}>
            {t('teams.getStarted.title')}
          </h3>
          <p className='text-foreground mt-2'>{t('teams.getStarted.description')}</p>
        </Panel>
      ) : null}
    </div>
  )
}
