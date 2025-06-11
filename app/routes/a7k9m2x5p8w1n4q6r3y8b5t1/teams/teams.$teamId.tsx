import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import {
  isRouteErrorResponse,
  redirect,
  useActionData,
  useLoaderData,
  useRouteError,
} from 'react-router'

import { Division } from '@prisma/client'

import invariant from 'tiny-invariant'

import { TeamForm } from '~/components/TeamForm'
import { prisma } from '~/db.server'
import {
  stringToDivision,
  stringToTeamClass,
  stringToTeamName,
} from '~/lib/lib.helpers'
import type { TeamEditActionData } from '~/lib/lib.types'
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

type LoaderData = {
  team: Pick<TeamWithLeader, 'id' | 'clubName' | 'teamName' | 'division'>
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

  const team = await getTeamById({ id: params.teamId as string })

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
    await deleteTeamById({ id: params.teamId as string })
    return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
  }

  if (intent === 'update') {
    const clubName = formData.get('clubName') as string | null
    const teamName = formData.get('teamName') as string | null
    const division = formData.get('division') as string | null

    const errors: TeamEditActionData['errors'] = {}

    if (!clubName || clubName.length === 0) {
      errors.clubName = 'clubNameRequired'
    }

    if (!teamName || teamName.length === 0) {
      errors.teamName = 'teamNameRequired'
    }

    if (!division || division.length === 0) {
      errors.division = 'teamClassRequired'
    }

    // Validate division is a valid enum value
    const validDivision = stringToDivision(division)
    if (division && !validDivision) {
      errors.division = 'invalidDivision'
    }

    if (Object.keys(errors).length > 0) {
      return Response.json({ errors }, { status: 400 })
    }

    // Update team
    await prisma.team.update({
      where: { id: params.teamId as string },
      // eslint-disable-next-line id-blacklist
      data: {
        clubName: clubName as string,
        teamName: teamName as string,
        division: validDivision as Division,
      },
    })

    return redirect(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${params.teamId as string}`)
  }

  throw new Response('Bad Request', { status: 400 })
}

export default function AdminTeamDetailsPage(): JSX.Element {
  const { t } = useTranslation()
  const { team, tournaments: _tournaments } = useLoaderData<LoaderData>()
  const actionData = useActionData<TeamEditActionData>()

  const handleCancel = () => {
    window.history.back()
  }

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
    <TeamForm
      mode='edit'
      variant='admin'
      formData={{
        clubName: team.clubName,
        teamName: stringToTeamName(team.teamName),
        division: stringToTeamClass(team.division),
      }}
      errors={actionData?.errors || {}}
      onCancel={handleCancel}
      showDeleteButton={true}
      onDelete={handleDelete}
      intent='update'
    />
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
