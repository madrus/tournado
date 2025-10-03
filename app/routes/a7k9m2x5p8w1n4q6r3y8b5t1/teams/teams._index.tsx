import { JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { redirect, useLoaderData, useRevalidator, useSubmit } from 'react-router'

import { ApparelIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import { TeamList } from '~/components/TeamList'
import { TournamentFilter } from '~/components/TournamentFilter'
import type { TeamsLoaderData } from '~/lib/lib.types'
import { deleteTeamById } from '~/models/team.server'
import { STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { loadTeamsAndTournamentsData } from '~/utils/dataLoaders'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { getLatinTitleClass } from '~/utils/rtlUtils'

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

export async function action({ request }: Route.ActionArgs): Promise<Response> {
  await requireUserWithMetadata(request, handle)

  const formData = await request.formData()
  const intent = formData.get('intent')
  const teamId = formData.get('teamId')

  if (intent === 'delete' && typeof teamId === 'string') {
    await deleteTeamById({ id: teamId })
    return redirect('.')
  }

  throw new Response('Bad Request', { status: 400 })
}

export default function AdminTeamsIndexPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { teamListItems, tournamentListItems, selectedTournamentId } =
    useLoaderData<TeamsLoaderData>()
  const submit = useSubmit()
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

  const handleTeamDelete = (teamId: string) => {
    if (confirm(t('admin.team.confirmDelete'))) {
      const formData = new FormData()
      formData.append('intent', 'delete')
      formData.append('teamId', teamId)
      submit(formData, { method: 'post' })
    }
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
        <div className='mb-6'>
          <h3 className={cn('text-lg font-medium', getLatinTitleClass(i18n.language))}>
            {t('admin.team.allTeams')}
          </h3>
          <p className='mt-1 text-sm opacity-75'>
            {t('admin.team.allTeamsDescription')}
          </p>
        </div>

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
          context='admin'
          onTeamClick={handleTeamClick}
          onTeamDelete={handleTeamDelete}
          emptyMessage={t('teams.noTeams')}
        />
      </Panel>
    </div>
  )
}
