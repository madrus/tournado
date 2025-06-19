import { useEffect } from 'react'

import { create } from 'zustand'
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

import { validateEntireForm, validateSingleField } from '~/lib/lib.form'
import type { TeamFormData, TournamentData } from '~/lib/lib.types'

// Flexible type that can accept data from various sources (forms, APIs, etc.)
// This is more lenient than the strict TeamFormData type used for validation
type FlexibleTeamFormData = {
  // External API field names
  tournamentId?: string
  division?: string
  category?: string
  // Other fields (same names in both)
  clubName?: string
  teamName?: string // More flexible than the strict TeamName type
  teamLeaderName?: string
  teamLeaderPhone?: string
  teamLeaderEmail?: string // More flexible than the strict Email type
  privacyAgreement?: boolean
}

// Grouped form fields
type FormFields = {
  // Tournament selection
  tournamentId: string
  division: string
  category: string
  // Team information
  clubName: string
  teamName: string
  // Team leader information
  teamLeaderName: string
  teamLeaderPhone: string
  teamLeaderEmail: string
  // Agreement
  privacyAgreement: boolean
}

// Validation states grouped by purpose
type ValidationState = {
  errors: Record<string, string>
  displayErrors: Record<string, string>
  touchedFields: Record<string, boolean>
  serverErrors: Record<string, string>
  submitAttempted: boolean
  forceShowAllErrors: boolean
}

// Form metadata grouped
type FormMeta = {
  mode: 'create' | 'edit'
  isSubmitting: boolean
  isValid: boolean
}

// Available options grouped
type AvailableOptions = {
  tournaments: TournamentData[]
  divisions: string[]
  categories: string[]
}

type StoreState = {
  formFields: FormFields
  validation: ValidationState
  formMeta: FormMeta
  availableOptions: AvailableOptions
}

// Field names for type safety
type FormFieldName = keyof FormFields
type ValidationFieldName = keyof ValidationState
type FormMetaFieldName = keyof FormMeta
type AvailableOptionsFieldName = keyof AvailableOptions

type Actions = {
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
  setFieldTouched: (fieldName: string, touched?: boolean) => void
  setFieldError: (fieldName: string, error: string) => void
  clearFieldError: (fieldName: string) => void
  clearAllErrors: () => void
  updateAvailableOptions: () => void

  // Get current form data as TeamFormData
  getFormData: () => TeamFormData

  // Validation helpers - reactive validation system
  validateField: (fieldName: string) => void
  validateForm: () => boolean

  // Helper to merge server errors with validation errors
  mergeDisplayErrors: () => void

  // Server errors setter (used by form submission)
  setServerErrors: (errors: Record<string, string>) => void
}

const storeName = 'TeamFormStore'

const initialFormFields: FormFields = {
  tournamentId: '',
  division: '',
  category: '',
  clubName: '',
  teamName: '',
  teamLeaderName: '',
  teamLeaderPhone: '',
  teamLeaderEmail: '',
  privacyAgreement: false,
}

const initialValidationState: ValidationState = {
  errors: {},
  displayErrors: {},
  touchedFields: {},
  serverErrors: {},
  submitAttempted: false,
  forceShowAllErrors: false,
}

const initialFormMeta: FormMeta = {
  mode: 'create',
  isSubmitting: false,
  isValid: false,
}

const initialAvailableOptions: AvailableOptions = {
  tournaments: [],
  divisions: [],
  categories: [],
}

