import { JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLoaderData, useRevalidator } from 'react-router'

import { ApparelIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import { TeamList } from '~/components/TeamList'
import { TournamentFilter } from '~/components/TournamentFilter'
import type { TeamsLoaderData } from '~/lib/lib.types'
import { STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { loadTeamsAndTournamentsData } from '~/utils/dataLoaders'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

import type { Route } from './+types/teams._index'

// Local constants
const PANEL_COLOR = 'teal' as const

// Route metadata - authenticated users can access
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  // No authorization restrictions - all authenticated users can access teams listing
}

export const meta: MetaFunction = () => [
  { title: 'Team Management | Admin | Tournado' },
  {
    name: 'description',
    content:
      'Manage all teams in the system. View, edit, delete teams and oversee tournament participation.',
  },
  { property: 'og:title', content: 'Team Management | Admin | Tournado' },
  {
    property: 'og:description',
    content:
      'Manage all teams in the system. View, edit, delete teams and oversee tournament participation.',
  },
  { property: 'og:type', content: 'website' },
]

export async function loader({ request }: Route.LoaderArgs): Promise<TeamsLoaderData> {
  await requireUserWithMetadata(request, handle)
  return loadTeamsAndTournamentsData(request)
}

export default function AdminTeamsIndexPage(): JSX.Element {
  const { t } = useTranslation()
  const { teamListItems, tournamentListItems, selectedTournamentId } =
    useLoaderData<TeamsLoaderData>()
  const revalidator = useRevalidator()

  useEffect(() => {
    const handlePopState = () => {
      revalidator.revalidate()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [revalidator])

  const handleTeamClick = (teamId: string) => {
    // Navigate to team details/edit page
    window.location.href = `/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${teamId}`
  }

  return (
    <div className='space-y-6' data-testid='admin-teams-page-content'>
      {/* Stats using optimized dashboard panels */}
      <div
        className={cn('grid w-full grid-cols-1 gap-5 lg:w-fit', STATS_PANEL_MIN_WIDTH)}
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
      <Panel color={PANEL_COLOR} variant='content-panel'>
        {/* Tournament Filter */}
        <div className='mb-6'>
          <TournamentFilter
            tournamentListItems={tournamentListItems}
            selectedTournamentId={selectedTournamentId}
            className='max-w-md'
            color={PANEL_COLOR}
          />
        </div>

        <TeamList
          teams={teamListItems}
          onTeamClick={handleTeamClick}
          emptyMessage={t('teams.noTeams')}
        />
      </Panel>
    </div>
  )
}
