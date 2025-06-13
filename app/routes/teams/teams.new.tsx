import { JSX } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  useActionData,
  useLoaderData,
} from 'react-router'

import { Division } from '@prisma/client'

import { TeamForm } from '~/components/TeamForm'
import { prisma } from '~/db.server'
import { getDivisionLabel, stringToDivision } from '~/lib/lib.helpers'
import type { TeamCreateActionData, TeamCreateLoaderData } from '~/lib/lib.types'
import { extractTeamDataFromFormData, validateTeamData } from '~/lib/lib.zod'
import { createTeam } from '~/models/team.server'
import type { RouteMetadata } from '~/utils/route-types'

export const meta: MetaFunction = () => [
  { title: 'New Team | Tournado' },
  {
    name: 'description',
    content:
      'Create a new team for your tournament. Add team details, assign classes, and get ready to compete.',
  },
  { property: 'og:title', content: 'New Team | Tournado' },
  {
    property: 'og:description',
    content:
      'Create a new team for your tournament. Add team details, assign classes, and get ready to compete.',
  },
  { property: 'og:type', content: 'website' },
]

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.addTeam',
}

export const loader = async ({
  request: _,
}: LoaderFunctionArgs): Promise<TeamCreateLoaderData> => {
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

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const formData = await request.formData()

  // Extract form data using shared utility
  const teamData = extractTeamDataFromFormData(formData)

  // Validate using shared schema
  const validationResult = validateTeamData(teamData, 'create')

  const errors: TeamCreateActionData['errors'] = {}

  if (!validationResult.success) {
    // Convert Zod validation errors to the expected error format
    validationResult.error.errors.forEach(error => {
      if (error.path[0]) {
        const fieldName = error.path[0] as string
        // Map to simple error keys for translation
        switch (fieldName) {
          case 'tournamentId':
            errors.tournamentId = 'validationError'
            break
          case 'clubName':
            errors.clubName = 'validationError'
            break
          case 'teamName':
            errors.teamName = 'validationError'
            break
          case 'division':
            errors.division = 'validationError'
            break
          case 'teamLeaderName':
            errors.teamLeaderName = 'validationError'
            break
          case 'teamLeaderPhone':
            errors.teamLeaderPhone = 'validationError'
            break
          case 'teamLeaderEmail':
            errors.teamLeaderEmail = 'validationError'
            break
          case 'privacyAgreement':
            errors.privacyAgreement = 'validationError'
            break
        }
      }
    })
  }

  // Additional business logic validation
  const validDivision = teamData.division ? stringToDivision(teamData.division) : null
  if (teamData.division && !validDivision) {
    errors.division = 'invalidDivision'
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 })
  }

  // Find or create team leader
  let teamLeader = await prisma.teamLeader.findUnique({
    where: { email: teamData.teamLeaderEmail },
  })

  if (!teamLeader) {
    const [firstName, ...lastNameParts] = teamData.teamLeaderName.split(' ')
    const lastName = lastNameParts.join(' ') || ''

    teamLeader = await prisma.teamLeader.create({
      // eslint-disable-next-line id-blacklist
      data: {
        firstName,
        lastName,
        email: teamData.teamLeaderEmail,
        phone: teamData.teamLeaderPhone,
      },
    })
  }

  // Verify tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: teamData.tournamentId },
  })

  if (!tournament) {
    return Response.json(
      { errors: { tournament: 'tournamentNotFound' } },
      { status: 404 }
    )
  }

  const team = await createTeam({
    clubName: teamData.clubName,
    teamName: teamData.teamName,
    division: validDivision as Division,
    category: teamData.category,
    teamLeaderId: teamLeader.id,
    tournamentId: teamData.tournamentId,
  })

  return Response.json(
    {
      success: true,
      team: {
        id: team.id,
        teamName: team.teamName,
        division: team.division,
      },
    },
    { status: 200 }
  )
}

export default function NewTeamPage(): JSX.Element {
  const actionData = useActionData<TeamCreateActionData>()
  const { tournaments } = useLoaderData<typeof loader>()

  // Prepare success message with translated division label
  const successMessage =
    actionData?.success && actionData.team
      ? `Team "${actionData.team.teamName}" (${getDivisionLabel(actionData.team.division as Division, 'en')}) created successfully!`
      : undefined

  return (
    <TeamForm
      mode='create'
      variant='public'
      tournaments={tournaments}
      errors={actionData?.errors || {}}
      isSuccess={actionData?.success || false}
      successMessage={successMessage}
    />
  )
}
