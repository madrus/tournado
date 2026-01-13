import { useEffect } from 'react'
import { create } from 'zustand'
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { TournamentFormData } from '~/features/tournaments/validation'
import { isBrowser } from '~/lib/lib.helpers'
import {
  validateEntireTournamentForm,
  validateSingleTournamentField,
} from '~/utils/formValidation'
import {
  TOURNAMENT_PANELS_FIELD_MAP,
  initialStoreState,
} from './helpers/tournamentFormConstants'
import {
  getIsFormReadyForSubmission,
  getPanelNumberForField,
  isFormDirty,
  isPanelEnabled,
  isPanelValid,
  mapFlexibleToFormData,
  mergeErrors,
  resetStatePreserving,
  shouldValidateField,
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
    value: Record<string, string> | Record<string, boolean> | boolean,
  ) => void
  setFormMetaField: (fieldName: FormMetaFieldName, value: string | boolean) => void
  setAvailableOptionsField: (
    fieldName: AvailableOptionsFieldName,
    value: string[],
  ) => void

  // Convenience methods for common operations
  clearAllErrors: () => void
  clearFieldError: (fieldName: string) => void
  clearSessionStorage: () => void
  resetForm: () => void
  resetStoreState: () => void
  setFieldBlurred: (fieldName: string, blurred?: boolean) => void
  setFieldError: (fieldName: string, error: string) => void
  setFormData: (formData: Partial<FlexibleTournamentFormData>) => void
  updateAvailableOptions: () => void

  // Get current form data
  getFormData: () => TournamentFormData

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
  isFormDirty: () => boolean
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
            get().clearSessionStorage()
          },

          clearSessionStorage: () => {
            useTournamentFormStore.persist.clearStorage()
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

                // Auto-fill/correct endDate when startDate changes
                if (fieldName === 'startDate' && typeof value === 'string') {
                  const currentEndDate = state.formFields.endDate

                  // If endDate is empty or startDate is later than endDate, update endDate to match startDate
                  if (
                    !currentEndDate ||
                    Date.parse(value) > Date.parse(currentEndDate)
                  ) {
                    newFormFields.endDate = value
                  }
                }

                return {
                  ...state,
                  formFields: newFormFields,
                }
              },
              false,
              `setFormField/${fieldName}`,
            )

            // When a user types, immediately clear any existing error for that field.
            // Validation will be re-triggered on blur.
            get().clearFieldError(fieldName)

            // If startDate changed and endDate was auto-updated, clear endDate errors too
            if (fieldName === 'startDate') {
              get().clearFieldError('endDate')
            }
          },

          // Universal validation field setter
          setValidationField: (
            fieldName: ValidationFieldName,
            value: Record<string, string> | Record<string, boolean> | boolean,
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
              `setValidationField/${fieldName}`,
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
              `setFormMetaField/${fieldName}`,
            )
          },

          // Universal available options setter
          setAvailableOptionsField: (
            fieldName: AvailableOptionsFieldName,
            value: string[],
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
              `setAvailableOptionsField/${fieldName}`,
            )
          },

          // ===== CONVENIENCE METHODS =====

          setFormData: (formData: Partial<FlexibleTournamentFormData>) => {
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
              'setFormData',
            )
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
              'setFormData/clearValidation',
            )
          },

          resetForm: () => {
            set(resetStatePreserving(['availableOptions'], get))
            // Clear the persisted state from session storage to prevent rehydration
            get().clearSessionStorage()
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
              `setFieldBlurred/${fieldName}`,
            )
          },

          setFieldError: (fieldName: string, error: string) => {
            set(
              state => {
                const newDisplayErrors = {
                  ...state.validation.displayErrors,
                  [fieldName]: error,
                }
                // Merge with server errors
                const mergedErrors = mergeErrors(
                  newDisplayErrors,
                  state.validation.serverErrors,
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
              'setFieldError',
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
              `clearFieldError/${fieldName}`,
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
              'clearAllErrors',
            )
          },

          updateAvailableOptions: () => {
            // Tournament forms don't have cascading dependencies like teams
            // This function exists for API consistency but is a no-op
            // Since tournaments don't depend on selecting other tournaments
          },

          // ===== GETTERS =====

          getFormData: (): TournamentFormData => {
            const state = get()
            return state.formFields as TournamentFormData
          },

          // ===== VALIDATION =====

          validateField: (fieldName: string) => {
            const state = get()
            const { validation, formMeta } = state
            const { mode } = formMeta

            // Only validate if field is blurred OR if we're forcing all errors
            const shouldValidate = shouldValidateField(
              fieldName as FormFieldName,
              validation,
            )

            if (!shouldValidate) {
              return
            }

            // Get current form data for validation
            const formData = state.getFormData()
            // Use the simplified validation function
            const error = validateSingleTournamentField(fieldName, formData, mode)

            if (!error) {
              get().clearFieldError(fieldName)
            } else {
              get().setFieldError(fieldName, error)
            }
          },

          validateFieldOnBlur: (fieldName: string) => {
            const state = get()
            const { validation, formMeta } = state
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
              'validateFieldOnBlur/setBlurred',
            )

            // Get current form data for validation
            const formData = state.getFormData()
            // Use the simplified validation function
            const error = validateSingleTournamentField(fieldName, formData, mode)

            if (error) {
              state.setFieldError(fieldName, error)
            } else {
              state.clearFieldError(fieldName)
            }

            // Check if this blur event should enable the next panel
            // Find which panel this field belongs to
            const currentPanel = getPanelNumberForField(fieldName as keyof FormFields)
            // Check if all fields in this panel are now blurred and valid
            if (currentPanel > 0) {
              const panelFields = TOURNAMENT_PANELS_FIELD_MAP[
                currentPanel as keyof typeof TOURNAMENT_PANELS_FIELD_MAP
              ] as readonly string[]
              const allFieldsBlurred = panelFields.every(
                (field: string) => validation.blurredFields[field],
              )
              const allFieldsValid = panelFields.every((field: string) => {
                const fieldValue =
                  state.formFields[field as keyof typeof state.formFields]
                if (Array.isArray(fieldValue)) {
                  return fieldValue.length > 0 && !validation.displayErrors[field]
                }
                return !!fieldValue && !validation.displayErrors[field]
              })
              if (allFieldsBlurred && allFieldsValid) {
                // Panel is now complete - next panel will be enabled by isPanelValid
                // No additional action needed - the UI will re-render automatically
              }
            }
          },

          validateForm: () => {
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
              'validateForm/forceShowErrors',
            )

            const formData = state.getFormData()

            // Use the simplified validation function
            const errors = validateEntireTournamentForm(formData, state.formMeta.mode)

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
                'validateForm/setErrors',
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
              'setServerErrors',
            )
          },

          // ===== PANEL VALIDITY =====

          isPanelValid: (panelNumber: 1 | 2 | 3 | 4) => {
            const state = get()
            return isPanelValid(
              panelNumber,
              state.formFields,
              state.validation.displayErrors,
              state.formMeta.mode,
            )
          },

          isPanelEnabled: (panelNumber: 1 | 2 | 3 | 4) => {
            const state = get()
            return isPanelEnabled(panelNumber, state.formMeta.mode, panel =>
              get().isPanelValid(panel),
            )
          },

          // ===== FORM STATE =====

          isFormReadyForSubmission: () => {
            const state = get()
            return getIsFormReadyForSubmission(
              state.formFields,
              state.validation,
              state.formMeta.mode,
            )
          },

          isFormDirty: () => {
            const state = get()
            return isFormDirty(state.formFields, state.oldFormFields)
          },
        }),
        {
          name: storeName,
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
                  oldFormFields: state.oldFormFields, // Persist initial state
                  formMeta: { mode: state.formMeta.mode },
                }
              : {},
        },
      ),
    ),
    { name: storeName },
  ),
)

