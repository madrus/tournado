/**
 * @fileoverview Centralized Type System
 *
 * This file contains all shared type definitions for the Tournado application.
 *
 * The type system implements strong typing patterns with template literal types
 * and strict type definitions to ensure type safety across the application.
 *
 * Key features:
 * - Centralized type definitions for reusability
 * - Strong typing with template literal patterns
 * - Database compatibility through type conversion utilities
 * - Form system types for TeamForm component
 * - Route-specific data structures
 *
 * For detailed documentation, see: docs/development/type-system.md
 */
import type { Team as PrismaTeam } from '@prisma/client'

// Division types from the alternative DIVISIONS object implementation
export type DivisionKey =
  | 'PREMIER_DIVISION'
  | 'FIRST_DIVISION'
  | 'SECOND_DIVISION'
  | 'THIRD_DIVISION'
  | 'FOURTH_DIVISION'
  | 'FIFTH_DIVISION'
export type DivisionValue =
  | 'PREMIER_DIVISION'
  | 'FIRST_DIVISION'
  | 'SECOND_DIVISION'
  | 'THIRD_DIVISION'
  | 'FOURTH_DIVISION'
  | 'FIFTH_DIVISION'
export type DivisionObject = {
  value: DivisionValue
  labels: { en: string; nl: string; ar: string; tr: string }
  order: number
}

// Category types from the CATEGORIES object implementation
export type CategoryKey =
  | 'JO8'
  | 'JO9'
  | 'JO10'
  | 'JO11'
  | 'JO12'
  | 'JO13'
  | 'JO14'
  | 'JO15'
  | 'JO16'
  | 'JO17'
  | 'JO19'
  | 'MO8'
  | 'MO9'
  | 'MO10'
  | 'MO11'
  | 'MO12'
  | 'MO13'
  | 'MO14'
  | 'MO15'
  | 'MO16'
  | 'MO17'
  | 'MO19'
  | 'VETERANEN_35_PLUS'
  | 'VETERANEN_40_PLUS'
  | 'VETERANEN_45_PLUS'
  | 'VETERANEN_50_PLUS'
export type CategoryValue =
  | 'JO8'
  | 'JO9'
  | 'JO10'
  | 'JO11'
  | 'JO12'
  | 'JO13'
  | 'JO14'
  | 'JO15'
  | 'JO16'
  | 'JO17'
  | 'JO19'
  | 'MO8'
  | 'MO9'
  | 'MO10'
  | 'MO11'
  | 'MO12'
  | 'MO13'
  | 'MO14'
  | 'MO15'
  | 'MO16'
  | 'MO17'
  | 'MO19'
  | 'VETERANEN_35_PLUS'
  | 'VETERANEN_40_PLUS'
  | 'VETERANEN_45_PLUS'
  | 'VETERANEN_50_PLUS'
export type CategoryObject = {
  value: CategoryValue
  labels: { en: string; nl: string; ar: string; tr: string }
  order: number
}

// TeamName type should have the following format:
// e.g. "JO8-1"
// J = Jongens (boys), M = Meisjes (girls), JM = Jongens e Meisjes (boys and girls)
// O = onder (age group)
// 8 = age group
// 1 = team class or number
export type TeamName = `${'J' | 'M' | 'JM'}${'O'}${number}-${number}`

// TeamClass type should have the following format:
// e.g. "Eerste klasse", "Tweede klasse", "Derde klasse"
export type TeamClass = string

export type Tournament = {
  id: string
  name: string
  location: string
  date: Date
}

// rollen:
// - Admin = admin
// - Toernooibeheerder = organiser
// - Scheidsrechter coordinator = coordinator
//   - kan scores voor alle wedstrijden invullen
// - Scheidsrechter = referee
//   - kan scores voor zijn eigen wedstrijden invullen
// - Public = readonly <-- geen expliciete rol nodig
//   - kan geen uitslagen invullen

// JO7-1
//   - JO7 = leeftijdscategorie
//   - 1 = teamnummer in de leeftijdscategorie

/**
 * Als gebruiker van de Tournado App wil ik een inschrijving doen van mijn club.
 * Ik wil meerdere teams kunnen inschrijven voor een toernooi.
 *
 * De volgende gegevens moeten meegegeven kunnen worden bij de inschrijving:
 * - Korte tekst bovenaan het formulier (Welk toernooi, plaats, datum, enz.).
 * - Clubnaam (verplicht) (via API Club logo en basisgegevens ophalen).
 * - Teamnaam (verplicht).
 * - Teamklasse (verplicht).
 * - Naam teamleider (verplicht) = contactpersoon.
 * - Telefoon teamleider (verplicht).
 * - Email teamleider (verplicht).
 * - Knop om nog een team in te schrijven.
 * - Afvink box om akkoord te gaan met privacy beleid van ons (verplicht).
 * - Een bevestiging van inschrijving via de mail krijg.
 */

// Complete Team type including all fields
export type Team = PrismaTeam

// Email type matching basic e-mail pattern: local@domain.tld
export type Email = `${string}@${string}.${string}`

// Icon types (used by individual icon components)
export type IconVariant = 'outlined' | 'filled'
export type IconWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700

// Type for form input - with strict types for better validation
export type TeamFormData = {
  tournamentId: string // which tournament the team is registering for
  clubName: string // via API Club -- logo en basisgegevens ophalen
  teamName: TeamName // Strict type for validation
  division: TeamClass // Strict type for validation
  category: string // added for team category
  teamLeaderName: string
  teamLeaderPhone: string
  teamLeaderEmail: Email // Strict type for validation
  privacyAgreement: boolean
}

