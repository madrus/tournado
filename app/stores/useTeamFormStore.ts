import { useEffect } from 'react'

import { create } from 'zustand'
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

import type { FormFields, TeamFormData, TournamentData } from '~/lib/lib.types'
import { validateEntireForm, validateSingleField } from '~/utils/form-validation'

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

// Validation states grouped by purpose
type ValidationState = {
  errors: Record<string, string>
  displayErrors: Record<string, string>
  blurredFields: Record<string, boolean>
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
  initialFormFields: FormFields
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
  blurredFields: {},
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
  initialFormFields,
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
          resetStoreState: () => {
            set(initialStoreState, false, 'resetStoreState')
          },

          // ===== SETTERS =====

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

            // When a user types, immediately clear any existing error for that field.
            // Validation will be re-triggered on blur.
            get().clearFieldError(fieldName)
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

            // Set all form data at once, and capture the initial state
            set(
              state => {
                const newFormFields = { ...state.formFields, ...mappedData }
                return {
                  ...state,
                  formFields: newFormFields,
                  initialFormFields: newFormFields,
                }
              },
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
                  blurredFields: {},
                  submitAttempted: false,
                  forceShowAllErrors: false,
                },
              }),
              false,
              'setFormData/clearValidation'
            )
          },

          resetForm: () => {
            set({
              ...initialStoreState,
              // Keep available tournaments populated
              availableOptions: {
                ...initialAvailableOptions,
                tournaments: get().availableOptions.tournaments,
              },
            })
            // Clear the persisted state from session storage to prevent rehydration
            useTeamFormStore.persist.clearStorage()
          },

          // Blur tracking - reactive system
          setFieldBlurred: (fieldName, blurred = true) => {
            set(
              state => {
                const newBlurredFields = {
                  ...state.validation.blurredFields,
                  [fieldName]: blurred,
                }

                return {
                  ...state,
                  validation: {
                    ...state.validation,
                    blurredFields: newBlurredFields,
                  },
                }
              },
              false,
              'setFieldBlurred'
            )

            // Automatically trigger validation when field becomes blurred
            if (blurred) {
              get().validateField(fieldName)
            }
          },

          // Validate field on blur - also marks field as blurred
          validateFieldOnBlur: (fieldName: string) => {
            const state = get()
            const { formMeta, formFields, validation } = state
            const { mode } = formMeta
            const { blurredFields, displayErrors } = validation

            // Mark field as blurred first (without triggering validation)
            set(
              currentState => {
                const newBlurredFields = {
                  ...currentState.validation.blurredFields,
                  [fieldName]: true,
                }

                return {
                  ...currentState,
                  validation: {
                    ...currentState.validation,
                    blurredFields: newBlurredFields,
                  },
                }
              },
              false,
              'validateFieldOnBlur/setBlurred'
            )

            // Get current form data for validation
            const formData = state.getFormData()

            // Use the simplified validation function
            const error = validateSingleField(fieldName, formData, mode)

            if (error) {
              state.setFieldError(fieldName, error)
            } else {
              state.clearFieldError(fieldName)
            }

            // Check if this blur event should enable the next panel
            // Determine which panel this field belongs to
            const panelFieldMap = {
              1: ['tournamentId', 'division', 'category'],
              2: ['clubName', 'teamName'],
              3: ['teamLeaderName', 'teamLeaderPhone', 'teamLeaderEmail'],
              4: ['privacyAgreement'],
            }

            // Find which panel this field belongs to
            let currentPanel = 0
            for (const [panel, fields] of Object.entries(panelFieldMap)) {
              if (fields.includes(fieldName)) {
                currentPanel = parseInt(panel, 10)
                break
              }
            }

            // Check if all fields in this panel are now blurred and valid
            if (currentPanel > 0) {
              const panelFields =
                panelFieldMap[currentPanel as keyof typeof panelFieldMap]
              const allFieldsBlurred = panelFields.every(field => blurredFields[field])
              const allFieldsValid = panelFields.every(field => {
                const fieldValue = formFields[field as keyof typeof formFields]
                return !!fieldValue && !displayErrors[field]
              })

              // If all fields in this panel are blurred and valid, the panel is complete
              // This will automatically enable the next panel via isPanelValid
              if (allFieldsBlurred && allFieldsValid) {
                // Panel is now complete - next panel will be enabled by isPanelValid
                // No additional action needed - the UI will re-render automatically
              }
            }
          },

          clearFieldError: fieldName => {
            set(
              state => {
                const { errors, displayErrors, serverErrors } = state.validation
                const newErrors = { ...errors }
                const newDisplayErrors = { ...displayErrors }
                const newServerErrors = { ...serverErrors }

                delete newErrors[fieldName]
                delete newDisplayErrors[fieldName]
                delete newServerErrors[fieldName]

                return {
                  ...state,
                  validation: {
                    ...state.validation,
                    errors: newErrors,
                    displayErrors: newDisplayErrors,
                    serverErrors: newServerErrors,
                  },
                }
              },
              false,
              'clearFieldError'
            )
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

          // Server errors setter (used by form submission)
          setServerErrors: (errors: Record<string, string>) => {
            get().setValidationField('serverErrors', errors)
            // Merge server errors into display errors so they're visible immediately
            get().mergeDisplayErrors()
          },

          // ===== GETTERS =====

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

          // --- Panel Validity Selectors ---
          isPanelValid: (panelNumber: 1 | 2 | 3 | 4): boolean => {
            const { formFields, validation, formMeta } = get()
            const { displayErrors } = validation
            const { mode } = formMeta

            // Panel field mapping
            const panelFieldMap = {
              1: ['tournamentId', 'division', 'category'],
              2: ['clubName', 'teamName'],
              3: ['teamLeaderName', 'teamLeaderPhone', 'teamLeaderEmail'],
              4: ['privacyAgreement'],
            }

            // Check if the specified panel itself is complete
            const panelFields = panelFieldMap[panelNumber]
            if (!panelFields) return false

            // HYBRID VALIDATION APPROACH:
            // Panel enabling: Based on field values and validity (no blur requirement)
            // Error display: Still requires blur (handled in validateField function)
            // This gives users immediate feedback when panels become available
            // while maintaining good UX for error messaging

            // In edit mode, only check if field values are present (ignore display errors)
            // since the data comes from the database and should be valid
            if (mode === 'edit') {
              return panelFields.every(field => {
                const fieldValue = formFields[field as keyof typeof formFields]
                return !!fieldValue
              })
            }

            // In create mode, check both field values and display errors
            return panelFields.every(field => {
              const fieldValue = formFields[field as keyof typeof formFields]
              return !!fieldValue && !displayErrors[field]
            })
          },

          // Panel enablement - determines if a panel should be interactive
          isPanelEnabled: (panelNumber: 1 | 2 | 3 | 4): boolean => {
            const { formMeta } = get()
            const { mode } = formMeta

            // In edit mode, all panels are enabled since data is pre-populated
            if (mode === 'edit') {
              return true
            }

            // In create mode, use progressive enabling logic
            switch (panelNumber) {
              case 1:
                // Panel 1 is always enabled (first panel)
                return true
              case 2:
                // Panel 2 enables when panel 1 is complete
                return get().isPanelValid(1)
              case 3:
                // Panel 3 enables when panel 2 is complete
                return get().isPanelValid(2)
              case 4:
                // Panel 4 enables when panel 3 is complete
                return get().isPanelValid(3)
              default:
                return false
            }
          },

          // Form submission readiness - determines if Save button should be enabled
          isFormReadyForSubmission: (): boolean => {
            const { formMeta } = get()
            const { mode } = formMeta

            // For create mode, check all 4 panels
            if (mode === 'create') {
              const isPanel1Valid = get().isPanelValid(1)
              const isPanel2Valid = get().isPanelValid(2)
              const isPanel3Valid = get().isPanelValid(3)
              const isPanel4Valid = get().isPanelValid(4)

              return isPanel1Valid && isPanel2Valid && isPanel3Valid && isPanel4Valid
            }

            // For edit mode, check panels 1-3 (no privacy panel)
            if (mode === 'edit') {
              const isPanel1Valid = get().isPanelValid(1)
              const isPanel2Valid = get().isPanelValid(2)
              const isPanel3Valid = get().isPanelValid(3)

              return isPanel1Valid && isPanel2Valid && isPanel3Valid
            }

            return false
          },

          // Individual field validation - called reactively when field is touched
          validateField: (fieldName: string) => {
            const state = get()
            const { validation, formMeta } = state
            const { blurredFields, forceShowAllErrors, submitAttempted } = validation
            const { mode } = formMeta

            // Only validate if field is blurred OR if we're forcing all errors
            const shouldValidate =
              blurredFields[fieldName] || forceShowAllErrors || submitAttempted

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
                  submitAttempted: true,
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
          // Exclude privacyAgreement since it should always start fresh for new teams
          partialize: state =>
            isBrowser
              ? {
                  formFields: {
                    tournamentId: state.formFields.tournamentId,
                    division: state.formFields.division,
                    category: state.formFields.category,
                    clubName: state.formFields.clubName,
                    teamName: state.formFields.teamName,
                    teamLeaderName: state.formFields.teamLeaderName,
                    teamLeaderPhone: state.formFields.teamLeaderPhone,
                    teamLeaderEmail: state.formFields.teamLeaderEmail,
                    // Explicitly exclude privacyAgreement from persistence
                  },
                  initialFormFields: state.initialFormFields, // Persist initial state
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

export const subscribeToBlurredFields = (
  handler: (blurredFields: Record<string, boolean>) => void
): (() => void) =>
  useTeamFormStore.subscribe(state => state.validation.blurredFields, handler)
