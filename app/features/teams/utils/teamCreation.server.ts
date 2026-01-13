import type { Division, Team, TeamLeader } from '@prisma/client'
import { prisma } from '~/db.server'
import {
	extractTeamDataFromFormData,
	validateEntireTeamForm,
} from '~/features/teams/validation'
import { stringToCategory, stringToDivision } from '~/lib/lib.helpers'
import { createTeam } from '~/models/team.server'
import { getTournamentById } from '~/models/tournament.server'
import { sendConfirmationEmail } from '~/utils/email.server'
import { logger } from '~/utils/logger.server'

type TeamCreationSuccess = {
	success: true
	team: {
		name: string
		id: string
		division: Division
	}
}

type TeamCreationError = {
	success: false
	errors: Record<string, string>
}

type TeamCreationResult = TeamCreationSuccess | TeamCreationError

/**
 * Find or create a team leader based on email using upsert to avoid race conditions
 */
async function findOrCreateTeamLeader(teamLeaderData: {
	name: string
	email: string
	phone: string
}): Promise<TeamLeader> {
	const [firstName, ...lastNameParts] = teamLeaderData.name.split(' ')
	const lastName = lastNameParts.join(' ') || ''

	return prisma.teamLeader.upsert({
		where: { email: teamLeaderData.email },
		update: { firstName, lastName, phone: teamLeaderData.phone },
		create: {
			firstName,
			lastName,
			email: teamLeaderData.email,
			phone: teamLeaderData.phone,
		},
	})
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
	formData: FormData,
): Promise<TeamCreationResult> {
	// Extract form data using shared utility
	const teamFormData = extractTeamDataFromFormData(formData)

	// Validate using the form validation system
	const fieldErrors = validateEntireTeamForm(teamFormData, 'create')

	// Additional business logic validation
	const validDivision = teamFormData.division
		? stringToDivision(teamFormData.division)
		: null
	if (teamFormData.division && !validDivision) {
		fieldErrors.division = 'Invalid division'
	}

	const validCategory = teamFormData.category
		? stringToCategory(teamFormData.category)
		: null
	if (teamFormData.category && !validCategory) {
		fieldErrors.category = 'Invalid category'
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { success: false, errors: fieldErrors }
	}

	// Type narrowing: ensure division and category are valid after validation
	if (!validDivision) {
		return { success: false, errors: { division: 'Division is required' } }
	}
	if (!validCategory) {
		return { success: false, errors: { category: 'Category is required' } }
	}

	let team: Team

	try {
		// Find or create team leader
		const teamLeader = await findOrCreateTeamLeader({
			name: teamFormData.teamLeaderName,
			email: teamFormData.teamLeaderEmail,
			phone: teamFormData.teamLeaderPhone,
		})

		// Verify tournament exists
		const tournamentExists = await verifyTournamentExists(teamFormData.tournamentId)
		if (!tournamentExists) {
			return {
				success: false,
				errors: { tournamentId: 'Tournament not found' },
			}
		}

		// Create the team (no type assertions needed - validDivision/validCategory are guaranteed non-null)
		team = await createTeam({
			clubName: teamFormData.clubName,
			name: teamFormData.name,
			division: validDivision,
			category: validCategory,
			teamLeaderId: teamLeader.id,
			tournamentId: teamFormData.tournamentId,
		})

		// Get tournament details for email
		const tournament = await getTournamentById({
			id: teamFormData.tournamentId,
		})

		// Send confirmation email (fire-and-forget - don't block team creation)
		if (tournament) {
			void sendConfirmationEmail(team, tournament).catch((emailError) => {
				logger.error({ err: emailError }, 'Failed to send confirmation email')
			})
		} else {
			logger.error(
				{ tournamentId: teamFormData.tournamentId },
				'Tournament not found for email sending',
			)
		}
	} catch (error) {
		return {
			success: false,
			errors: { general: `Team creation failed: ${(error as Error).message}` },
		}
	}

	return {
		success: true,
		team: {
			id: team.id,
			name: team.name,
			division: team.division,
		},
	}
}