// ============================================================================
// Route Types - Shared across team routes
// ============================================================================

/**
 * Tournament data structure used in loaders
 */
export type TournamentData = {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string | null
  divisions: string[]
  categories: string[] // added for tournament categories
}

/**
 * Loader data for team creation routes (both public and admin)
 */
export type TeamCreateLoaderData = {
  tournaments: Array<TournamentData>
}

/**
 * Action data for team creation routes (both public and admin)
 */
export type TeamCreateActionData = {
  success?: boolean
  team?: {
    id: string
    teamName: string
    division: string
  }
  errors?: {
    tournamentId?: string
    clubName?: string
    teamName?: string
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

/**
 * Action data for team edit routes (admin only)
 */
export type TeamEditActionData = {
  errors?: {
    clubName?: string
    teamName?: string
    division?: string
  }
}

// ============================================================================
// Team Form Component Types
// ============================================================================

/**
 * Form mode for team forms
 */
export type FormMode = 'create' | 'edit'

/**
 * Form variant for team forms
 */
export type FormVariant = 'public' | 'admin'

/**
 * Props for TeamForm component
 */
export type TeamFormProps = {
  mode: FormMode
  variant: FormVariant
  formData?: Partial<TeamFormData>
  errors?: Record<string, string>
  isSuccess?: boolean
  successMessage?: string
  submitButtonText?: string
  onCancel?: () => void
  showDeleteButton?: boolean
  onDelete?: () => void
  className?: string
  intent?: string
}

// ============================================================================
// Validation Types - Schema and Hook Related
// ============================================================================

/**
 * Complex ZodObject type for createTeamFormSchema return type (full schema with privacy)
 */
export type TeamFormSchemaType = import('zod').ZodObject<{
  tournamentId: import('zod').ZodString
  clubName: import('zod').ZodString
  teamName: import('zod').ZodString
  division: import('zod').ZodString
  category: import('zod').ZodString
  teamLeaderName: import('zod').ZodString
  teamLeaderPhone: import('zod').ZodEffects<import('zod').ZodString, string, string>
  teamLeaderEmail: import('zod').ZodEffects<import('zod').ZodString, string, string>
  privacyAgreement: import('zod').ZodEffects<import('zod').ZodBoolean, boolean, boolean>
}>

/**
 * ZodObject type for edit mode (schema without privacy agreement)
 */
export type TeamFormEditSchemaType = import('zod').ZodObject<{
  tournamentId: import('zod').ZodString
  clubName: import('zod').ZodString
  teamName: import('zod').ZodString
  division: import('zod').ZodString
  category: import('zod').ZodString
  teamLeaderName: import('zod').ZodString
  teamLeaderPhone: import('zod').ZodEffects<import('zod').ZodString, string, string>
  teamLeaderEmail: import('zod').ZodEffects<import('zod').ZodString, string, string>
}>

/**
 * Union type for validation schemas based on mode
 */
export type TeamValidationSchema = TeamFormSchemaType | TeamFormEditSchemaType

/**
 * Type for team data validation input (raw form data)
 */
export type TeamValidationInput = Record<string, unknown>

/**
 * Type for successful validation result in create mode
 */
export type TeamCreateValidationResult = {
  tournamentId: string
  clubName: string
  teamName: string
  division: string
  category: string
  teamLeaderName: string
  teamLeaderPhone: string
  teamLeaderEmail: string
  privacyAgreement: boolean
}

/**
 * Type for successful validation result in edit mode
 */
export type TeamEditValidationResult = {
  tournamentId: string
  clubName: string
  teamName: string
  division: string
  category: string
  teamLeaderName: string
  teamLeaderPhone: string
  teamLeaderEmail: string
}

/**
 * Type-safe SafeParseReturnType for team validation
 */
export type TeamValidationSafeParseResult<T extends 'create' | 'edit'> =
  T extends 'create'
    ? import('zod').SafeParseReturnType<TeamValidationInput, TeamCreateValidationResult>
    : import('zod').SafeParseReturnType<TeamValidationInput, TeamEditValidationResult>

/**
 * Extracted team data from FormData
 */
export type ExtractedTeamData = {
  tournamentId: string
  clubName: string
  teamName: string
  division: string
  category: string // added for team category
  teamLeaderName: string
  teamLeaderPhone: string
  teamLeaderEmail: string
  privacyAgreement: boolean
}

/**
 * Return type for useTeamFormValidation hook
 */
export type UseTeamFormValidationReturn = {
  validationErrors: Record<string, string>
  touchedFields: Record<string, boolean>
  submitAttempted: boolean
  forceShowAllErrors: boolean
  displayErrors: Record<string, string>
  validateForm: (submissionFormData: FormData, forceShowErrors?: boolean) => boolean
  handleFieldBlur: (name: string, value: string | boolean) => void
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  shouldShowFieldError: (fieldName: string) => boolean
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setTouchedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setSubmitAttempted: React.Dispatch<React.SetStateAction<boolean>>
  setForceShowAllErrors: React.Dispatch<React.SetStateAction<boolean>>
}

export type TeamLeaderFull = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
}

export type TeamWithLeaderFull = Team & {
  tournamentId: string
  teamLeader: TeamLeaderFull
}
