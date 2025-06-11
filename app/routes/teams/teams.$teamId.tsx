import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import invariant from 'tiny-invariant'

import { getDivisionLabel } from '~/lib/lib.helpers'
import { getTeamById, type TeamWithLeader } from '~/models/team.server'
import type { RouteMetadata } from '~/utils/route-types'

// Temporary types until auto-generation is complete
export type LoaderArgs = {
  params: Record<string, string | undefined>
  request: Request
}

type LoaderData = {
  team: Pick<TeamWithLeader, 'id' | 'clubName' | 'teamName' | 'division'>
}

// Route metadata - this is a public route
export const handle: RouteMetadata = {
  isPublic: true,
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

  // For meta tags, we'll use English as the default since we don't have access to i18n here
  const divisionLabel = getDivisionLabel(loaderData.team.division, 'en')

  return [
    { title: `${loaderData.team.clubName} ${loaderData.team.teamName} | Tournado` },
    {
      name: 'description',
      content: `View games and schedule for ${loaderData.team.clubName} ${loaderData.team.teamName} in the ${divisionLabel} class.`,
    },
    {
      property: 'og:title',
      content: `${loaderData.team.clubName} ${loaderData.team.teamName} | Tournado`,
    },
    {
      property: 'og:description',
      content: `View games and schedule for ${loaderData.team.clubName} ${loaderData.team.teamName} in the ${divisionLabel} class.`,
    },
    { property: 'og:type', content: 'website' },
  ]
}

export async function loader({ params }: LoaderArgs): Promise<LoaderData> {
  invariant(params.teamId, 'teamId not found')

  const team = await getTeamById({ id: params.teamId as string })

  if (!team) {
    throw new Response('Not Found', { status: 404 })
  }

  return { team }
}

export default function TeamDetailsPage(): JSX.Element {
  const { team } = useLoaderData<LoaderData>()
  const { i18n } = useTranslation()

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            {`${team.clubName} ${team.teamName}`}
          </h1>
          <p className='mt-2 text-lg text-gray-600'>
            {getDivisionLabel(team.division, i18n.language)}
          </p>
        </div>

        {/* Content Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Main Content - Games & Schedule */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Upcoming Games */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h2 className='mb-4 text-xl font-semibold text-gray-900'>
                🏐 Upcoming Games
              </h2>
              <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                <p className='font-medium text-blue-800'>🚧 Coming Soon!</p>
                <p className='mt-1 text-sm text-blue-700'>
                  Team schedule and game management will be implemented here. This will
                  show upcoming matches, match results, and tournament standings.
                </p>
              </div>

              {/* Placeholder for future games list */}
              <div className='mt-4 space-y-3'>
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-gray-900'>vs Team Example</p>
                      <p className='text-sm text-gray-600'>
                        Saturday, Dec 16, 2023 at 14:00
                      </p>
                      <p className='text-sm text-gray-500'>Sports Hall Location</p>
                    </div>
                    <span className='rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800'>
                      Scheduled
                    </span>
                  </div>
                </div>

                <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-gray-900'>vs Another Team</p>
                      <p className='text-sm text-gray-600'>
                        Sunday, Dec 17, 2023 at 16:30
                      </p>
                      <p className='text-sm text-gray-500'>Main Court</p>
                    </div>
                    <span className='rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'>
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Results */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h2 className='mb-4 text-xl font-semibold text-gray-900'>
                📊 Recent Results
              </h2>
              <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                <p className='font-medium text-green-800'>🚧 Coming Soon!</p>
                <p className='mt-1 text-sm text-green-700'>
                  Match results and statistics will be displayed here.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Team Info & Stats */}
          <div className='space-y-6'>
            {/* Team Info Card */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Team Information
              </h3>
              <dl className='space-y-3'>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Club</dt>
                  <dd className='text-sm text-gray-900'>{team.clubName}</dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Team</dt>
                  <dd className='text-sm text-gray-900'>{team.teamName}</dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Class</dt>
                  <dd className='text-sm text-gray-900'>
                    {getDivisionLabel(team.division, i18n.language)}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Status</dt>
                  <dd>
                    <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                      Active
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Season Stats */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>Season Stats</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Games Played</span>
                  <span className='text-sm font-medium text-gray-900'>--</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Wins</span>
                  <span className='text-sm font-medium text-green-600'>--</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Losses</span>
                  <span className='text-sm font-medium text-red-600'>--</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Points</span>
                  <span className='text-sm font-medium text-gray-900'>--</span>
                </div>
              </div>
              <div className='mt-4 rounded-lg bg-gray-50 p-3'>
                <p className='text-xs text-gray-600'>
                  Stats will be calculated automatically from game results.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                <button
                  disabled
                  className='w-full cursor-not-allowed rounded-lg bg-gray-100 px-3 py-2 text-left text-sm text-gray-500'
                >
                  📅 View Full Schedule
                </button>
                <button
                  disabled
                  className='w-full cursor-not-allowed rounded-lg bg-gray-100 px-3 py-2 text-left text-sm text-gray-500'
                >
                  📊 View Statistics
                </button>
                <button
                  disabled
                  className='w-full cursor-not-allowed rounded-lg bg-gray-100 px-3 py-2 text-left text-sm text-gray-500'
                >
                  👥 View Players
                </button>
              </div>
              <p className='mt-3 text-xs text-gray-500'>
                These features will be available in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
