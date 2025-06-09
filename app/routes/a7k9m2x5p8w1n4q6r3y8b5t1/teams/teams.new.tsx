import { JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { Form, redirect, useActionData } from 'react-router'

import { InputField } from '~/components/InputField'
import { createTeam } from '~/models/team.server'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'

// Temporary types until auto-generation is complete
export type ActionArgs = {
  request: Request
}

// Route metadata - admin only
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin'],
    roleMatchMode: 'any',
    redirectTo: '/unauthorized',
  },
}

export const meta: MetaFunction = () => [
  { title: 'Create Team | Admin | Tournado' },
  {
    name: 'description',
    content:
      'Create a new team in the system. Manage team details and assign to tournaments.',
  },
  { property: 'og:title', content: 'Create Team | Admin | Tournado' },
  {
    property: 'og:description',
    content:
      'Create a new team in the system. Manage team details and assign to tournaments.',
  },
  { property: 'og:type', content: 'website' },
]

type ActionData = {
  errors?: {
    clubName?: string
    teamName?: string
    teamClass?: string
  }
}

export async function action({ request }: ActionArgs): Promise<Response> {
  const user = await requireUserWithMetadata(request, handle)

  const formData = await request.formData()
  const clubName = formData.get('clubName') as string | null
  const teamName = formData.get('teamName') as string | null
  const teamClass = formData.get('teamClass') as string | null

  const errors: ActionData['errors'] = {}

  if (!clubName || clubName.length === 0) {
    errors.clubName = 'clubNameRequired'
  }

  if (!teamName || teamName.length === 0) {
    errors.teamName = 'teamNameRequired'
  }

  if (!teamClass || teamClass.length === 0) {
    errors.teamClass = 'teamClassRequired'
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 })
  }

  const _team = await createTeam({
    clubName: clubName!,
    teamName: teamName!,
    teamClass: teamClass!,
    teamLeaderId: user.id,
    tournamentId: 'clunhswla0000tfq0a07gg1jd', // Default tournament for now
  })

  return redirect(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams`)
}

export default function AdminNewTeamPage(): JSX.Element {
  const { t } = useTranslation()
  const actionData = useActionData<ActionData>()
  const clubNameRef = useRef<HTMLInputElement>(null)
  const teamNameRef = useRef<HTMLInputElement>(null)
  const teamClassRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.clubName) {
      clubNameRef.current?.focus()
    } else if (actionData?.errors?.teamName) {
      teamNameRef.current?.focus()
    } else if (actionData?.errors?.teamClass) {
      teamClassRef.current?.focus()
    }
  }, [actionData])

  return (
    <div className='max-w-4xl space-y-8'>
      {/* Header */}
      <div className='border-b border-gray-200 pb-6'>
        <h3 className='text-xl font-bold text-gray-900'>
          {t('admin.teams.createTeam')}
        </h3>
        <p className='mt-1 text-gray-600'>{t('admin.teams.createTeamDescription')}</p>
      </div>

      {/* Form */}
      <Form method='post' className='space-y-8'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            {/* Club Name */}
            <InputField
              ref={clubNameRef}
              name='clubName'
              label={t('teams.form.clubName')}
              defaultValue='sv DIO'
              readOnly={false}
              required
              error={
                actionData?.errors?.clubName
                  ? t('teams.form.clubNameRequired')
                  : undefined
              }
            />

            {/* Team Name */}
            <InputField
              ref={teamNameRef}
              name='teamName'
              label={t('teams.form.teamName')}
              readOnly={false}
              required
              error={
                actionData?.errors?.teamName
                  ? t('teams.form.teamNameRequired')
                  : undefined
              }
            />

            {/* Team Class */}
            <InputField
              ref={teamClassRef}
              name='teamClass'
              label={t('teams.form.teamClass')}
              readOnly={false}
              required
              error={
                actionData?.errors?.teamClass
                  ? t('teams.form.teamClassRequired')
                  : undefined
              }
            />
          </div>

          {/* Submit Button */}
          <div className='mt-6 flex justify-end gap-3'>
            <button
              type='button'
              onClick={() => window.history.back()}
              className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
            >
              {t('common.cancel')}
            </button>
            <button
              type='submit'
              className='inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
            >
              {t('admin.teams.createTeam')}
            </button>
          </div>
        </div>
      </Form>
    </div>
  )
}
