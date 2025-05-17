import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Form,
  isRouteErrorResponse,
  NavLink,
  redirect,
  useOutletContext,
  useRouteError,
} from 'react-router'

import invariant from 'tiny-invariant'

import {
  deleteTeam,
  getTeam,
  getTeamListItems,
  type TeamWithLeader,
} from '~/models/team.server'
import { getDefaultTeamLeader } from '~/models/teamLeader.server'

// Temporary types until auto-generation is complete
// These will let the app compile so React Router can generate the proper types
import type { Route } from './+types/team'

type ContextType = {
  type: 'sidebar' | 'main'
}

type TeamListItem = {
  id: string
  teamName: string
}

type LoaderData = {
  team: Pick<TeamWithLeader, 'id' | 'teamName' | 'teamClass'>
  teamListItems: Pick<
    {
      id: string
      teamLeaderId: string
      createdAt: Date
      updatedAt: Date
      teamName: string
      teamClass: string
      tournamentId: string
    },
    'id' | 'teamName'
  >[]
}

export async function loader({ params }: Route.LoaderArgs): Promise<LoaderData> {
  invariant(params.teamId, 'teamId not found')

  // Get the default TeamLeader
  const teamLeader = await getDefaultTeamLeader()
  if (!teamLeader) {
    throw new Response('No TeamLeader found', { status: 404 })
  }

  const [team, teamListItems] = await Promise.all([
    getTeam({ id: params.teamId, teamLeaderId: teamLeader.id }),
    getTeamListItems({ teamLeaderId: teamLeader.id }),
  ])

  if (!team) {
    throw new Response('Not Found', { status: 404 })
  }
  return { team, teamListItems }
}

export async function action({ params }: Route.ActionArgs): Promise<Response> {
  // No longer requiring authentication for team actions
  invariant(params.teamId, 'teamId not found')

  // Get the default TeamLeader
  const teamLeader = await getDefaultTeamLeader()
  if (!teamLeader) {
    throw new Response('No TeamLeader found', { status: 404 })
  }

  await deleteTeam({ id: params.teamId, teamLeaderId: teamLeader.id })

  return redirect('/teams')
}

export default function TeamDetailsPage({
  loaderData,
}: {
  loaderData: LoaderData
}): JSX.Element {
  const { t } = useTranslation()
  const { team, teamListItems } = loaderData
  const context = useOutletContext<ContextType>()

  // Render team list in sidebar
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
        {teamListItems.map((teamItem: TeamListItem) => (
          <NavLink
            key={teamItem.id}
            to={`/teams/${teamItem.id}`}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                isActive ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
            prefetch='intent'
          >
            {teamItem.teamName}
          </NavLink>
        ))}
      </div>
    )
  }

  // Render team details in main content
  return (
    <>
      <h3 className='text-2xl font-bold'>{team.teamName}</h3>
      <p className='py-6'>{team.teamClass}</p>
      <hr className='my-4' />
      <Form method='post'>
        <button
          type='submit'
          className='rounded-full border border-red-300 bg-white px-6 py-2 text-sm text-red-500 hover:border-red-400 hover:text-red-600'
        >
          {t('teams.delete')}
        </button>
      </Form>
    </>
  )
}

export function ErrorBoundary(): JSX.Element {
  const error = useRouteError()
  const { t } = useTranslation()

  if (isRouteErrorResponse(error)) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-center text-gray-500'>{t('teams.errors.notFound')}</p>
      </div>
    )
  }

  return (
    <div className='flex h-full items-center justify-center'>
      <p className='text-center text-gray-500'>
        {t('teams.errors.unexpectedError')}{' '}
        {error instanceof Error ? error.message : t('teams.errors.unknownError')}
      </p>
    </div>
  )
}
