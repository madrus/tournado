import { JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import {
  Form,
  isRouteErrorResponse,
  redirect,
  useActionData,
  useLoaderData,
  useRouteError,
} from 'react-router'

import invariant from 'tiny-invariant'

import { InputField } from '~/components/InputField'
import { prisma } from '~/db.server'
import { deleteTeamById, getTeamById, type TeamWithLeader } from '~/models/team.server'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'

// Temporary types until auto-generation is complete
export type LoaderArgs = {
  params: Record<string, string | undefined>
  request: Request
}
export type ActionArgs = {
  params: Record<string, string | undefined>
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

type ActionData = {
  errors?: {
    clubName?: string
    teamName?: string
    teamClass?: string
  }
}

type LoaderData = {
  team: Pick<TeamWithLeader, 'id' | 'clubName' | 'teamName' | 'teamClass'>
  tournaments: Array<{
    id: string
    name: string
    location: string
    startDate: string
    endDate: string | null
  }>
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData?.team) {
    return [
      { title: 'Team Not Found | Admin | Tournado' },
      {
        name: 'description',
        content: 'The team you are looking for could not be found.',
      },
    ]
  }

  return [
    {
      title: `${loaderData.team.clubName} ${loaderData.team.teamName} | Admin | Tournado`,
    },
    {
      name: 'description',
      content: `Manage ${loaderData.team.clubName} ${loaderData.team.teamName} team details and settings.`,
    },
    {
      property: 'og:title',
      content: `${loaderData.team.clubName} ${loaderData.team.teamName} | Admin | Tournado`,
    },
    {
      property: 'og:description',
      content: `Manage ${loaderData.team.clubName} ${loaderData.team.teamName} team details and settings.`,
    },
    { property: 'og:type', content: 'website' },
  ]
}

export async function loader({ params, request }: LoaderArgs): Promise<LoaderData> {
  await requireUserWithMetadata(request, handle)

  invariant(params.teamId, 'teamId not found')

  const team = await getTeamById({ id: params.teamId! })

  if (!team) {
    throw new Response('Not Found', { status: 404 })
  }

  // Fetch available tournaments
  const tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      startDate: true,
      endDate: true,
    },
    orderBy: { startDate: 'asc' },
  })

  return {
    team,
    tournaments: tournaments.map(t => ({
      ...t,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate?.toISOString() || null,
    })),
  }
}

export async function action({ params, request }: ActionArgs): Promise<Response> {
  await requireUserWithMetadata(request, handle)

  invariant(params.teamId, 'teamId not found')

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'delete') {
    await deleteTeamById({ id: params.teamId })
    return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
  }

  if (intent === 'update') {
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

    // Update team
    await prisma.team.update({
      where: { id: params.teamId },
      // eslint-disable-next-line id-blacklist
      data: {
        clubName: clubName!,
        teamName: teamName!,
        teamClass: teamClass!,
      },
    })

    return redirect(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${params.teamId}`)
  }

  throw new Response('Bad Request', { status: 400 })
}

export default function AdminTeamDetailsPage(): JSX.Element {
  const { t } = useTranslation()
  const { team, tournaments: _tournaments } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const teamNameRef = useRef<HTMLInputElement>(null)
  const teamClassRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.teamName) {
      teamNameRef.current?.focus()
    } else if (actionData?.errors?.teamClass) {
      teamClassRef.current?.focus()
    }
  }, [actionData])

  const handleDelete = () => {
    if (confirm(t('admin.teams.confirmDelete'))) {
      const form = document.createElement('form')
      form.method = 'post'
      form.style.display = 'none'

      const input = document.createElement('input')
      input.name = 'intent'
      input.value = 'delete'
      form.appendChild(input)

      document.body.appendChild(form)
      form.submit()
    }
  }

  return (
    <div className='max-w-4xl space-y-8'>
      {/* Header with actions */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-xl font-bold text-gray-900'>
            {`${team.clubName} ${team.teamName}`}
          </h3>
          <p className='text-gray-600'>{team.teamClass}</p>
        </div>

        <button
          onClick={handleDelete}
          className='inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
        >
          <svg
            className='mr-2 -ml-1 h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
            />
          </svg>
          {t('admin.teams.deleteTeam')}
        </button>
      </div>

      {/* Edit Form */}
      <Form method='post' className='space-y-8'>
        <input type='hidden' name='intent' value='update' />

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <h4 className='mb-6 text-lg font-semibold text-gray-900'>
            {t('admin.teams.editTeam')}
          </h4>

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            {/* Club Name */}
            <InputField
              name='clubName'
              label={t('teams.form.clubName')}
              defaultValue={team.clubName}
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
              defaultValue={team.teamName}
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
              defaultValue={team.teamClass}
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
              {t('admin.teams.saveChanges')}
            </button>
          </div>
        </div>
      </Form>
    </div>
  )
}

export function ErrorBoundary(): JSX.Element {
  const error = useRouteError()
  const { t } = useTranslation()

  if (isRouteErrorResponse(error)) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-gray-900'>
            {t('admin.teams.teamNotFound')}
          </h3>
          <p className='mt-2 text-gray-600'>
            {t('admin.teams.teamNotFoundDescription')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-64 items-center justify-center'>
      <div className='text-center'>
        <h3 className='text-lg font-medium text-gray-900'>{t('common.error')}</h3>
        <p className='mt-2 text-gray-600'>
          {error instanceof Error ? error.message : t('common.unknownError')}
        </p>
      </div>
    </div>
  )
}
