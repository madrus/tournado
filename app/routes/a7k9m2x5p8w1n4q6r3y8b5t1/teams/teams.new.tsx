import { JSX } from 'react'
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
import type { TeamCreateActionData, TeamCreateLoaderData } from '~/lib/lib.types'
import { createTeam } from '~/models/team.server'
import { stringToDivision } from '~/utils/division'
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

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<TeamCreateLoaderData> => {
  await requireUserWithMetadata(request, handle)

  // Fetch available tournaments
  const tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      startDate: true,
      endDate: true,
      divisions: true,
    },
    orderBy: { startDate: 'asc' },
  })

  return {
    tournaments: tournaments.map(t => ({
      ...t,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate?.toISOString() || null,
      divisions: Array.isArray(t.divisions) ? (t.divisions as Division[]) : [],
    })),
  }
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  await requireUserWithMetadata(request, handle)

  const formData = await request.formData()

  // Extract all form fields with proper typing
  const tournamentId = formData.get('tournamentId') as string | null
  const clubName = formData.get('clubName') as string | null
  const teamName = formData.get('teamName') as string | null
  const division = formData.get('division') as string | null
  const teamLeaderName = formData.get('teamLeaderName') as string | null
  const teamLeaderPhone = formData.get('teamLeaderPhone') as string | null
  const teamLeaderEmail = formData.get('teamLeaderEmail') as string | null
  const privacyAgreement = formData.get('privacyAgreement') as string | null

  const errors: TeamCreateActionData['errors'] = {}

  // Validate required fields
  if (!tournamentId || tournamentId.length === 0) {
    errors.tournamentId = 'tournamentRequired'
  }

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

  if (!teamLeaderName || teamLeaderName.length === 0) {
    errors.teamLeaderName = 'teamLeaderNameRequired'
  }

  if (!teamLeaderPhone || teamLeaderPhone.length === 0) {
    errors.teamLeaderPhone = 'teamLeaderPhoneRequired'
  }

  if (!teamLeaderEmail || teamLeaderEmail.length === 0) {
    errors.teamLeaderEmail = 'teamLeaderEmailRequired'
  } else if (!teamLeaderEmail.includes('@')) {
    errors.teamLeaderEmail = 'teamLeaderEmailInvalid'
  }

  if (privacyAgreement !== 'on') {
    errors.privacyAgreement = 'privacyAgreementRequired'
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 })
  }

  // Find or create team leader
  let teamLeader = await prisma.teamLeader.findUnique({
    where: { email: teamLeaderEmail as string },
  })

  if (!teamLeader) {
    const [firstName, ...lastNameParts] = (teamLeaderName as string).split(' ')
    const lastName = lastNameParts.join(' ') || ''

    teamLeader = await prisma.teamLeader.create({
      // eslint-disable-next-line id-blacklist
      data: {
        firstName,
        lastName,
        email: teamLeaderEmail as string,
        phone: teamLeaderPhone as string,
      },
    })
  }

  // Verify tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId as string },
  })

  if (!tournament) {
    return Response.json(
      { errors: { tournament: 'tournamentNotFound' } },
      { status: 404 }
    )
  }

  const team = await createTeam({
    clubName: clubName as string,
    teamName: teamName as string,
    division: validDivision as Division,
    teamLeaderId: teamLeader.id,
    tournamentId: tournamentId as string,
  })

  return redirect(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${team.id}`)
}

export default function AdminNewTeamPage(): JSX.Element {
  const actionData = useActionData<TeamCreateActionData>()
  const { tournaments } = useLoaderData<typeof loader>()

  const handleCancel = () => {
    window.history.back()
  }

  return (
    <TeamForm
      mode='create'
      variant='admin'
      tournaments={tournaments}
      errors={actionData?.errors || {}}
      onCancel={handleCancel}
    />
  )
}
