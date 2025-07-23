import { JSX, useMemo } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useActionData,
  useLoaderData,
} from 'react-router'

import { Division } from '@prisma/client'

import { TeamForm } from '~/components/TeamForm'
import { prisma } from '~/db.server'
import { stringToDivision } from '~/lib/lib.helpers'
import type { TeamCreateActionData } from '~/lib/lib.types'
import { useTeamFormStore } from '~/stores/useTeamFormStore'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'

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

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => [
  {
    title: loaderData?.team
      ? `${loaderData.team.clubName} ${loaderData.team.name} | Admin | Tournado`
      : 'Team | Admin | Tournado',
  },
  {
    name: 'description',
    content: loaderData?.team
      ? `View and edit ${loaderData.team.clubName} ${loaderData.team.name} team details.`
      : 'View and edit team details in the admin panel.',
  },
  {
    property: 'og:title',
    content: loaderData?.team
      ? `${loaderData.team.clubName} ${loaderData.team.name} | Admin | Tournado`
      : 'Team | Admin | Tournado',
  },
  {
    property: 'og:description',
    content: loaderData?.team
      ? `View and edit ${loaderData.team.clubName} ${loaderData.team.name} team details.`
      : 'View and edit team details in the admin panel.',
  },
  { property: 'og:type', content: 'website' },
]

type LoaderData = {
  team: {
    id: string
    name: string
    clubName: string
    division: string
    category: string
    teamLeader: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
    tournament: {
      id: string
      name: string
      location: string
    }
  }
}

export const loader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<LoaderData> => {
  await requireUserWithMetadata(request, handle)

  const { teamId } = params
  if (!teamId) {
    throw new Response('Team ID is required', { status: 400 })
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      teamLeader: true,
      tournament: true,
    },
  })

  if (!team) {
    throw new Response('Team not found', { status: 404 })
  }

  return {
    team: {
      id: team.id,
      clubName: team.clubName,
      name: team.name,
      division: team.division,
      category: team.category.toString(),
      teamLeader: {
        firstName: team.teamLeader.firstName,
        lastName: team.teamLeader.lastName,
        email: team.teamLeader.email,
        phone: team.teamLeader.phone,
      },
      tournament: {
        id: team.tournament.id,
        name: team.tournament.name,
        location: team.tournament.location,
      },
    },
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  await requireUserWithMetadata(request, handle)

  const { teamId } = params
  if (!teamId) {
    throw new Response('Team ID is required', { status: 400 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'update') {
    // Extract all form fields with proper typing
    const clubName = formData.get('clubName') as string | null
    const name = formData.get('name') as string | null
    const division = formData.get('division') as string | null

    const errors: TeamCreateActionData['errors'] = {}

    // Validate required fields
    if (!clubName || clubName.length === 0) {
      errors.clubName = 'clubNameRequired'
    }

    if (!name || name.length === 0) {
      errors.name = 'nameRequired'
    }

    if (!division || division.length === 0) {
      errors.division = 'divisionRequired'
    }

    // Validate division is a valid enum value
    const validDivision = stringToDivision(division)
    if (division && !validDivision) {
      errors.division = 'invalidDivision'
    }

    if (Object.keys(errors).length > 0) {
      return Response.json({ errors }, { status: 400 })
    }

    // Update the team
    await prisma.team.update({
      where: { id: teamId },
      // eslint-disable-next-line id-blacklist
      data: {
        clubName: clubName as string,
        name: name as string,
        division: validDivision as Division,
      },
    })

    return redirect(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${teamId}`)
  }

  if (intent === 'delete') {
    await prisma.team.delete({
      where: { id: teamId },
    })

    return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
  }

  return Response.json({ errors: {} })
}

export default function AdminTeamPage(): JSX.Element {
  const { team } = useLoaderData<LoaderData>()
  const actionData = useActionData<TeamCreateActionData>()
  const { setFormData, clearAllErrors } = useTeamFormStore()

  // Prepare the initial team data for reset functionality - memoized to prevent infinite loops
  const initialTeamData = useMemo(
    () => ({
      tournamentId: team.tournament.id,
      clubName: team.clubName,
      name: team.name as `${'J' | 'M' | 'JM'}O${number}-${number}`,
      division: team.division,
      category: team.category,
      teamLeaderName: `${team.teamLeader.firstName} ${team.teamLeader.lastName}`,
      teamLeaderPhone: team.teamLeader.phone,
      teamLeaderEmail: team.teamLeader.email as `${string}@${string}.${string}`,
      privacyAgreement: true, // Always true for existing teams
    }),
    [team]
  )

  const handleReset = () => {
    // Reset the form to the original team data
    setFormData(initialTeamData)
    clearAllErrors()
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this team?')) {
      // Create a form and submit it with delete intent
      const form = document.createElement('form')
      form.method = 'post'
      const input = document.createElement('input')
      input.type = 'hidden'
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
      formData={initialTeamData}
      errors={actionData?.errors || {}}
      intent='update'
      showDeleteButton={true}
      onDelete={handleDelete}
      onCancel={handleReset}
    />
  )
}
