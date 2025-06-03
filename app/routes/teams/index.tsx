import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLoaderData, useOutletContext } from 'react-router'

import type { Team } from '@prisma/client'

import { ActionLink, ListItemNavLink } from '~/components/PrefetchLink'
import { getAllTeamListItems } from '~/models/team.server'
import type { RouteMetadata } from '~/utils/route-types'

// import { Route } from './+types'

interface LoaderArgs {
  request: Request
  params: Record<string, string | undefined>
  context?: unknown
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
      'View and manage all your tournament teams. Create new teams, edit existing ones, and organize your tournament participants.',
  },
  { property: 'og:title', content: 'Teams | Tournado' },
  {
    property: 'og:description',
    content:
      'View and manage all your tournament teams. Create new teams, edit existing ones, and organize your tournament participants.',
  },
  { property: 'og:type', content: 'website' },
]

type ContextType = {
  type: 'sidebar' | 'main'
}

type LoaderData = {
  teamListItems: TeamListItem[]
}

type TeamListItem = Pick<Team, 'id' | 'teamName'>

export async function loader({ request: _ }: LoaderArgs): Promise<LoaderData> {
  const teamListItems = await getAllTeamListItems()

  return { teamListItems }
}

export default function TeamsIndexPage(): JSX.Element {
  const { t } = useTranslation()
  const { teamListItems } = useLoaderData<LoaderData>()
  const context = useOutletContext<ContextType>()

  // Render in sidebar
  if (context.type === 'sidebar') {
    if (teamListItems.length === 0) {
      return (
        <div className='flex flex-col gap-2 p-4'>
          <p className='text-center text-gray-500'>{t('teams.noTeams')}</p>
        </div>
      )
    }

    return (
      <div className='flex flex-col gap-2 p-4'>
        {teamListItems.map((team: TeamListItem) => (
          <ListItemNavLink
            key={team.id}
            to={`/teams/${team.id}`}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                isActive ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {team.teamName}
          </ListItemNavLink>
        ))}
      </div>
    )
  }

  // Render in main content
  return (
    <div className='flex h-full items-center justify-center'>
      <p className='text-center text-gray-500'>
        {t('teams.noTeamSelected')}{' '}
        <ActionLink
          to='new'
          className='text-blue-500 underline'
          aria-label={t('teams.createNewTeam')}
        >
          {t('teams.createNewTeam')}
        </ActionLink>
      </p>
    </div>
  )
}
