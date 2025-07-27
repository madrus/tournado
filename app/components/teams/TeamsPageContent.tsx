import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ApparelIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import { TeamList } from '~/components/TeamList'
import { TournamentFilter } from '~/components/TournamentFilter'
import type { ColorAccent, TeamListItem, TournamentListItem } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type TeamsPageContentProps = {
  context: 'public' | 'admin'
  teamListItems: TeamListItem[]
  tournamentListItems: TournamentListItem[]
  selectedTournamentId?: string
  onTeamClick: (teamId: string) => void
  onTeamDelete?: (teamId: string) => void
  panelColor?: ColorAccent
  className?: string
}

export function TeamsPageContent({
  context,
  teamListItems,
  tournamentListItems,
  selectedTournamentId,
  onTeamClick,
  onTeamDelete,
  panelColor = 'teal' as ColorAccent,
  className,
}: TeamsPageContentProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const isAdmin = context === 'admin'

  // Teams count display component
  const TeamsCountDisplay = () => {
    if (teamListItems.length === 0) return null

    return (
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
    )
  }

  // Empty state component
  const EmptyState = () => {
    if (teamListItems.length > 0) return null

    return (
      <Panel color={panelColor} className='mt-8'>
        <h3 className={cn('text-lg font-medium', getLatinTitleClass(i18n.language))}>
          {t('teams.getStarted.title')}
        </h3>
        <p className='text-foreground mt-2'>{t('teams.getStarted.description')}</p>
      </Panel>
    )
  }

  // Admin dashboard stats panel
  const AdminStatsPanel = () => {
    if (!isAdmin) return null

    return (
      <Panel
        color={panelColor}
        className='border-button-neutral-secondary-border rounded-b-none border-b-0'
      >
        <div className='flex items-center gap-3'>
          <div className='bg-team-600 flex h-12 w-12 items-center justify-center rounded-full'>
            <ApparelIcon className='h-6 w-6 text-white' />
          </div>
          <div>
            <h2
              className={cn('text-lg font-semibold', getLatinTitleClass(i18n.language))}
            >
              {t('admin.teams.stats.totalTeams')}
            </h2>
            <p className='text-team-600 text-2xl font-bold'>{teamListItems.length}</p>
          </div>
        </div>
      </Panel>
    )
  }

  // Admin content wrapper
  const AdminContent = ({ children }: { children: React.ReactNode }) => {
    if (!isAdmin) return <>{children}</>

    return (
      <Panel
        color={panelColor}
        className='border-button-neutral-secondary-border rounded-t-none border-t-0'
      >
        <div className='space-y-6'>
          <div>
            <h3
              className={cn('text-lg font-medium', getLatinTitleClass(i18n.language))}
            >
              {t('admin.teams.content.title')}
            </h3>
            <p className='text-foreground mt-1'>
              {t('admin.teams.content.description')}
            </p>
          </div>
          {children}
        </div>
      </Panel>
    )
  }

  return (
    <div className={cn('space-y-6', className)} data-testid='teams-page-content'>
      {/* Admin Stats Panel */}
      <AdminStatsPanel />

      {/* Tournament Filter */}
      {isAdmin ? (
        // Admin: Filter inside content wrapper
        <AdminContent>
          <div className='space-y-6'>
            <div>
              <h4 className='text-foreground mb-3 text-sm font-medium'>
                {t('teams.filter.title')}
              </h4>
              <TournamentFilter
                tournamentListItems={tournamentListItems}
                selectedTournamentId={selectedTournamentId}
                className='max-w-md'
                color={panelColor}
              />
            </div>

            {/* Teams Count */}
            <TeamsCountDisplay />

            {/* Teams List */}
            <TeamList
              teams={teamListItems}
              context={context}
              onTeamClick={onTeamClick}
              onTeamDelete={onTeamDelete}
              emptyMessage={t('teams.noTeams')}
              className='min-h-[200px]'
            />
          </div>
        </AdminContent>
      ) : (
        // Public: Filter in separate panel
        <>
          <Panel color={panelColor}>
            <TournamentFilter
              tournamentListItems={tournamentListItems}
              selectedTournamentId={selectedTournamentId}
              className='max-w-md'
              color={panelColor}
            />
          </Panel>

          {/* Teams Count */}
          <TeamsCountDisplay />

          {/* Teams List */}
          <TeamList
            teams={teamListItems}
            context={context}
            onTeamClick={onTeamClick}
            emptyMessage={t('teams.noTeams')}
            className='min-h-[200px]'
          />

          {/* Empty State */}
          <EmptyState />
        </>
      )}
    </div>
  )
}
