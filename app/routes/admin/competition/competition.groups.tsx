import { type JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type MetaFunction, useLoaderData, useSearchParams } from 'react-router'
import { CompetitionGroupsTab } from '~/features/competition/components'
import type { TournamentListItem } from '~/features/tournaments/types'
import type { GroupStageListItem } from '~/models/group.server'
import { getTournamentGroupStages } from '~/models/group.server'
import { getAllTournaments } from '~/models/tournament.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { toast } from '~/utils/toastUtils'
import type { Route } from './+types/competition.groups'

type LoaderData = {
  readonly groupStages: readonly GroupStageListItem[]
  readonly tournamentListItems: readonly TournamentListItem[]
  readonly selectedTournamentId: string | undefined
}

export const meta: MetaFunction<typeof loader> = () => [
  { title: 'Groups Management | Tournado' },
  {
    name: 'description',
    content: 'Manage tournament groups and team assignments',
  },
]

export const handle: RouteMetadata = {
  authorization: {
    requiredRoles: ['REFEREE', 'MANAGER', 'ADMIN'],
  },
}

export async function loader({
  request,
  params: _params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireUserWithMetadata(request, handle)

  // Get tournament ID from search params
  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')

  // Load tournament list and group stage in parallel
  const [tournamentListItemsRaw, groupStages] = await Promise.all([
    getAllTournaments(),
    tournamentId ? getTournamentGroupStages(tournamentId) : Promise.resolve([]),
  ])

  // Serialize dates to ISO strings for JSON transport
  const tournamentListItems = tournamentListItemsRaw.map(tournament => ({
    ...tournament,
    startDate: tournament.startDate.toISOString(),
    endDate: tournament.endDate?.toISOString() || null,
  }))

  return {
    groupStages,
    tournamentListItems,
    selectedTournamentId: tournamentId || undefined,
  }
}

export default function GroupsTab(): JSX.Element {
  const { t } = useTranslation()
  const { groupStages, selectedTournamentId } = useLoaderData<LoaderData>()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'deleted') {
      toast.success(t('messages.groupStage.deleteSuccess'))

      const next = new URLSearchParams(searchParams)
      next.delete('success')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams, t])

  return (
    <CompetitionGroupsTab
      groupStages={groupStages}
      selectedTournamentId={selectedTournamentId}
    />
  )
}
