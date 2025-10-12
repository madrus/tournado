import { JSX } from 'react'
import type { MetaFunction } from 'react-router'
import { useLoaderData, useNavigate } from 'react-router'

import { TeamsPageContent } from '~/components/TeamsPageContent'
import type { TeamsLoaderData } from '~/lib/lib.types'
import { loadTeamsAndTournamentsData } from '~/utils/dataLoaders'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

import type { Route } from './+types/teams._index'

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
  const { teamListItems, tournamentListItems, selectedTournamentId } =
    useLoaderData<TeamsLoaderData>()
  const navigate = useNavigate()

  const handleTeamClick = (teamId: string) => {
    navigate(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${teamId}`)
  }

  return (
    <TeamsPageContent
      teamListItems={teamListItems}
      tournamentListItems={tournamentListItems}
      selectedTournamentId={selectedTournamentId ?? null}
      onTeamClick={handleTeamClick}
      showStats={true}
      testId='admin-teams-page-content'
    />
  )
}
