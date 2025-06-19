import { JSX } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  useActionData,
} from 'react-router'

import { Category, Division } from '@prisma/client'

import { TeamForm } from '~/components/TeamForm'
import { prisma } from '~/db.server'
import { validateEntireForm } from '~/lib/lib.form'
import { getDivisionLabel, stringToCategory, stringToDivision } from '~/lib/lib.helpers'
import type { TeamCreateActionData, TeamFormData } from '~/lib/lib.types'
import { extractTeamDataFromFormData } from '~/lib/lib.zod'
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

export const loader = async ({ request: _ }: LoaderFunctionArgs): Promise<void> => {
  // Tournaments are now loaded automatically by the root layout
}

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const formData = await request.formData()

  // Extract form data using shared utility
  const teamData = extractTeamDataFromFormData(formData)

  // Convert ExtractedTeamData to TeamFormData for validation
  // We use type assertion here because server-side validation is more permissive
  const teamFormData = teamData as TeamFormData

  // Validate using the form validation system
  const fieldErrors = validateEntireForm(teamFormData, 'create')

  // Additional business logic validation
  const validDivision = teamData.division ? stringToDivision(teamData.division) : null
  if (teamData.division && !validDivision) {
    fieldErrors.division = 'Invalid division'
  }

  const validCategory = teamData.category ? stringToCategory(teamData.category) : null
  if (teamData.category && !validCategory) {
    fieldErrors.category = 'Invalid category'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return Response.json({ errors: fieldErrors }, { status: 400 })
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
      { errors: { tournamentId: 'Tournament not found' } },
      { status: 404 }
    )
  }

  const team = await createTeam({
    clubName: teamData.clubName,
    teamName: teamData.teamName,
    division: validDivision as Division,
    category: validCategory as Category,
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

  // Prepare success message with translated division label
  const successMessage =
    actionData?.success && actionData.team
      ? `Team "${actionData.team.teamName}" (${getDivisionLabel(actionData.team.division as Division, 'en')}) created successfully!`
      : undefined

  return (
    <TeamForm
      mode='create'
      variant='public'
      errors={actionData?.errors || {}}
      isSuccess={actionData?.success || false}
      successMessage={successMessage}
    />
  )
}
