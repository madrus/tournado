import type { TeamFormData, TournamentData } from '~/lib/lib.types'

/**
 * Grouped form fields for store state management
 */
export type FormFields = {
  // Tournament selection
  tournamentId: string
  division: string
  category: string
  // Team information
  clubName: string
  name: string
  // Team leader information
  teamLeaderName: string
  teamLeaderPhone: string
  teamLeaderEmail: string
  // Agreement
  privacyAgreement: boolean
}

// Flexible type that can accept data from various sources (forms, APIs, etc.)
// This is more lenient than the strict TeamFormData type used for validation
export type FlexibleTeamFormData = {
  // External API field names
  tournamentId?: string
  division?: string
  category?: string
  // Other fields (same names in both)
  clubName?: string
  name?: string // More flexible than the strict TeamName type
  teamLeaderName?: string
  teamLeaderPhone?: string
  teamLeaderEmail?: string // More flexible than the strict Email type
  privacyAgreement?: boolean
}

// Validation states grouped by purpose
export type ValidationState = {
  errors: Record<string, string>
  displayErrors: Record<string, string>
  blurredFields: Record<string, boolean>
  serverErrors: Record<string, string>
  submitAttempted: boolean
  forceShowAllErrors: boolean
}

// Form metadata grouped
export type FormMeta = {
  mode: 'create' | 'edit'
  isSubmitting: boolean
  isValid: boolean
}

// Available options grouped
export type AvailableOptions = {
  tournaments: TournamentData[]
  divisions: string[]
  categories: string[]
}

export type StoreState = {
  formFields: FormFields
  oldFormFields: FormFields
  validation: ValidationState
  formMeta: FormMeta
  availableOptions: AvailableOptions
}

// Field names for type safety
export type FormFieldName = keyof FormFields
export type ValidationFieldName = keyof ValidationState
export type FormMetaFieldName = keyof FormMeta
export type AvailableOptionsFieldName = keyof AvailableOptions

export type Actions = {
  // Universal field setter using dynamic property names
  setFormField: (fieldName: FormFieldName, value: string | boolean) => void
  setValidationField: (
    fieldName: ValidationFieldName,
    value: Record<string, string> | Record<string, boolean> | boolean
  ) => void
  setFormMetaField: (fieldName: FormMetaFieldName, value: string | boolean) => void
  setAvailableOptionsField: (
    fieldName: AvailableOptionsFieldName,
    value: TournamentData[] | string[]
  ) => void

  // Convenience methods for common operations
  setFormData: (formData: Partial<FlexibleTeamFormData>) => void
  resetForm: () => void
  setFieldBlurred: (fieldName: string, blurred?: boolean) => void
  setFieldError: (fieldName: string, error: string) => void
  clearFieldError: (fieldName: string) => void
  clearAllErrors: () => void
  updateAvailableOptions: () => void
  resetStoreState: () => void

  // Get current form data as TeamFormData
  getFormData: () => TeamFormData

  // Validation helpers - reactive validation system
  validateField: (fieldName: string) => void
  validateFieldOnBlur: (fieldName: string) => void
  validateForm: () => boolean

  // Helper to merge server errors with validation errors
  mergeDisplayErrors: () => void

  // Server errors setter (used by form submission)
  setServerErrors: (errors: Record<string, string>) => void

  // Panel validity selectors
  isPanelValid: (panelNumber: 1 | 2 | 3 | 4) => boolean
  isPanelEnabled: (panelNumber: 1 | 2 | 3 | 4) => boolean

  // Form submission readiness
  isFormReadyForSubmission: () => boolean

  // Form state helpers
  isDirty: () => boolean
}
