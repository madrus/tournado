/* eslint-disable id-blacklist */
import { Category, Division } from '@prisma/client'

import { prisma } from '~/db.server'
import { stringToCategory, stringToDivision } from '~/lib/lib.helpers'
import type { TeamFormData } from '~/lib/lib.types'
import { extractTeamDataFromFormData } from '~/lib/lib.zod'
import { createTeam } from '~/models/team.server'
import { validateEntireTeamForm } from '~/utils/form-validation'

type TeamCreationResult = {
  success: boolean
  team?: {
    id: string
    teamName: string
    division: string
  }
  errors?: Record<string, string>
}

/**
 * Find or create a team leader based on email
 */
async function findOrCreateTeamLeader(data: {
  name: string
  email: string
  phone: string
}) {
  // Try to find existing team leader by email
  let teamLeader = await prisma.teamLeader.findUnique({
    where: { email: data.email },
  })

  // If not found, create new team leader
  if (!teamLeader) {
    const [firstName, ...lastNameParts] = data.name.split(' ')
    const lastName = lastNameParts.join(' ') || ''

    teamLeader = await prisma.teamLeader.create({
      data: {
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
      },
    })
  }

  return teamLeader
}

/**
 * Verify that a tournament exists by ID
 */
async function verifyTournamentExists(tournamentId: string): Promise<boolean> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  })
  return tournament !== null
}

/**
 * Complete team creation workflow with validation and database operations
 * This function handles the entire process from form data to database creation
 */
export async function createTeamFromFormData(
  formData: FormData
): Promise<TeamCreationResult> {
  // Extract form data using shared utility
  const teamData = extractTeamDataFromFormData(formData)
  const teamFormData = teamData as TeamFormData

  // Validate using the form validation system
  const fieldErrors = validateEntireTeamForm(teamFormData, 'create')

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
    return { success: false, errors: fieldErrors }
  }

  // Find or create team leader
  const teamLeader = await findOrCreateTeamLeader({
    name: teamData.teamLeaderName,
    email: teamData.teamLeaderEmail,
    phone: teamData.teamLeaderPhone,
  })

  // Verify tournament exists
  const tournamentExists = await verifyTournamentExists(teamData.tournamentId)
  if (!tournamentExists) {
    return {
      success: false,
      errors: { tournamentId: 'Tournament not found' },
    }
  }

  // Create the team
  const team = await createTeam({
    clubName: teamData.clubName,
    teamName: teamData.teamName,
    division: validDivision as Division,
    category: validCategory as Category,
    teamLeaderId: teamLeader.id,
    tournamentId: teamData.tournamentId,
  })

  return {
    success: true,
    team: {
      id: team.id,
      teamName: team.teamName,
      division: team.division,
    },
  }
}
