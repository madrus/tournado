import type { ActionFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { createTeam } from '@/models/team.server'
import { requireUserId } from '@/utils/session.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  const formData = await request.formData()
  const teamName = formData.get('teamName')
  const teamClass = formData.get('teamClass')

  if (typeof teamName !== 'string' || teamName.length === 0) {
    return json(
      { errors: { teamClass: null, teamName: 'Team name is required' } },
      { status: 400 }
    )
  }

  if (typeof teamClass !== 'string' || teamClass.length === 0) {
    return json(
      { errors: { teamClass: 'Team class is required', teamName: null } },
      { status: 400 }
    )
  }

  const team = await createTeam({ teamClass, teamName, userId })

  return redirect(`/teams/${team.id}`)
}

export default function NewTeamPage() {
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
