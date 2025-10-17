import type { Team as PrismaTeam } from '@prisma/client'

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
 */
export type Team = {
  id: string
  name: string
  tournamentId: string
  category: string
  division: string
  clubName: string
  teamLeaderId: string
  createdAt: Date
  updatedAt: Date
}

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
  tournamentId: string
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

/**
 * Team form schema type (using Zod)
 */
export type TeamFormSchemaType = import('zod').ZodObject<{
  tournamentId: import('zod').ZodString
  clubName: import('zod').ZodString
  name: import('zod').ZodString
  division: import('zod').ZodString
  category: import('zod').ZodString
  teamLeaderName: import('zod').ZodString
  teamLeaderPhone: import('zod').ZodSchema<string>
  teamLeaderEmail: import('zod').ZodSchema<string>
  privacyAgreement: import('zod').ZodSchema<boolean>
}>

/**
 * Team validation schema alias
 */
export type TeamValidationSchema = TeamFormSchemaType

/**
 * Type-safe validation result based on mode
 */
export type TeamValidationSafeParseResult<T extends 'create' | 'edit'> =
  T extends 'create'
    ? // eslint-disable-next-line id-blacklist
      | { success: true; data: TeamFormData }
        | { success: false; error: import('zod').ZodError }
    : // eslint-disable-next-line id-blacklist
      | { success: true; data: Omit<TeamFormData, 'privacyAgreement'> }
        | { success: false; error: import('zod').ZodError }

// ============================================================================
// Loader Data Types
// ============================================================================

/**
 * Teams page loader data (shared between public and admin)
 */
export type TeamsLoaderData = {
  teamListItems: TeamListItem[]
  tournamentListItems: Array<{
    id: string
    name: string
    location: string
    startDate: Date
    endDate: Date
  }>
  selectedTournamentId?: string
}
