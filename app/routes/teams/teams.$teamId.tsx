import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import {
  Form,
  isRouteErrorResponse,
  redirect,
  useLoaderData,
  useOutletContext,
  useRouteError,
} from 'react-router'

import invariant from 'tiny-invariant'

import { ListItemNavLink } from '~/components/PrefetchLink'
import {
  deleteTeamById,
  getAllTeamListItems,
  getTeamById,
  type TeamWithLeader,
} from '~/models/team.server'

// Temporary types until auto-generation is complete
// These will let the app compile so React Router can generate the proper types
export type LoaderArgs = {
  params: Record<string, string | undefined>
  request: Request
}
export type ActionArgs = {
  params: Record<string, string | undefined>
  request: Request
}

type ContextType = {
  type: 'sidebar' | 'main'
}

type TeamListItem = {
  id: string
  clubName: string
  teamName: string
}

type LoaderData = {
  team: Pick<TeamWithLeader, 'id' | 'clubName' | 'teamName' | 'teamClass'>
  teamListItems: Pick<
    {
      id: string
      teamLeaderId: string
      createdAt: Date
      updatedAt: Date
      clubName: string
      teamName: string
      teamClass: string
      tournamentId: string
    },
    'id' | 'clubName' | 'teamName'
  >[]
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData?.team) {
    return [
      { title: 'Team Not Found | Tournado' },
      {
        name: 'description',
        content: 'The team you are looking for could not be found.',
      },
    ]
  }

  return [
    { title: `${loaderData.team.teamName} | Tournado` },
    {
      name: 'description',
      content: `View details for ${loaderData.team.teamName} in the ${loaderData.team.teamClass} class. Manage team information and tournament participation.`,
    },
    { property: 'og:title', content: `${loaderData.team.teamName} | Tournado` },
    {
      property: 'og:description',
      content: `View details for ${loaderData.team.teamName} in the ${loaderData.team.teamClass} class. Manage team information and tournament participation.`,
    },
    { property: 'og:type', content: 'website' },
  ]
}

export async function loader({ params }: LoaderArgs): Promise<LoaderData> {
  invariant(params.teamId, 'teamId not found')

  const team = await getTeamById({ id: params.teamId! })

  const teamListItems = await getAllTeamListItems()

  if (!team) {
    throw new Response('Not Found', { status: 404 })
  }
  return { team, teamListItems }
}

export async function action({ params }: ActionArgs): Promise<Response> {
  invariant(params.teamId, 'teamId not found')

  await deleteTeamById({ id: params.teamId })

  return redirect('/teams')
}

export default function TeamDetailsPage(): JSX.Element {
  const { t } = useTranslation()
  const { team, teamListItems } = useLoaderData<LoaderData>()
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
          <ListItemNavLink
            key={teamItem.id}
            to={`/teams/${teamItem.id}`}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                isActive ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {`${teamItem.clubName} ${teamItem.teamName}`}
          </ListItemNavLink>
        ))}
      </div>
    )
  }

  // Render team details in main content
  return (
    <>
      <h3 className='text-2xl font-bold'>{`${team.clubName} ${team.teamName}`}</h3>
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
