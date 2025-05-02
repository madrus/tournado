import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, NavLink, useLoaderData, useOutletContext } from '@remix-run/react'

import { useTranslation } from 'react-i18next'

import type { Team } from '@prisma/client'

import { getTeamListItems } from '~/models/team.server'
import { getDefaultTeamLeader } from '~/models/teamLeader.server'

type ContextType = {
  type: 'sidebar' | 'main'
}

type TeamListItem = Pick<Team, 'id' | 'teamName'>

export const loader = async ({
  request: _request,
}: LoaderFunctionArgs): Promise<Response> => {
  const teamLeader = await getDefaultTeamLeader()

  if (!teamLeader) {
    throw new Response('No TeamLeader found', { status: 404 })
  }

  const teamListItems = await getTeamListItems({ teamLeaderId: teamLeader.id })

  return json({ teamListItems })
}

export default function TeamsIndexPage(): JSX.Element {
  const { teamListItems } = useLoaderData<typeof loader>()
  const { t } = useTranslation()
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
          <NavLink
            key={team.id}
            to={team.id}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                isActive ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
            prefetch='intent'
          >
            {team.teamName}
          </NavLink>
        ))}
      </div>
    )
  }

  // Render in main content
  return (
    <div className='flex h-full items-center justify-center'>
      <p className='text-center text-gray-500'>
        {t('teams.noTeamSelected')}{' '}
        <Link
          to='new'
          className='text-blue-500 underline'
          aria-label={t('teams.createNewTeam')}
        >
          {t('teams.createNewTeam')}
        </Link>
      </p>
    </div>
  )
}
