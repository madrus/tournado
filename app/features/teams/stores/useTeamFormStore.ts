import { useEffect } from 'react'

import { create } from 'zustand'
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

import type { TeamFormData } from '~/features/teams/types'
import {
  validateEntireTeamForm,
  validateSingleTeamField,
} from '~/features/teams/validation'
import type { TournamentData } from '~/features/tournaments/types'
import { isBrowser } from '~/lib/lib.helpers'

import { initialStoreState, TEAM_PANELS_FIELD_MAP } from './helpers/teamFormConstants'
import {
  computeAvailableOptions,
  getDependentFieldResets,
  getPanelNumberForField,
  isFormDirty,
  isPanelEnabled,
  isPanelValid,
  mapFlexibleToFormData,
  mergeErrors,
  resetStatePreserving,
  shouldValidateField,
} from './helpers/teamFormHelpers'
import type {
  AvailableOptions,
  AvailableOptionsFieldName,
  FlexibleTeamFormData,
  FormFieldName,
  FormFields,
  FormMeta,
  FormMetaFieldName,
  ValidationFieldName,
  ValidationState,
} from './helpers/teamFormTypes'

type StoreState = {
  formFields: FormFields
  oldFormFields: FormFields
  validation: ValidationState
  formMeta: FormMeta
  availableOptions: AvailableOptions
}

