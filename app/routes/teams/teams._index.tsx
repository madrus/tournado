import { JSX } from 'react'
import type { MetaFunction } from 'react-router'
import { useLoaderData, useNavigate } from 'react-router'

import { TeamsPageContent } from '~/features/teams/components/TeamsPageContent'
import type { TeamsLoaderData } from '~/features/teams/types'
import { loadTeamsAndTournamentsData } from '~/utils/dataLoaders'
import type { RouteMetadata } from '~/utils/routeTypes'

import type { Route } from './+types/teams._index'

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

export const loader = async ({ request }: Route.LoaderArgs): Promise<TeamsLoaderData> =>
  loadTeamsAndTournamentsData(request)

export default function PublicTeamsIndexPage(): JSX.Element {
  const { teamListItems, tournamentListItems, selectedTournamentId } =
    useLoaderData<TeamsLoaderData>()
  const navigate = useNavigate()

  const handleTeamClick = (teamId: string) => {
    navigate(`/teams/${teamId}`)
  }

  return (
    <TeamsPageContent
      teamListItems={teamListItems}
      tournamentListItems={tournamentListItems}
      selectedTournamentId={selectedTournamentId ?? null}
      onTeamClick={handleTeamClick}
      showStats={true}
      testId='teams-layout'
    />
  )
}
