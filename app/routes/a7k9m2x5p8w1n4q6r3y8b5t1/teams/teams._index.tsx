import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { redirect, useLoaderData, useSubmit } from 'react-router'

import type { Team } from '@prisma/client'

import { TeamList } from '~/components/TeamList'
import { deleteTeamById, getAllTeamListItems } from '~/models/team.server'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'

//! TODO: replace with generated type
type LoaderArgs = {
  request: Request
}

//! TODO: replace with generated type
type ActionArgs = {
  request: Request
}

// Route metadata - admin only
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin'],
    roleMatchMode: 'any',
    redirectTo: '/unauthorized',
  },
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

type LoaderData = {
  teamListItems: TeamListItem[]
}

type TeamListItem = Pick<Team, 'id' | 'clubName' | 'teamName'>

export async function loader({ request }: LoaderArgs): Promise<LoaderData> {
  await requireUserWithMetadata(request, handle)

  const teamListItems = await getAllTeamListItems()

  return { teamListItems }
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
  const { t } = useTranslation()
  const { teamListItems } = useLoaderData<LoaderData>()
  const submit = useSubmit()

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
                <svg
                  className='h-5 w-5 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
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
          <h3 className='text-lg font-medium'>{t('admin.teams.allTeams')}</h3>
          <p className='mt-1 text-sm opacity-75'>
            {t('admin.teams.allTeamsDescription')}
          </p>
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