const initialStoreState: StoreState = {
  formFields: initialFormFields,
  validation: initialValidationState,
  formMeta: initialFormMeta,
  availableOptions: initialAvailableOptions,
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Server-side storage mock for when sessionStorage is not available
const createServerSideStorage = () => ({
  getItem: () => null,
  setItem: () => {
    // Server-side no-op
  },
  removeItem: () => {
    // Server-side no-op
  },
})

export const useTeamFormStore = create<StoreState & Actions>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          ...initialStoreState,

          // Universal form field setter using dynamic property names
          setFormField: (fieldName: FormFieldName, value: string | boolean) => {
            set(
              (state: StoreState) => {
                const newFormFields = {
                  ...state.formFields,
                  [fieldName]: value,
                  // Handle dependent field resets
                  ...(fieldName === 'tournamentId' && { division: '', category: '' }),
                  ...(fieldName === 'division' && { category: '' }),
                }

                return {
                  ...state,
                  formFields: newFormFields,
                }
              },
              false,
              `setFormField/${fieldName}`
            )

            // Handle side effects
            if (fieldName === 'tournamentId') {
              get().updateAvailableOptions()
            }

            // Re-validate touched field
            const state = get()
            if (state.validation.touchedFields[fieldName as string]) {
              state.validateField(fieldName as string)
            }
          },

          // Universal validation field setter
          setValidationField: (
            fieldName: ValidationFieldName,
            value: Record<string, string> | Record<string, boolean> | boolean
          ) => {
            set(
              (state: StoreState) => {
                const newValidation = {
                  ...state.validation,
                  [fieldName]: value,
                }

                return {
                  ...state,
                  validation: newValidation,
                }
              },
              false,
              `setValidationField/${fieldName}`
            )
          },

          // Universal form meta setter
          setFormMetaField: (fieldName: FormMetaFieldName, value: string | boolean) => {
            set(
              (state: StoreState) => {
                const newFormMeta = {
                  ...state.formMeta,
                  [fieldName]: value,
                }

                return {
                  ...state,
                  formMeta: newFormMeta,
                }
              },
              false,
              `setFormMetaField/${fieldName}`
            )
          },

          // Universal available options setter
          setAvailableOptionsField: (
            fieldName: AvailableOptionsFieldName,
            value: TournamentData[] | string[]
          ) => {
            set(
              (state: StoreState) => {
                const newAvailableOptions = {
                  ...state.availableOptions,
                  [fieldName]: value,
                }

                return {
                  ...state,
                  availableOptions: newAvailableOptions,
                }
              },
              false,
              `setAvailableOptionsField/${fieldName}`
            )
          },

          // Helper to get current field value
          getFieldValue: (fieldName: string): string | boolean => {
            const state = get()
            return state.formFields[fieldName as FormFieldName] || ''
          },

          // Bulk form data setters
          setFormData: formData => {
            // Map external field names to internal store field names
            const mappedData: Partial<FormFields> = {}

            // Map tournament field
            if (formData.tournamentId !== undefined) {
              mappedData.tournamentId = formData.tournamentId
            }

            // Map division field
            if (formData.division !== undefined) {
              mappedData.division = formData.division
            }

            // Map category field
            if (formData.category !== undefined) {
              mappedData.category = formData.category
            }

            // Direct mapping for other fields
            if (formData.clubName !== undefined) mappedData.clubName = formData.clubName
            if (formData.teamName !== undefined) mappedData.teamName = formData.teamName
            if (formData.teamLeaderName !== undefined) {
              mappedData.teamLeaderName = formData.teamLeaderName
            }
            if (formData.teamLeaderPhone !== undefined) {
              mappedData.teamLeaderPhone = formData.teamLeaderPhone
            }
            if (formData.teamLeaderEmail !== undefined) {
              mappedData.teamLeaderEmail = formData.teamLeaderEmail
            }
            if (formData.privacyAgreement !== undefined) {
              mappedData.privacyAgreement = formData.privacyAgreement
            }

            // Set all form data at once
            set(
              state => ({
                ...state,
                formFields: { ...state.formFields, ...mappedData },
              }),
              false,
              'setFormData'
            )

            // Update available options if tournament was set
            if (mappedData.tournamentId !== undefined) {
              get().updateAvailableOptions()
            }

            // Clear ALL validation state completely after everything is set
            // This prevents validation errors from showing for valid pre-populated data
            set(
              state => ({
                ...state,
                validation: {
                  ...state.validation,
                  errors: {},
                  displayErrors: {},
                  serverErrors: {},
                  touchedFields: {},
                  submitAttempted: false,
                  forceShowAllErrors: false,
                },
              }),
              false,
              'setFormData/clearValidation'
            )
          },

          resetForm: () => {
            const currentTournaments = get().availableOptions.tournaments
            const resetState = {
              ...initialStoreState,
              availableOptions: {
                ...initialStoreState.availableOptions,
                tournaments: currentTournaments,
              },
            }

            set(resetState, false, 'resetForm')
          },

          // Touch and validation - reactive system
          setFieldTouched: (fieldName, touched = true) => {
            set(
              state => {
                const newTouchedFields = {
                  ...state.validation.touchedFields,
                  [fieldName]: touched,
                }

                return {
                  ...state,
                  validation: {
                    ...state.validation,
                    touchedFields: newTouchedFields,
                  },
                }
              },
              false,
              'setFieldTouched'
            )

            // Reactive validation: when field becomes touched, validate it immediately
            if (touched) {
              get().validateField(fieldName)
            }
          },

          clearFieldError: fieldName => {
            const state = get()
            // Only clear if it's not a server error
            if (!state.validation.serverErrors[fieldName]) {
              set(
                currentState => {
                  const newDisplayErrors = { ...currentState.validation.displayErrors }
                  delete newDisplayErrors[fieldName]
                  return {
                    ...currentState,
                    validation: {
                      ...currentState.validation,
                      displayErrors: newDisplayErrors,
                    },
                  }
                },
                false,
                'clearFieldError'
              )
            }
          },

          // Helper to merge server errors with validation errors
          mergeDisplayErrors: () => {
            const state = get()
            // Server errors take priority over validation errors
            const mergedErrors = {
              ...state.validation.displayErrors,
              ...state.validation.serverErrors,
            }
            set(
              currentState => ({
                ...currentState,
                validation: {
                  ...currentState.validation,
                  displayErrors: mergedErrors,
                },
              }),
              false,
              'mergeDisplayErrors'
            )
          },

          setFieldError: (fieldName, error) => {
            set(
              state => {
                const newDisplayErrors = {
                  ...state.validation.displayErrors,
                  [fieldName]: error,
                }

                return {
                  ...state,
                  validation: {
                    ...state.validation,
                    displayErrors: newDisplayErrors,
                  },
                }
              },
              false,
              'setFieldError'
            )
            // After setting validation error, merge with server errors
            get().mergeDisplayErrors()
          },

          clearAllErrors: () =>
            set(
              state => ({
                ...state,
                validation: {
                  ...state.validation,
                  errors: {},
                  displayErrors: {},
                  serverErrors: {},
                },
              }),
              false,
              'clearAllErrors'
            ),

          // Computed setters (based on selected tournament/division)
          updateAvailableOptions: () => {
            const { availableOptions, formFields } = get()
            const { tournaments } = availableOptions
            const { tournamentId } = formFields

            const selectedTournament = tournaments.find(t => t.id === tournamentId)
            const newDivisions = selectedTournament?.divisions || []
            const newCategories = selectedTournament?.categories || []

            set(
              currentState => ({
                ...currentState,
                availableOptions: {
                  ...currentState.availableOptions,
                  divisions: newDivisions,
                  categories: newCategories,
                },
              }),
              false,
              'updateAvailableOptions'
            )
          },

          // Get current form data as TeamFormData
          getFormData: (): TeamFormData => {
            const { formFields } = get()
            const {
              tournamentId,
              clubName,
              teamName,
              division,
              category,
              teamLeaderName,
              teamLeaderPhone,
              teamLeaderEmail,
              privacyAgreement,
            } = formFields

            return {
              tournamentId,
              clubName,
              teamName: teamName as TeamFormData['teamName'],
              division: division as TeamFormData['division'],
              category,
              teamLeaderName,
              teamLeaderPhone,
              teamLeaderEmail: teamLeaderEmail as TeamFormData['teamLeaderEmail'],
              privacyAgreement,
            }
          },

          // Individual field validation - called reactively when field is touched
          validateField: (fieldName: string) => {
            const state = get()
            const { validation, formMeta } = state
            const { touchedFields, forceShowAllErrors, submitAttempted } = validation
            const { mode } = formMeta

            // Only validate if field is touched OR if we're forcing all errors
            const shouldValidate =
              touchedFields[fieldName] || forceShowAllErrors || submitAttempted

            if (!shouldValidate) {
              return
            }

            // Get current form data for validation
            const formData = state.getFormData()

            // Use the simplified validation function
            const error = validateSingleField(fieldName, formData, mode)

            if (error) {
              state.setFieldError(fieldName, error)
            } else {
              state.clearFieldError(fieldName)
            }
          },

          // Full form validation - called on form submission
          validateForm: (): boolean => {
            const state = get()

            // Force validation for all fields regardless of touched state
            set(
              currentState => ({
                ...currentState,
                validation: {
                  ...currentState.validation,
                  forceShowAllErrors: true,
                },
              }),
              false,
              'validateForm/forceShowErrors'
            )

            const formData = state.getFormData()

            // Use the simplified validation function
            const errors = validateEntireForm(formData, state.formMeta.mode)

            if (Object.keys(errors).length > 0) {
              // Set all errors at once
              set(
                currentState => {
                  const newDisplayErrors = {
                    ...currentState.validation.displayErrors,
                    ...errors,
                  }

                  return {
                    ...currentState,
                    validation: {
                      ...currentState.validation,
                      displayErrors: newDisplayErrors,
                    },
                  }
                },
                false,
                'validateForm/setErrors'
              )
              get().setFormMetaField('isValid', false)
              return false
            }

            // Clear all errors and set valid state if validation passed
            get().clearAllErrors()
            get().setFormMetaField('isValid', true)
            return true
          },

          // Server errors setter (used by form submission)
          setServerErrors: (errors: Record<string, string>) => {
            get().setValidationField('serverErrors', errors)
            // Merge server errors into display errors so they're visible immediately
            get().mergeDisplayErrors()
          },
        }),
        {
          name: 'team-form-storage',
          // Only use sessionStorage if we're in the browser
          storage: isBrowser
            ? createJSONStorage(() => sessionStorage)
            : createJSONStorage(createServerSideStorage),
          // Skip persistence completely on server-side
          skipHydration: !isBrowser,
          // Only persist form data, not validation state
          partialize: state =>
            isBrowser
              ? {
                  formFields: state.formFields,
                  formMeta: { mode: state.formMeta.mode },
                }
              : {},
        }
      )
    ),
    {
      name: storeName,
    }
  )
)

/**
 * Hook to handle team form store rehydration in components
 * Use this in components that need the team form store to be properly hydrated
 */
export const useTeamFormStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      useTeamFormStore.persist.rehydrate()
    }
  }, [])
}

export const subscribeToTouchedFields = (
  handler: (touchedFields: Record<string, boolean>) => void
): (() => void) =>
  useTeamFormStore.subscribe(state => state.validation.touchedFields, handler)
