import type { JSX } from 'react'
import { useLoaderData } from 'react-router'
import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { CompetitionLayout } from '~/features/competition/components'
import type { TournamentListItem } from '~/features/tournaments/types'
import { getAllTournaments, getTournamentById } from '~/models/tournament.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import type { Route } from './+types/competition'

type LoaderData = {
  readonly tournament: {
    readonly id: string
    readonly name: string
    readonly location: string
  } | null
  readonly tournamentListItems: readonly TournamentListItem[]
  readonly selectedTournamentId: string | undefined
}

export const handle: RouteMetadata = {
  isPublic: false,
  title: 'common.titles.competition',
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['ADMIN', 'MANAGER'],
    redirectTo: '/unauthorized',
  },
}

export async function loader({
  request,
  params: _params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireUserWithMetadata(request, handle)

  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')

  const [tournamentListItemsRaw, tournament] = await Promise.all([
    getAllTournaments(),
    tournamentId ? getTournamentById({ id: tournamentId }) : Promise.resolve(null),
  ])

  // Serialize dates to ISO strings for JSON transport
  const tournamentListItems = tournamentListItemsRaw.map(item => ({
    ...item,
    startDate: item.startDate.toISOString(),
    endDate: item.endDate?.toISOString() || null,
  }))

  return {
    tournament: tournament
      ? {
          id: tournament.id,
          name: tournament.name,
          location: tournament.location,
        }
      : null,
    tournamentListItems,
    selectedTournamentId: tournamentId || undefined,
  }
}

export default function CompetitionLayoutRoute(): JSX.Element {
  const { tournamentListItems, selectedTournamentId } = useLoaderData<LoaderData>()

  return (
    <CompetitionLayout
      tournamentListItems={tournamentListItems}
      selectedTournamentId={selectedTournamentId}
    />
  )
}

export { AuthErrorBoundary as ErrorBoundary }
