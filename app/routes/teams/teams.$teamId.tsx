import type { JSX } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useSearchParams } from 'react-router'
import type { MetaFunction } from 'react-router'

import invariant from 'tiny-invariant'

import {
  basePanelContentVariants as panelContentVariants,
  basePanelGlowVariants as panelGlowVariants,
  basePanelVariants as panelVariants,
} from '~/components/shared/panel-base.variants'
import type { Division } from '~/db.server'
import { getDivisionLabel } from '~/lib/lib.helpers'
import { getTeamById } from '~/models/team.server'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTextClass, getLatinTitleClass } from '~/utils/rtlUtils'
import { toast } from '~/utils/toastUtils'

import type { Route } from './+types/teams.$teamId'

type LoaderData = {
  team: {
    id: string
    name: string
    clubName: string
    division: Division
  }
}

// Route metadata - this is a public route
export const handle: RouteMetadata = {
  isPublic: true,
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  const teamData = loaderData as LoaderData | undefined
  if (!teamData?.team) {
    return [
      { title: 'Team Not Found | Tournado' },
      {
        name: 'description',
        content: 'The team you are looking for could not be found.',
      },
    ]
  }

  // For meta tags, we'll use English as the default since we don't have access to i18n here
  const divisionLabel = getDivisionLabel(teamData.team.division, 'en')

  return [
    { title: `${teamData.team.clubName} ${teamData.team.name} | Tournado` },
    {
      name: 'description',
      content: `View games and schedule for ${teamData.team.clubName} ${teamData.team.name} in the ${divisionLabel} class.`,
    },
    {
      property: 'og:title',
      content: `${teamData.team.clubName} ${teamData.team.name} | Tournado`,
    },
    {
      property: 'og:description',
      content: `View games and schedule for ${teamData.team.clubName} ${teamData.team.name} in the ${divisionLabel} class.`,
    },
    { property: 'og:type', content: 'website' },
  ]
}

export async function loader({ params }: Route.LoaderArgs): Promise<LoaderData> {
  invariant(params.teamId, 'teamId not found')

  const team = await getTeamById({ id: params.teamId as string })

  if (!team) {
    throw new Response('Not Found', { status: 404 })
  }

  // Cast the team to our expected type since Prisma returns proper enum values at runtime
  // but the TypeScript definition uses string due to the custom Team type in lib.types.ts
  return { team: team as LoaderData['team'] }
}

