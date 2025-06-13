import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLoaderData, useNavigate } from 'react-router'

import type { Team } from '@prisma/client'

import { TeamList } from '~/components/TeamList'
import { getAllTeamListItems } from '~/models/team.server'
import type { RouteMetadata } from '~/utils/route-types'

//! TODO: replace with generated type
type LoaderArgs = {
  request: Request
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
      'View all tournament teams. Browse teams participating in various tournaments and create new teams to join competitions.',
  },
  { property: 'og:title', content: 'Teams | Tournado' },
  {
    property: 'og:description',
    content:
      'View all tournament teams. Browse teams participating in various tournaments and create new teams to join competitions.',
  },
  { property: 'og:type', content: 'website' },
]

type LoaderData = {
  teamListItems: TeamListItem[]
}

type TeamListItem = Pick<Team, 'id' | 'clubName' | 'teamName'>

export async function loader({ request: _ }: LoaderArgs): Promise<LoaderData> {
  const teamListItems = await getAllTeamListItems()

  return { teamListItems }
}

export default function PublicTeamsIndexPage(): JSX.Element {
  const { t } = useTranslation()
  const { teamListItems } = useLoaderData<LoaderData>()
  const navigate = useNavigate()

  const handleTeamClick = (teamId: string) => {
    navigate(`/teams/${teamId}`)
  }

  return (
    <div className='space-y-6' data-testid='teams-layout'>
      {/* Teams Count */}
      {teamListItems.length > 0 ? (
        <div className='text-foreground-light text-sm'>
          {t('teams.count', { count: teamListItems.length })}
        </div>
      ) : null}

      {/* Teams Grid */}
      <TeamList
        teams={teamListItems}
        context='public'
        onTeamClick={handleTeamClick}
        emptyMessage={t('teams.noTeams')}
        className='min-h-[200px]'
      />

      {/* Info Section */}
      {teamListItems.length === 0 ? (
        <div className='mt-8 rounded-lg bg-blue-50 p-6'>
          <h3 className='text-lg font-medium'>{t('teams.getStarted.title')}</h3>
          <p className='text-foreground-light mt-2'>
            {t('teams.getStarted.description')}
          </p>
        </div>
      ) : null}
    </div>
  )
}
