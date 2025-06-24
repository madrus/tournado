import { useEffect } from 'react'

import { create } from 'zustand'
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

import { isBrowser } from '~/lib/lib.helpers'

import { initialStoreState } from './helpers/tournamentFormConstants'
import {
  isFormDirty,
  isPanelEnabled,
  isPanelValid,
  mapFlexibleToFormData,
  mergeErrors,
} from './helpers/tournamentFormHelpers'
import type {
  AvailableOptions,
  AvailableOptionsFieldName,
  FlexibleTournamentFormData,
  FormFieldName,
  FormFields,
  FormMeta,
  FormMetaFieldName,
  ValidationFieldName,
  ValidationState,
} from './helpers/tournamentFormTypes'

// Simple validation functions for tournament form
const validateTournamentField = (
  fieldName: string,
  value: string | string[]
): string | null => {
  if (Array.isArray(value)) {
    return value.length === 0 ? `${fieldName} is required` : null
  }
  return !value || value.trim() === '' ? `${fieldName} is required` : null
}

const validateTournamentForm = (
  formFields: FormFields
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  // Check all required fields
  Object.entries(formFields).forEach(([fieldName, value]) => {
    const error = validateTournamentField(fieldName, value)
    if (error) {
      errors[fieldName] = error
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

type StoreState = {
  formFields: FormFields
  oldFormFields: FormFields
  validation: ValidationState
  formMeta: FormMeta
  availableOptions: AvailableOptions
}

type Actions = {
  // Universal field setter using dynamic property names
  setFormField: (fieldName: FormFieldName, value: string | string[]) => void
  setValidationField: (
    fieldName: ValidationFieldName,
    value: Record<string, string> | Record<string, boolean> | boolean
  ) => void
  setFormMetaField: (fieldName: FormMetaFieldName, value: string | boolean) => void
  setAvailableOptionsField: (
    fieldName: AvailableOptionsFieldName,
    value: string[]
  ) => void

  // Convenience methods for common operations
  setFormData: (formData: Partial<FlexibleTournamentFormData>) => void
  resetForm: () => void
  setFieldBlurred: (fieldName: string, blurred?: boolean) => void
  setFieldError: (fieldName: string, error: string) => void
  clearFieldError: (fieldName: string) => void
  clearAllErrors: () => void
  resetStoreState: () => void

  // Get current form data
  getFormData: () => FormFields

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

const storeName = 'TournamentFormStore'

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

export const useTournamentFormStore = create<StoreState & Actions>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          ...initialStoreState,
          resetStoreState: () => {
            set(initialStoreState, false, 'resetStoreState')
          },

          // ===== SETTERS =====

          // Universal field setter using dynamic property names
          setFormField: (fieldName: FormFieldName, value: string | string[]) => {
            set(
              (state: StoreState) => {
                const newFormFields = {
                  ...state.formFields,
                  [fieldName]: value,
                }

                return {
                  ...state,
                  formFields: newFormFields,
                }
              },
              false,
              `setFormField/${fieldName}`
            )

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
            value: string[]
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

          setFormData: (formData: Partial<FlexibleTournamentFormData>) => {
            const mappedData = mapFlexibleToFormData(formData)
            set(
              (state: StoreState) => ({
                ...state,
                formFields: {
                  ...state.formFields,
                  ...mappedData,
                },
              }),
              false,
              'setFormData'
            )
          },

          resetForm: () => {
            set(
              (state: StoreState) => ({
                ...state,
                formFields: {
                  name: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  divisions: [],
                  categories: [],
                },
                validation: {
                  ...state.validation,
                  errors: {},
                  displayErrors: {},
                  blurredFields: {},
                  serverErrors: {},
                  submitAttempted: false,
                  forceShowAllErrors: false,
                },
              }),
              false,
              'resetForm'
            )
          },

          setFieldBlurred: (fieldName: string, blurred = true) => {
            set(
              (state: StoreState) => ({
                ...state,
                validation: {
                  ...state.validation,
                  blurredFields: {
                    ...state.validation.blurredFields,
                    [fieldName]: blurred,
                  },
                },
              }),
              false,
              `setFieldBlurred/${fieldName}`
            )
          },

          setFieldError: (fieldName: string, error: string) => {
            set(
              (state: StoreState) => ({
                ...state,
                validation: {
                  ...state.validation,
                  displayErrors: {
                    ...state.validation.displayErrors,
                    [fieldName]: error,
                  },
                },
              }),
              false,
              `setFieldError/${fieldName}`
            )
          },

          clearFieldError: (fieldName: string) => {
            set(
              (state: StoreState) => {
                const newDisplayErrors = { ...state.validation.displayErrors }
                delete newDisplayErrors[fieldName]
                const newServerErrors = { ...state.validation.serverErrors }
                delete newServerErrors[fieldName]

                return {
                  ...state,
                  validation: {
                    ...state.validation,
                    displayErrors: newDisplayErrors,
                    serverErrors: newServerErrors,
                  },
                }
              },
              false,
              `clearFieldError/${fieldName}`
            )
          },

          clearAllErrors: () => {
            set(
              (state: StoreState) => ({
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
            )
          },

          // ===== GETTERS =====

          getFormData: () => {
            const state = get()
            return state.formFields
          },

          // ===== VALIDATION =====

          validateField: (fieldName: string) => {
            const state = get()
            const fieldValue = state.formFields[fieldName as keyof FormFields]
            const error = validateTournamentField(fieldName, fieldValue)

            if (!error) {
              get().clearFieldError(fieldName)
            } else {
              get().setFieldError(fieldName, error)
            }
          },

          validateFieldOnBlur: (fieldName: string) => {
            get().setFieldBlurred(fieldName, true)
            get().validateField(fieldName)
          },

          validateForm: () => {
            const state = get()
            const validationResult = validateTournamentForm(state.formFields)

            set(
              (currentState: StoreState) => ({
                ...currentState,
                validation: {
                  ...currentState.validation,
                  displayErrors: validationResult.errors,
                  forceShowAllErrors: !validationResult.isValid,
                  submitAttempted: true,
                },
              }),
              false,
              'validateForm'
            )

            return validationResult.isValid
          },

          // ===== SERVER ERRORS =====

          setServerErrors: (errors: Record<string, string>) => {
            set(
              (state: StoreState) => ({
                ...state,
                validation: {
                  ...state.validation,
                  serverErrors: errors,
                  displayErrors: mergeErrors(state.validation.displayErrors, errors),
                },
              }),
              false,
              'setServerErrors'
            )
          },

          // ===== PANEL VALIDITY =====

          isPanelValid: (panelNumber: 1 | 2 | 3 | 4) => {
            const state = get()
            return isPanelValid(
              panelNumber,
              state.formFields,
              state.validation.displayErrors,
              state.formMeta.mode
            )
          },

          isPanelEnabled: (panelNumber: 1 | 2 | 3 | 4) => {
            const state = get()
            return isPanelEnabled(panelNumber, state.formMeta.mode, get().isPanelValid)
          },

          // ===== FORM STATE =====

          isFormReadyForSubmission: () => {
            const state = get()
            const allPanelsValid = [1, 2, 3, 4].every(panel =>
              get().isPanelValid(panel as 1 | 2 | 3 | 4)
            )
            const noErrors =
              Object.keys(
                mergeErrors(
                  state.validation.displayErrors,
                  state.validation.serverErrors
                )
              ).length === 0

            return allPanelsValid && noErrors
          },

          isDirty: () => {
            const state = get()
            return isFormDirty(state.formFields, state.oldFormFields)
          },
        }),
        {
          name: storeName,
          storage: createJSONStorage(() =>
            isBrowser ? sessionStorage : createServerSideStorage()
          ),
          partialize: (state: StoreState & Actions) => ({
            formFields: state.formFields,
            validation: state.validation,
            formMeta: state.formMeta,
          }),
        }
      )
    ),
    { name: storeName }
  )
)

/**
 * Hook to handle client-side hydration of the tournament form store.
 * This ensures the store is properly initialized when the component mounts.
 */
export const useTournamentFormStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      // Force hydration by accessing the store
      useTournamentFormStore.getState()
    }
  }, [])
}

export const subscribeToBlurredFields = (
  handler: (blurredFields: Record<string, boolean>) => void
): (() => void) =>
  useTournamentFormStore.subscribe(state => state.validation.blurredFields, handler)
