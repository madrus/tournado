import { JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLoaderData, useNavigate, useRevalidator } from 'react-router'

import { TeamList } from '~/components/TeamList'
import { TournamentFilter } from '~/components/TournamentFilter'
import { loadTeamsData } from '~/lib/teams.server'
import type { TeamsLoaderData } from '~/lib/teams.types'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinTitleClass } from '~/utils/rtlUtils'

//! TODO: replace with generated type
type LoaderArgs = {
  request: Request
}

// Route metadata - this will inherit from the parent route
export const handle: RouteMetadata = {
  isPublic: true,
}

export const meta: MetaFunction = () => [
  { title: 'Teams | Tournado' },
  {
    name: 'description',
    content:
      'View all tournament teams. Browse teams participating in various tournaments and create new teams to join competitions.',
  },
  { property: 'og:title', content: 'Teams | Tournado' },
  {
    property: 'og:description',
    content:
      'View all tournament teams. Browse teams participating in various tournaments and create new teams to join competitions.',
  },
  { property: 'og:type', content: 'website' },
]

export const loader = async ({ request }: LoaderArgs): Promise<TeamsLoaderData> =>
  loadTeamsData(request)

export default function PublicTeamsIndexPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { teamListItems, tournamentListItems, selectedTournamentId } =
    useLoaderData<TeamsLoaderData>()
  const navigate = useNavigate()
  const revalidator = useRevalidator()

  useEffect(() => {
    const handlePopState = () => {
      revalidator.revalidate()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [revalidator])

  const handleTeamClick = (teamId: string) => {
    navigate(`/teams/${teamId}`)
  }

  return (
    <div className='space-y-6' data-testid='teams-layout'>
      {/* Tournament Filter */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <TournamentFilter
          tournamentListItems={tournamentListItems}
          selectedTournamentId={selectedTournamentId}
          className='max-w-md'
        />
      </div>

      {/* Teams Count */}
      {teamListItems.length > 0 ? (
        <div className='text-foreground-light text-sm'>
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
        context='public'
        onTeamClick={handleTeamClick}
        emptyMessage={t('teams.noTeams')}
        className='min-h-[200px]'
      />

      {/* Info Section */}
      {teamListItems.length === 0 ? (
        <div className='mt-8 rounded-lg bg-blue-50 p-6'>
          <h3 className={cn('text-lg font-medium', getLatinTitleClass(i18n.language))}>
            {t('teams.getStarted.title')}
          </h3>
          <p className='text-foreground-light mt-2'>
            {t('teams.getStarted.description')}
          </p>
        </div>
      ) : null}
    </div>
  )
}