export const useFormFields = () =>
  useTournamentFormStore(
    useShallow(state => ({
      name: state.formFields.name,
      location: state.formFields.location,
      startDate: state.formFields.startDate,
      endDate: state.formFields.endDate,
      divisions: state.formFields.divisions,
      categories: state.formFields.categories,
    })),
  )

export const useFormValidationState = () =>
  useTournamentFormStore(
    useShallow(state => ({
      displayErrors: state.validation.displayErrors,
      blurredFields: state.validation.blurredFields,
      forceShowAllErrors: state.validation.forceShowAllErrors,
      submitAttempted: state.validation.submitAttempted,
    })),
  )

export const useFormMode = () => useTournamentFormStore(state => state.formMeta.mode)

export const useOldFormFields = () =>
  useTournamentFormStore(state => state.oldFormFields)

export const useTournamentFormActions = () =>
  useTournamentFormStore(
    useShallow(state => ({
      resetForm: state.resetForm,
      setFormField: state.setFormField,
      setFormMetaField: state.setFormMetaField,
      setFormData: state.setFormData,
      setAvailableOptionsField: state.setAvailableOptionsField,
      validateForm: state.validateForm,
      validateFieldOnBlur: state.validateFieldOnBlur,
      isPanelEnabled: state.isPanelEnabled,
    })),
  )

export const useFormStatus = () =>
  useTournamentFormStore(
    useShallow(state => ({
      isFormDirty: isFormDirty(state.formFields, state.oldFormFields),
      isFormReadyForSubmission: getIsFormReadyForSubmission(
        state.formFields,
        state.validation,
        state.formMeta.mode,
      ),
    })),
  )

/**
 * Hook to handle tournament form store rehydration in components
 * Use this in components that need the tournament form store to be properly hydrated
 */
export const useTournamentFormStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      useTournamentFormStore.persist.rehydrate()
    }
  }, [])
}

export const subscribeToBlurredFields = (
  handler: (blurredFields: Record<string, boolean>) => void,
): (() => void) =>
  useTournamentFormStore.subscribe(state => state.validation.blurredFields, handler)
