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
      return 'messages.validation.emailInvalid'
    }
    // Handle phone validation errors
    if (fieldName === 'teamLeaderPhone') {
      return 'messages.validation.phoneNumberInvalid'
    }
  }

  // Handle string too long errors
  if (zodIssue?.code === 'too_big') {
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
      return 'messages.tournament.nameTooLong'
    }
    if (fieldName === 'location') {
      return 'messages.tournament.locationTooLong'
    }
  }

  // Default required field translation keys
  const errorKeyMap: Record<string, string> = {
    name: 'messages.tournament.nameRequired',
    location: 'messages.tournament.locationRequired',
    startDate: 'messages.tournament.startDateRequired',
    endDate: 'messages.tournament.endDateRequired',
    divisions: 'messages.tournament.divisionsRequired',
    categories: 'messages.tournament.categoriesRequired',
  }
  return errorKeyMap[fieldName] || 'messages.validation.fieldRequired'
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
