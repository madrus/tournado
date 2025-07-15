// ============================================================================
// Team Types (moved from teams.types.ts)
// ============================================================================
import type { Team as PrismaTeam } from '@prisma/client'

/**
 * @fileoverview Centralized Type System for Tournado Application
 *
 * This file contains all custom type definitions for the Tournado application,
 * focusing on strict type safety and controlled database-to-type conversions.
 *
 * Key principles:
 * - Prefer branded types for domain-specific values
 * - Use union types for controlled sets of values
 * - Maintain database compatibility through helper functions
 * - Future-ready design for validation enhancements
 *
 * For detailed documentation, see: docs/development/type-system.md
 */

// Foundation Types

/**
 * Branded type for team names with validation potential
 */
export type TeamName = string & { readonly brand: unique symbol }

/**
 * Branded type for email addresses with validation potential
 */
export type Email = string & { readonly brand: unique symbol }

/**
 * Team class/category (flexible string for now)
 */
export type TeamClass = string

// ============================================================================
// Icon Types
// ============================================================================

export type IconVariant = 'outlined' | 'filled'
export type IconWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700

/**
 * Color accent options for UI components
 * Includes all official Tailwind CSS color names, plus:
 * - 'brand' (maps to 'red')
 * - 'primary' (maps to 'emerald')
 */
export type ColorAccent =
  | 'brand' // special: maps to 'red'
  | 'primary' // special: maps to 'emerald'
  | 'slate'
  | 'slate'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'

// ============================================================================

// ============================================================================

export type TeamListItem = Pick<PrismaTeam, 'id' | 'clubName' | 'teamName' | 'category'>

export type TournamentListItem = {
  id: string
  name: string
  location: string
}

export type TeamsLoaderData = {
  teamListItems: TeamListItem[]
  tournamentListItems: TournamentListItem[]
  selectedTournamentId?: string
}

export type TournamentFilterOption = {
  value: string
  label: string
}

// ============================================================================
// Division System
// ============================================================================

/**
 * Division configuration object for localization and metadata
 */
export type DivisionObject = {
  value: string
  labels: {
    en: string
    nl: string
    ar: string
    tr: string
  }
  order: number
}

// ============================================================================
// Category System
// ============================================================================

/**
 * Category configuration object for localization and metadata
 */
export type CategoryObject = {
  value: string
  labels: {
    en: string
    nl: string
    ar: string
    tr: string
  }
  order: number
  ageGroup?: {
    min: number
    max: number
  }
  gender?: 'MIXED' | 'BOYS' | 'GIRLS' | 'MEN' | 'WOMEN'
}

// ============================================================================
// Tournament Types
// ============================================================================

export type Tournament = {
  id: string
  name: string
  location: string
  date: Date
}

export type TournamentData = {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string | null
  divisions: string[]
  categories: string[]
}

// ============================================================================
// Team Types
// ============================================================================

export type Team = {
  id: string
  createdAt: Date
  updatedAt: Date
  tournamentId: string
  category: string
  division: string
  clubName: string
  teamName: string
  teamLeaderId: string
}

export type TeamFormData = {
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

// ============================================================================
// Form Integration Types
// ============================================================================

export type FormMode = 'create' | 'edit'
export type FormVariant = 'public' | 'admin'

/**
 * Props for TeamForm component - maintains backward compatibility
 */
export type TeamFormProps = {
  mode?: FormMode
  variant?: FormVariant
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
  // Optional props for providing data directly (can be undefined for backward compatibility)
  availableDivisions?: string[]
  availableCategories?: string[]
  tournamentId?: string | null
}

/**
 * Props for TournamentForm component
 */
export type TournamentFormProps = {
  mode?: 'create' | 'edit'
  initialData?: {
    id?: string
    name: string
    location: string
    divisions: string[]
    categories: string[]
    startDate: string
    endDate?: string
  }
}

// ============================================================================
// Action Data Types
// ============================================================================

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

// ============================================================================
// Validation Types
// ============================================================================

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

export type TeamValidationInput = Record<string, unknown>
export type TeamValidationSchema = TeamFormSchemaType
export type TeamValidationSafeParseResult<T extends 'create' | 'edit'> =
  T extends 'create'
    ? import('zod').SafeParseReturnType<TeamValidationInput, TeamFormData>
    : import('zod').SafeParseReturnType<
        TeamValidationInput,
        Omit<TeamFormData, 'privacyAgreement'>
      >

export type ExtractedTeamData = {
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

// ============================================================================
// Future Enhancement Placeholders
// ============================================================================

/**
 * Placeholder for future validation rules
 */
export type ValidationRule = {
  field: string
  rule: string
  message: string
}

/**
 * Placeholder for future form validation
 */
export type FormValidation = {
  rules: ValidationRule[]
  isValid: boolean
  errors: string[]
}