export default function TeamDetailsPage(): JSX.Element {
  const { team } = useLoaderData<LoaderData>()
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Check for success parameter and show toast
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'created') {
      toast.success(t('teams.notifications.registrationSuccess'), {
        description: t('teams.notifications.registrationSuccessDesc'),
      })

      // Remove the success parameter from URL
      searchParams.delete('success')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, t])

  return (
    <div className='min-h-screen'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            {`${team.clubName} ${team.name}`}
          </h1>
          <p className='mt-2 text-lg'>
            {getDivisionLabel(team.division, i18n.language)}
          </p>
        </div>

        {/* Content Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Main Content - Games & Schedule */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Upcoming Games */}
            <div className={panelVariants({ color: 'teal' })}>
              <div className={panelGlowVariants({ color: 'teal' })} />
              <div className={panelContentVariants()}>
                <h2
                  className={cn(
                    'mb-4 text-xl font-semibold text-teal-800 dark:text-teal-100',
                    getLatinTitleClass(i18n.language)
                  )}
                >
                  🏐 Upcoming Games
                </h2>
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                  <p className='font-medium text-blue-800'>🚧 Coming Soon!</p>
                  <p className='mt-1 text-sm text-blue-700'>
                    Team schedule and game management will be implemented here. This
                    will show upcoming matches, match results, and tournament standings.
                  </p>
                </div>

                {/* Placeholder for future games list */}
                <div className='mt-4 space-y-3'>
                  <div className='rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium text-slate-900 dark:text-slate-100'>
                          vs Team Example
                        </p>
                        <p className='text-sm text-slate-600 dark:text-slate-300'>
                          Saturday, Dec 16, 2023 at 14:00
                        </p>
                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                          Sports Hall Location
                        </p>
                      </div>
                      <span className='rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800'>
                        Scheduled
                      </span>
                    </div>
                  </div>

                  <div className='rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium text-slate-900 dark:text-slate-100'>
                          vs Another Team
                        </p>
                        <p className='text-sm text-slate-600 dark:text-slate-300'>
                          Sunday, Dec 17, 2023 at 16:30
                        </p>
                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                          Main Court
                        </p>
                      </div>
                      <span className='rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'>
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Results */}
            <div className={panelVariants({ color: 'teal' })}>
              <div className={panelGlowVariants({ color: 'teal' })} />
              <div className={panelContentVariants()}>
                <h2
                  className={cn(
                    'mb-4 text-xl font-semibold text-teal-800 dark:text-teal-100',
                    getLatinTitleClass(i18n.language)
                  )}
                >
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
          </div>

          {/* Sidebar - Team Info & Stats */}
          <div className='space-y-6'>
            {/* Team Info Card */}
            <div className={panelVariants({ color: 'teal' })}>
              <div className={panelGlowVariants({ color: 'teal' })} />
              <div className={panelContentVariants()}>
                <h3
                  className={cn(
                    'mb-4 text-lg font-semibold text-teal-800 dark:text-teal-100',
                    getLatinTitleClass(i18n.language)
                  )}
                >
                  Team Information
                </h3>
                <dl className='space-y-3'>
                  <div>
                    <dt className='text-foreground-lighter text-sm font-medium'>
                      Club
                    </dt>
                    <dd className={`text-sm ${getLatinTextClass(i18n.language)}`}>
                      {team.clubName}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-foreground-lighter text-sm font-medium'>
                      Team
                    </dt>
                    <dd className={`text-sm ${getLatinTextClass(i18n.language)}`}>
                      {team.name}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-foreground-lighter text-sm font-medium'>
                      Class
                    </dt>
                    <dd className='text-sm'>
                      {getDivisionLabel(team.division, i18n.language)}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-foreground-lighter text-sm font-medium'>
                      Status
                    </dt>
                    <dd>
                      <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                        Active
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Season Stats */}
            <div className={panelVariants({ color: 'teal' })}>
              <div className={panelGlowVariants({ color: 'teal' })} />
              <div className={panelContentVariants()}>
                <h3
                  className={cn(
                    'mb-4 text-lg font-semibold text-teal-800 dark:text-teal-100',
                    getLatinTitleClass(i18n.language)
                  )}
                >
                  Season Stats
                </h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-foreground text-sm'>Games Played</span>
                    <span className='text-sm font-medium'>--</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-foreground text-sm'>Wins</span>
                    <span className='text-sm font-medium text-green-600'>--</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-foreground text-sm'>Losses</span>
                    <span className='text-error text-sm font-medium'>--</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-foreground text-sm'>Points</span>
                    <span className='text-sm font-medium'>--</span>
                  </div>
                </div>
                <div className='bg-button-neutral-background mt-4 rounded-lg p-3'>
                  <p className='text-foreground text-xs'>
                    Stats will be calculated automatically from game results.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={panelVariants({ color: 'teal' })}>
              <div className={panelGlowVariants({ color: 'teal' })} />
              <div className={panelContentVariants()}>
                <h3
                  className={cn(
                    'mb-4 text-lg font-semibold',
                    getLatinTitleClass(i18n.language)
                  )}
                >
                  Quick Actions
                </h3>
                <div className='space-y-3'>
                  <button
                    disabled
                    className='text-foreground-lighter bg-button-neutral-secondary-background w-full cursor-not-allowed rounded-lg px-3 py-2 text-start text-sm'
                  >
                    📅 View Full Schedule
                  </button>
                  <button
                    disabled
                    className='text-foreground-lighter bg-button-neutral-secondary-background w-full cursor-not-allowed rounded-lg px-3 py-2 text-start text-sm'
                  >
                    📊 View Statistics
                  </button>
                  <button
                    disabled
                    className='text-foreground-lighter bg-button-neutral-secondary-background w-full cursor-not-allowed rounded-lg px-3 py-2 text-start text-sm'
                  >
                    👥 View Players
                  </button>
                </div>
                <p className='text-foreground-lighter mt-3 text-xs'>
                  These features will be available in future updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
