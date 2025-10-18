import type { ZodIssue } from 'zod'
import { z } from 'zod'

import type { TFunction } from 'i18next'

import type { TeamFormData, TeamValidationInput } from './types'

// ============================================================================
// Validation Patterns
// ============================================================================

/**
 * Phone number validation regex
 * Allows: +, digits, spaces, hyphens, parentheses
 */
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]+$/

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Base team schema without translations (for server-side validation)
 */
const baseTeamSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().min(1).max(50),
  clubName: z.string().min(1).max(100),
  division: z.string().min(1),
  category: z.string().min(1),
  teamLeaderName: z.string().min(1).max(100),
  teamLeaderPhone: z
    .string()
    .min(1)
    .pipe(
      z.string().refine(val => PHONE_REGEX.test(val), {
        error: 'Invalid phone number format',
      })
    ),
  teamLeaderEmail: z
    .string()
    .min(1)
    .pipe(z.email({ error: 'Invalid email address' })),
  privacyAgreement: z.boolean().refine(val => val, {
    error: 'Privacy agreement is required',
  }),
})

/**
 * Schema for create mode (includes privacy agreement)
 */
const createTeamSchema = baseTeamSchema

/**
 * Schema for edit mode (omits privacy agreement)
 */
const editTeamSchema = baseTeamSchema.omit({ privacyAgreement: true })

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Factory function for creating schemas with translated error messages
 * @internal Use getTeamValidationSchema instead
 */
const createTeamFormSchema = (t: TFunction) =>
  z.object({
    // Tournament selection (required for create mode)
    tournamentId: z.string().min(1, t('messages.team.tournamentRequired')),

    // Basic team information
    name: z
      .string()
      .min(1, t('messages.team.nameRequired'))
      .max(50, t('messages.team.nameTooLong')),
    clubName: z
      .string()
      .min(1, t('messages.team.clubNameRequired'))
      .max(100, t('messages.team.clubNameTooLong')),
    division: z.string().min(1, t('messages.team.divisionRequired')),
    category: z.string().min(1, t('messages.team.categoryRequired')),

    // Team leader information (required for create mode)
    teamLeaderName: z
      .string()
      .min(1, t('messages.team.teamLeaderNameRequired'))
      .max(100, t('messages.team.teamLeaderNameTooLong')),
    teamLeaderPhone: z
      .string()
      .min(1, t('messages.team.phoneNumberRequired'))
      .pipe(
        z.string().refine(val => PHONE_REGEX.test(val), {
          error: t('messages.team.phoneNumberInvalid'),
        })
      ),
    teamLeaderEmail: z
      .string()
      .min(1, t('messages.validation.emailRequired'))
      .pipe(z.email({ error: t('messages.validation.emailInvalid') })),

    // Privacy agreement (required for public create mode)
    privacyAgreement: z.boolean().refine(val => val, {
      error: t('messages.team.privacyAgreementRequired'),
    }),
  })

/**
 * Get the appropriate validation schema based on mode
 * @param mode - 'create' or 'edit'
 * @param t - Translation function for error messages
 * @returns Zod schema for validation
 */