type Actions = {
  setAvailableOptionsField: (
    fieldName: AvailableOptionsFieldName,
    value: TournamentData[] | string[]
  ) => void
  // Universal field setter using dynamic property names
  setFormField: (fieldName: FormFieldName, value: string | boolean) => void
  setFormMetaField: (fieldName: FormMetaFieldName, value: string | boolean) => void
  setValidationField: (
    fieldName: ValidationFieldName,
    value: Record<string, string> | Record<string, boolean> | boolean
  ) => void

  // Convenience methods for common operations
  clearAllErrors: () => void
  clearFieldError: (fieldName: string) => void
  clearSessionStorage: () => void
  resetForm: () => void
  resetStoreState: () => void
  setFieldBlurred: (fieldName: string, blurred?: boolean) => void
  setFieldError: (fieldName: string, error: string) => void
  setFormData: (formData: Partial<FlexibleTeamFormData>) => void
  updateAvailableOptions: () => void

  // Get current form data as TeamFormData
  getFormData: () => TeamFormData

  // Validation helpers - reactive validation system
  validateField: (fieldName: string) => void
  validateFieldOnBlur: (fieldName: string) => void
  validateForm: () => boolean

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

const storeName = 'TeamFormStore'

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
            get().clearSessionStorage()
          },

          clearSessionStorage: () => {
            useTeamFormStore.persist.clearStorage()
          },

          // ===== SETTERS =====

          // Universal field setter using dynamic property names
          setFormField: (fieldName: FormFieldName, value: string | boolean) => {
            set(
              (state: StoreState) => {
                const newFormFields = {
                  ...state.formFields,
                  [fieldName]: value,
                  ...getDependentFieldResets(fieldName),
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

          // ===== CONVENIENCE METHODS =====

          setFormData: formData => {
            const mappedData = mapFlexibleToFormData(formData)
            set(
              state => {
                const newFormFields = { ...state.formFields, ...mappedData }
                return {
                  ...state,
                  formFields: newFormFields,
                  oldFormFields: newFormFields,
                }
              },
              false,
              'setFormData'
            )
            if (mappedData.tournamentId !== undefined) {
              get().updateAvailableOptions()
            }
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
            set(resetStatePreserving(['availableOptions'], get))
            // Clear the persisted state from session storage to prevent rehydration
            get().clearSessionStorage()
          },

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

          setFieldError: (fieldName, error) => {
            set(
              state => {
                const newDisplayErrors = {
                  ...state.validation.displayErrors,
                  [fieldName]: error,
                }
                // Merge with server errors
                const mergedErrors = mergeErrors(
                  newDisplayErrors,
                  state.validation.serverErrors
                )
                return {
                  ...state,
                  validation: {
                    ...state.validation,
                    displayErrors: mergedErrors,
                  },
                }
              },
              false,
              'setFieldError'
            )
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

          updateAvailableOptions: () => {
            const { availableOptions, formFields } = get()
            const { tournaments } = availableOptions
            const { tournamentId } = formFields
            const { divisions, categories } = computeAvailableOptions(
              tournaments,
              tournamentId
            )
            set(
              currentState => ({
                ...currentState,
                availableOptions: {
                  ...currentState.availableOptions,
                  divisions,
                  categories,
                },
              }),
              false,
              'updateAvailableOptions'
            )
          },

          // ===== GETTERS =====

          // Get current form data as TeamFormData
          getFormData: (): TeamFormData => {
            const { formFields } = get()
            const {
              tournamentId,
              clubName,
              name,
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
              name: name as TeamFormData['name'],
              division: division as TeamFormData['division'],
              category,
              teamLeaderName,
              teamLeaderPhone,
              teamLeaderEmail: teamLeaderEmail as TeamFormData['teamLeaderEmail'],
              privacyAgreement,
            }
          },

          // ===== VALIDATION =====

          // Individual field validation - called reactively when field is touched
          validateField: (fieldName: string) => {
            const state = get()
            const { validation, formMeta } = state
            const { mode } = formMeta
            // Only validate if field is blurred OR if we're forcing all errors
            const shouldValidate = shouldValidateField(
              fieldName as FormFieldName,
              validation
            )
            if (!shouldValidate) {
              return
            }
            // Get current form data for validation
            const formData = state.getFormData()
            // Use the simplified validation function
            const error = validateSingleTeamField(fieldName, formData, mode)
            if (error) {
              state.setFieldError(fieldName as FormFieldName, error)
            } else {
              state.clearFieldError(fieldName as FormFieldName)
            }
          },

          // Validate field on blur - also marks field as blurred
          validateFieldOnBlur: (fieldName: string) => {
            const state = get()
            const { formMeta, validation } = state
            const { mode } = formMeta
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
            const error = validateSingleTeamField(fieldName, formData, mode)

            // Check if there's a server error for this field
            const serverError = validation.serverErrors[fieldName]

            if (error) {
              // Client-side validation failed - show client error
              state.setFieldError(fieldName as FormFieldName, error)
            } else if (serverError) {
              // No client-side error, but there's a server error
              // Only clear server error if field has valid content
              const fieldValue = formData[fieldName as keyof typeof formData]
              const hasValidContent =
                fieldValue &&
                (typeof fieldValue === 'string' ? fieldValue.trim() !== '' : true)

              if (hasValidContent) {
                // Field has content and passes client validation - clear server error
                state.clearFieldError(fieldName as FormFieldName)
              } else {
                // Field is empty - keep server error visible
                state.setFieldError(fieldName as FormFieldName, serverError)
              }
            } else {
              // No client error and no server error - clear any existing error
              state.clearFieldError(fieldName as FormFieldName)
            }
            // Check if this blur event should enable the next panel
            // Find which panel this field belongs to
            const currentPanel = getPanelNumberForField(fieldName as keyof FormFields)
            // Check if all fields in this panel are now blurred and valid
            if (currentPanel > 0) {
              const panelFields =
                TEAM_PANELS_FIELD_MAP[
                  currentPanel as keyof typeof TEAM_PANELS_FIELD_MAP
                ]
              const allFieldsBlurred = panelFields.every(
                field => validation.blurredFields[field]
              )
              const allFieldsValid = panelFields.every(field => {
                const fieldValue =
                  state.formFields[field as keyof typeof state.formFields]
                return !!fieldValue && !validation.displayErrors[field]
              })
              if (allFieldsBlurred && allFieldsValid) {
                // Panel is now complete - next panel will be enabled by isPanelValid
                // No additional action needed - the UI will re-render automatically
              }
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
            const errors = validateEntireTeamForm(formData, state.formMeta.mode)

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

          // ===== SERVER ERRORS =====

          // Server errors setter (used by form submission)
          setServerErrors: (errors: Record<string, string>) => {
            get().setValidationField('serverErrors', errors)
            // Merge server errors into display errors so they're visible immediately
            const state = get()
            const mergedErrors = mergeErrors(state.validation.displayErrors, errors)
            set(
              currentState => ({
                ...currentState,
                validation: {
                  ...currentState.validation,
                  displayErrors: mergedErrors,
                },
              }),
              false,
              'setServerErrors/mergeErrors'
            )
          },

          // ===== PANEL VALIDITY =====

          // --- Panel Validity Selectors ---
          isPanelValid: (panelNumber: 1 | 2 | 3 | 4): boolean => {
            const { formFields, validation, formMeta } = get()
            return isPanelValid(
              panelNumber,
              formFields,
              validation.displayErrors,
              formMeta.mode
            )
          },

          // Panel enablement - determines if a panel should be interactive
          isPanelEnabled: (panelNumber: 1 | 2 | 3 | 4): boolean => {
            const { formMeta } = get()
            return isPanelEnabled(panelNumber, formMeta.mode, panel =>
              get().isPanelValid(panel)
            )
          },

          // ===== FORM STATE =====

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

          // Form state helpers - determines if form has been modified
          isDirty: (): boolean => {
            const { formFields, oldFormFields } = get()
            return isFormDirty(formFields, oldFormFields)
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
                    name: state.formFields.name,
                    teamLeaderName: state.formFields.teamLeaderName,
                    teamLeaderPhone: state.formFields.teamLeaderPhone,
                    teamLeaderEmail: state.formFields.teamLeaderEmail,
                    // Explicitly exclude privacyAgreement from persistence
                  },
                  oldFormFields: state.oldFormFields, // Persist initial state
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
