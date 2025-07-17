import { z } from 'zod'

import type { TeamFormData } from '~/lib/lib.types'
import {
  type TournamentFormData,
  validateTeamData,
  validateTournamentData,
} from '~/lib/lib.zod'

// Map store field names to Zod schema field names
export const mapStoreFieldToZodField = (storeFieldName: string): string =>
  storeFieldName

// Map field names to translation keys (matches translation file structure)
export const getFieldErrorTranslationKey = (
  fieldName: string,
  zodIssue?: Pick<z.ZodIssue, 'code'>
): string => {
  // If we have a Zod issue, check if it's a refine error (custom validation)
  if (zodIssue?.code === 'custom') {
    // Handle email validation errors
    if (fieldName === 'teamLeaderEmail') {
      return 'teams.form.errors.emailInvalid'
    }
    // Handle phone validation errors
    if (fieldName === 'teamLeaderPhone') {
      return 'teams.form.errors.phoneNumberInvalid'
    }
  }

  // Handle string too long errors
  if (zodIssue?.code === 'too_big') {
    if (fieldName === 'teamName') {
      return 'teams.form.errors.teamNameTooLong'
    }
    if (fieldName === 'clubName') {
      return 'teams.form.errors.clubNameTooLong'
    }
    if (fieldName === 'teamLeaderName') {
      return 'teams.form.errors.teamLeaderNameTooLong'
    }
  }

  // Default required field translation keys
  const errorKeyMap: Record<string, string> = {
    // Zod field names
    tournamentId: 'teams.form.errors.tournamentRequired',
    clubName: 'teams.form.errors.clubNameRequired',
    teamName: 'teams.form.errors.teamNameRequired',
    division: 'teams.form.errors.divisionRequired',
    category: 'teams.form.errors.categoryRequired',
    teamLeaderName: 'teams.form.errors.teamLeaderNameRequired',
    teamLeaderPhone: 'teams.form.errors.phoneNumberRequired',
    teamLeaderEmail: 'teams.form.errors.emailRequired',
    privacyAgreement: 'teams.form.errors.privacyAgreementRequired',
    // Store field names (for consistency)
    selectedTournamentId: 'teams.form.errors.tournamentRequired',
    selectedDivision: 'teams.form.errors.divisionRequired',
    selectedCategory: 'teams.form.errors.categoryRequired',
  }
  return errorKeyMap[fieldName] || 'teams.form.errors.fieldRequired'
}

// Validate a single field and return translation key if any
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
      const fieldError = result.error.issues.find((error: z.ZodIssue) => {
        const path = error.path[0]
        return path === zodFieldName
      })

      if (fieldError) {
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

// Validate entire form and return all translation keys
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
      result.error.issues.forEach((error: z.ZodIssue) => {
        const zodFieldName = error.path[0] as string
        if (zodFieldName) {
          // Store field names are now the same as Zod field names
          errors[zodFieldName] = getFieldErrorTranslationKey(zodFieldName, error)
        }
      })
    }
  } catch (_error: unknown) {
    // Validation error occurred, returning empty errors object
  }

  return errors
}

// ===== TOURNAMENT VALIDATION UTILITIES =====

// Map tournament field names to translation keys
export const getTournamentFieldErrorTranslationKey = (
  fieldName: string,
  zodIssue?: Pick<z.ZodIssue, 'code'>
): string => {
  // Handle string too long errors
  if (zodIssue?.code === 'too_big') {
    if (fieldName === 'name') {
      return 'tournaments.form.errors.nameTooLong'
    }
    if (fieldName === 'location') {
      return 'tournaments.form.errors.locationTooLong'
    }
  }

  // Default required field translation keys
  const errorKeyMap: Record<string, string> = {
    name: 'tournaments.form.errors.nameRequired',
    location: 'tournaments.form.errors.locationRequired',
    startDate: 'tournaments.form.errors.startDateRequired',
    endDate: 'tournaments.form.errors.endDateRequired',
    divisions: 'tournaments.form.errors.divisionsRequired',
    categories: 'tournaments.form.errors.categoriesRequired',
  }
  return errorKeyMap[fieldName] || 'tournaments.form.errors.fieldRequired'
}

// Validate a single tournament field and return translation key if any
export const validateSingleTournamentField = (
  fieldName: string,
  formData: TournamentFormData,
  mode: 'create' | 'edit'
): string | null => {
  try {
    const result = validateTournamentData(formData, mode)

    if (!result.success) {
      // Find the error for this specific field
      const fieldError = result.error.issues.find((error: z.ZodIssue) => {
        const path = error.path[0]
        return path === fieldName
      })

      if (fieldError) {
        return getTournamentFieldErrorTranslationKey(fieldName, fieldError)
      }
    }

    return null
  } catch (_error: unknown) {
    // Fallback validation for basic empty field check
    const fieldValue = formData[fieldName as keyof TournamentFormData]
    if (Array.isArray(fieldValue)) {
      return fieldValue.length === 0
        ? getTournamentFieldErrorTranslationKey(fieldName)
        : null
    }
    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      return getTournamentFieldErrorTranslationKey(fieldName)
    }
    return null
  }
}

// Validate entire tournament form and return all translation keys
export const validateEntireTournamentForm = (
  formData: TournamentFormData,
  mode: 'create' | 'edit'
): Record<string, string> => {
  const errors: Record<string, string> = {}

  try {
    const result = validateTournamentData(formData, mode)

    if (!result.success) {
      result.error.issues.forEach((error: z.ZodIssue) => {
        const fieldName = error.path[0] as string
        if (fieldName) {
          errors[fieldName] = getTournamentFieldErrorTranslationKey(fieldName, error)
        }
      })
    }
  } catch (_error: unknown) {
    // Validation error occurred, returning empty errors object
  }

  return errors
}
