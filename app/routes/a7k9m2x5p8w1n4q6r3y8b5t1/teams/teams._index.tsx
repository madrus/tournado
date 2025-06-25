import { JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { redirect, useLoaderData, useRevalidator, useSubmit } from 'react-router'

import { ApparelIcon } from '~/components/icons'
import { TeamList } from '~/components/TeamList'
import { TournamentFilter } from '~/components/TournamentFilter'
import { loadTeamsData } from '~/lib/teams.server'
import type { TeamsLoaderData } from '~/lib/teams.types'
import { deleteTeamById } from '~/models/team.server'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'
import { getLatinTitleClass } from '~/utils/rtlUtils'

//! TODO: replace with generated type
type LoaderArgs = {
  request: Request
}

//! TODO: replace with generated type
type ActionArgs = {
  request: Request
}

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
  { title: 'Teams Management | Admin | Tournado' },
  {
    name: 'description',
    content:
      'Manage all teams in the system. View, edit, delete teams and oversee tournament participation.',
  },
  { property: 'og:title', content: 'Teams Management | Admin | Tournado' },
  {
    property: 'og:description',
    content:
      'Manage all teams in the system. View, edit, delete teams and oversee tournament participation.',
  },
  { property: 'og:type', content: 'website' },
]

export async function loader({ request }: LoaderArgs): Promise<TeamsLoaderData> {
  await requireUserWithMetadata(request, handle)
  return loadTeamsData(request)
}

export async function action({ request }: ActionArgs): Promise<Response> {
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
    if (confirm(t('admin.teams.confirmDelete'))) {
      const formData = new FormData()
      formData.append('intent', 'delete')
      formData.append('teamId', teamId)
      submit(formData, { method: 'post' })
    }
  }

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-red-500'>
                <ApparelIcon className='text-white' size={24} variant='outlined' />
              </div>
            </div>
            <div className='ms-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium opacity-75'>
                  {t('admin.teams.totalTeams')}
                </dt>
                <dd className='text-lg font-medium'>{teamListItems.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='mb-6'>
          <h3 className={cn('text-lg font-medium', getLatinTitleClass(i18n.language))}>
            {t('admin.teams.allTeams')}
          </h3>
          <p className='mt-1 text-sm opacity-75'>
            {t('admin.teams.allTeamsDescription')}
          </p>
        </div>

        {/* Tournament Filter */}
        <div className='mb-6'>
          <TournamentFilter
            tournamentListItems={tournamentListItems}
            selectedTournamentId={selectedTournamentId}
            className='max-w-md'
          />
        </div>

        <TeamList
          teams={teamListItems}
          context='admin'
          onTeamClick={handleTeamClick}
          onTeamDelete={handleTeamDelete}
          emptyMessage={t('teams.noTeams')}
        />
      </div>
    </div>
  )
}
