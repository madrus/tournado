import type { ZodIssue } from 'zod'
import type { TournamentFormData } from '~/features/tournaments/validation'
import { validateTournamentData } from '~/features/tournaments/validation'

// ===== TOURNAMENT VALIDATION UTILITIES =====

// Map tournament field names to translation keys
export const getTournamentFieldErrorTranslationKey = (
  fieldName: string,
  zodIssue?: Pick<ZodIssue, 'code'>,
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
  mode: 'create' | 'edit',
): string | null => {
  try {
    const result = validateTournamentData(formData, mode)

    if (!result.success) {
      // Find the error for this specific field
      const fieldError = result.error.issues.find((error: ZodIssue) => {
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
  mode: 'create' | 'edit',
): Record<string, string> => {
  const errors: Record<string, string> = {}

  try {
    const result = validateTournamentData(formData, mode)

    if (!result.success) {
      result.error.issues.forEach((error: ZodIssue) => {
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