export function getTeamValidationSchema(
  mode: 'create' | 'edit',
  t: TFunction
):
  | ReturnType<typeof createTeamFormSchema>
  | ReturnType<ReturnType<typeof createTeamFormSchema>['omit']> {
  const schema = createTeamFormSchema(t)
  return mode === 'create' ? schema : schema.omit({ privacyAgreement: true })
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Server-side validation without translations
 * @param teamData - Data to validate
 * @param mode - 'create' or 'edit'
 * @returns Validation result with success/error
 */
export function validateTeamData(
  teamData: TeamValidationInput,
  mode: 'create' | 'edit'
):
  | ReturnType<typeof createTeamSchema.safeParse>
  | ReturnType<typeof editTeamSchema.safeParse> {
  const schema = mode === 'create' ? createTeamSchema : editTeamSchema
  return schema.safeParse(teamData)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract team data from FormData object
 * @param formData - FormData from form submission
 * @returns Extracted team data object
 */
export const extractTeamDataFromFormData = (formData: FormData): TeamFormData => ({
  tournamentId: (formData.get('tournamentId') as string) || '',
  clubName: (formData.get('clubName') as string) || '',
  name: (formData.get('name') as string) || '',
  division: (formData.get('division') as string) || '',
  category: (formData.get('category') as string) || '',
  teamLeaderName: (formData.get('teamLeaderName') as string) || '',
  teamLeaderPhone: (formData.get('teamLeaderPhone') as string) || '',
  teamLeaderEmail: (formData.get('teamLeaderEmail') as string) || '',
  privacyAgreement: formData.get('privacyAgreement') === 'on',
})

// ============================================================================
// Field Mapping
// ============================================================================

/**
 * Map store field names to Zod schema field names
 * @param storeFieldName - Field name from store
 * @returns Corresponding Zod schema field name
 */
export const mapStoreFieldToZodField = (storeFieldName: string): string =>
  storeFieldName

/**
 * Get translation key for field error
 * @param fieldName - Name of the field
 * @param zodIssue - Optional Zod issue for context
 * @returns Translation key for the error message
 */
export const getFieldErrorTranslationKey = (
  fieldName: string,
  zodIssue?: Pick<ZodIssue, 'code'>
): string => {
  // Handle empty/too small errors (required field validation from .min())
  // This takes precedence over format validation
  if (zodIssue?.code === 'too_small') {
    // Use the default required field error mapping below
  }

  // Handle email format validation errors (from Zod's .email())
  // Only for invalid format, not for empty strings (which are handled by too_small)
  else if (fieldName === 'teamLeaderEmail' && zodIssue?.code === 'invalid_format') {
    return 'messages.validation.emailInvalid'
  }

  // Handle custom validation errors (format validation for phone)
  else if (zodIssue?.code === 'custom') {
    if (fieldName === 'teamLeaderEmail') {
      return 'messages.validation.emailInvalid'
    }
    if (fieldName === 'teamLeaderPhone') {
      return 'messages.validation.phoneNumberInvalid'
    }
  }

  // Handle string too long errors
  else if (zodIssue?.code === 'too_big') {
    if (fieldName === 'name') {
      return 'messages.team.nameTooLong'
    }
    if (fieldName === 'clubName') {
      return 'messages.team.clubNameTooLong'
    }
    if (fieldName === 'teamLeaderName') {
      return 'messages.team.teamLeaderNameTooLong'
    }
  }

  // Default required field translation keys
  const errorKeyMap: Record<string, string> = {
    // Zod field names
    tournamentId: 'messages.team.tournamentRequired',
    clubName: 'messages.team.clubNameRequired',
    name: 'messages.team.nameRequired',
    division: 'messages.team.divisionRequired',
    category: 'messages.team.categoryRequired',
    teamLeaderName: 'messages.team.teamLeaderNameRequired',
    teamLeaderPhone: 'messages.team.phoneNumberRequired',
    teamLeaderEmail: 'messages.validation.emailRequired',
    privacyAgreement: 'messages.team.privacyAgreementRequired',
    // Store field names (for consistency)
    selectedTournamentId: 'messages.team.tournamentRequired',
    selectedDivision: 'messages.team.divisionRequired',
    selectedCategory: 'messages.team.categoryRequired',
  }
  return errorKeyMap[fieldName] || 'messages.validation.fieldRequired'
}

/**
 * Validate a single field and return translation key if error
 * @param fieldName - Name of the field to validate
 * @param formData - Complete form data
 * @param mode - 'create' or 'edit'
 * @returns Translation key if error, null otherwise
 */
export const validateSingleTeamField = (
  fieldName: string,
  formData: TeamFormData,
  mode: 'create' | 'edit'
): string | null => {
  try {
    const result =
      mode === 'create'
        ? validateTeamData(formData, 'create')
        : validateTeamData(formData, 'edit')

    if (!result.success) {
      // Find the error for this specific field
      const zodFieldName = mapStoreFieldToZodField(fieldName)
      const fieldErrors = result.error.issues.filter((error: ZodIssue) => {
        const path = error.path[0]
        return path === zodFieldName
      })

      if (fieldErrors.length > 0) {
        // Prioritize 'too_small' errors (empty/required fields) over format errors
        const fieldError =
          fieldErrors.find(err => err.code === 'too_small') || fieldErrors[0]
        return getFieldErrorTranslationKey(zodFieldName, fieldError)
      }
    }

    return null
  } catch (_error: unknown) {
    // Fallback validation for basic empty field check
    const zodFieldName = mapStoreFieldToZodField(fieldName)
    const fieldValue = formData[zodFieldName as keyof TeamFormData]
    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      return getFieldErrorTranslationKey(fieldName)
    }
    return null
  }
}

/**
 * Validate entire form and return all translation keys
 * @param formData - Complete form data
 * @param mode - 'create' or 'edit'
 * @returns Record of field names to translation keys
 */
export const validateEntireTeamForm = (
  formData: TeamFormData,
  mode: 'create' | 'edit'
): Record<string, string> => {
  const errors: Record<string, string> = {}

  try {
    const result =
      mode === 'create'
        ? validateTeamData(formData, 'create')
        : validateTeamData(formData, 'edit')

    if (!result.success) {
      // Group errors by field
      const errorsByField: Record<string, ZodIssue[]> = {}
      result.error.issues.forEach((error: ZodIssue) => {
        const zodFieldName = error.path[0] as string
        if (zodFieldName) {
          if (!errorsByField[zodFieldName]) {
            errorsByField[zodFieldName] = []
          }
          errorsByField[zodFieldName].push(error)
        }
      })

      // For each field, prioritize 'too_small' errors (empty/required fields)
      Object.keys(errorsByField).forEach(fieldName => {
        const fieldErrors = errorsByField[fieldName]
        const prioritizedError =
          fieldErrors.find(err => err.code === 'too_small') || fieldErrors[0]
        errors[fieldName] = getFieldErrorTranslationKey(fieldName, prioritizedError)
      })
    }
  } catch (_error: unknown) {
    // Validation error occurred, returning empty errors object
  }

  return errors
}
