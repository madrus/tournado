import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
  Form,
  NavLink,
  useActionData,
  useLoaderData,
  useOutletContext,
} from '@remix-run/react'

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { prisma } from '~/db.server'
import { createTeam, getTeamListItems } from '~/models/team.server'
import { getDefaultTeamLeader } from '~/models/teamLeader.server'
import type { RouteMetadata } from '~/utils/route-types'

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.newTeam',
}

type ContextType = {
  type: 'sidebar' | 'main'
}

type TeamListItem = {
  id: string
  teamName: string
}

export const loader = async ({ request: _ }: LoaderFunctionArgs): Promise<Response> => {
  const teamLeader = await getDefaultTeamLeader()

  if (!teamLeader) {
    throw new Response('No TeamLeader found', { status: 404 })
  }

  const teamListItems = await getTeamListItems({ teamLeaderId: teamLeader.id })

  return json({ teamListItems })
}

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  // No longer requiring authentication for team creation
  const formData = await request.formData()
  const teamName = formData.get('teamName')
  const teamClass = formData.get('teamClass')

  if (typeof teamName !== 'string' || teamName.length === 0) {
    return json(
      { errors: { teamName: 'Team name is required', teamClass: null } },
      { status: 400 }
    )
  }

  if (typeof teamClass !== 'string' || teamClass.length === 0) {
    return json(
      { errors: { teamClass: 'Team class is required', teamName: null } },
      { status: 400 }
    )
  }

  // Get the default TeamLeader
  const teamLeader = await getDefaultTeamLeader()
  if (!teamLeader) {
    return json(
      {
        errors: { teamLeader: 'No team leader found', teamName: null, teamClass: null },
      },
      { status: 404 }
    )
  }

  // Get the default Tournament (for now)
  const tournament = await prisma.tournament.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  if (!tournament) {
    return json(
      {
        errors: { tournament: 'No tournament found', teamName: null, teamClass: null },
      },
      { status: 404 }
    )
  }

  const team = await createTeam({
    teamName,
    teamClass,
    teamLeaderId: teamLeader.id,
    tournamentId: tournament.id,
  })

  return redirect(`/teams/${team.id}`)
}

export default function NewTeamPage(): JSX.Element {
  const { t } = useTranslation()
  const actionData = useActionData<typeof action>()
  const { teamListItems } = useLoaderData<typeof loader>()
  const context = useOutletContext<ContextType>()
  const teamNameRef = useRef<HTMLInputElement>(null)
  const teamClassRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.teamName) {
      teamNameRef.current?.focus()
    } else if (actionData?.errors?.teamClass) {
      teamClassRef.current?.focus()
    }
  }, [actionData])

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

  // Render form in main content
  return (
    <>
      <Form
        method='post'
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
        }}
      >
        <div>
          <label className='flex w-full flex-col gap-1'>
            <span>{t('teams.form.teamName')}</span>
            <input
              ref={teamNameRef}
              name='teamName'
              className='flex-1 rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-loose'
              aria-invalid={actionData?.errors?.teamName ? true : undefined}
              aria-errormessage={
                actionData?.errors?.teamName ? 'teamName-error' : undefined
              }
            />
          </label>
          {actionData?.errors?.teamName ? (
            <div className='pt-1 text-red-700' id='teamName-error'>
              {t('teams.form.teamNameRequired')}
            </div>
          ) : null}
        </div>

        <div>
          <label className='flex w-full flex-col gap-1'>
            <span>{t('teams.form.teamClass')}</span>
            <input
              ref={teamClassRef}
              name='teamClass'
              className='w-full flex-1 rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-loose'
              aria-invalid={actionData?.errors?.teamClass ? true : undefined}
              aria-errormessage={
                actionData?.errors?.teamClass ? 'teamClass-error' : undefined
              }
            />
          </label>
          {actionData?.errors?.teamClass ? (
            <div className='pt-1 text-red-700' id='teamClass-error'>
              {t('teams.form.teamClassRequired')}
            </div>
          ) : null}
        </div>

        <div className='text-right'>
          <button
            type='submit'
            className='rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600'
          >
            {t('teams.save')}
          </button>
        </div>
      </Form>
    </>
  )
}
