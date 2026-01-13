import type { Team as PrismaTeam } from '@prisma/client'
import type { TournamentListItem } from '~/features/tournaments/types'

// ============================================================================
// Team Types
// ============================================================================

/**
 * Branded type for team names with validation potential
 */
export type TeamName = string & { readonly brand: unique symbol }

/**
 * Team class/category (flexible string for now)
 */
export type TeamClass = string

/**
 * Core team type matching database schema
 * Uses Prisma type directly to avoid schema drift
 */
export type Team = PrismaTeam

/**
 * Team list item for display in lists and grids
 */
export type TeamListItem = Pick<PrismaTeam, 'id' | 'name' | 'clubName' | 'category'>

/**
 * Team leader full information
 */
export type TeamLeaderFull = {
	id: string
	email: string
	firstName: string
	lastName: string
	phone: string
}

/**
 * Team with full team leader information
 */
export type TeamWithLeaderFull = Team & {
	teamLeader: TeamLeaderFull
}

// ============================================================================
// Form Types
// ============================================================================

/**
 * Form mode for team operations
 */
export type FormMode = 'create' | 'edit'

/**
 * Form variant for public vs admin contexts
 */
export type FormVariant = 'public' | 'admin'

/**
 * Complete team form data structure
 */
export type TeamFormData = {
	tournamentId: string
	clubName: string
	name: string
	division: string
	category: string
	teamLeaderName: string
	teamLeaderPhone: string
	teamLeaderEmail: string
	privacyAgreement: boolean
}

/**
 * Props for TeamForm component
 */
export type TeamFormProps = {
	mode?: FormMode
	variant?: FormVariant
	formData?: Partial<TeamFormData>
	errors?: Record<string, string>
	isSuccess?: boolean
	successMessage?: string
	submitButtonText?: string
	className?: string
	intent?: string
	// Optional props for providing data directly (can be undefined for backward compatibility)
	availableDivisions?: string[]
	availableCategories?: string[]
	tournamentId?: string | null
}

/**
 * Extracted team data from FormData
 */
export type ExtractedTeamData = {
	tournamentId: string
	clubName: string
	name: string
	division: string
	category: string
	teamLeaderName: string
	teamLeaderPhone: string
	teamLeaderEmail: string
	privacyAgreement: boolean
}

// ============================================================================
// Action Data Types
// ============================================================================

/**
 * Team creation action response data
 */
export type TeamCreateActionData = {
	success?: boolean
	team?: {
		id: string
		name: string
		division: string
	}
	errors?: {
		tournamentId?: string
		clubName?: string
		name?: string
		division?: string
		category?: string
		teamLeaderName?: string
		teamLeaderPhone?: string
		teamLeaderEmail?: string
		privacyAgreement?: string
		teamLeader?: string
		tournament?: string
	}
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Team validation input (generic record for flexibility)
 */
export type TeamValidationInput = Record<string, unknown>

// ============================================================================
// Loader Data Types
// ============================================================================

/**
 * Teams page loader data (shared between public and admin)
 */
export type TeamsLoaderData = {
	teamListItems: TeamListItem[]
	tournamentListItems: TournamentListItem[]
	selectedTournamentId?: string
}
