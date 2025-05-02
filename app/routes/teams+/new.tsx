import type { ActionFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { prisma } from '~/db.server'
import { createTeam } from '~/models/team.server'
import { getDefaultTeamLeader } from '~/models/teamLeader.server'
import { requireUserId } from '~/utils/session.server'

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  await requireUserId(request) // TODO: check auth status for now
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
  const teamNameRef = useRef<HTMLInputElement>(null)
  const teamClassRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (actionData?.errors?.teamName) {
      teamNameRef.current?.focus()
    } else if (actionData?.errors?.teamClass) {
      teamClassRef.current?.focus()
    }
  }, [actionData])

  return (
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
          <textarea
            ref={teamClassRef}
            name='teamClass'
            rows={8}
            className='w-full flex-1 rounded-md border-2 border-emerald-700/30 px-3 py-2 text-lg leading-6'
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
  )
}
