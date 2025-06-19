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

type FormFieldStates = {
  // Form field values
  tournamentId: string
  division: string
  category: string
  clubName: string
  teamName: string
  teamLeaderName: string
  teamLeaderPhone: string
  teamLeaderEmail: string
  privacyAgreement: boolean
}

type ValidationStates = {
  // Validation and error states
  validationErrors: Record<string, string>
  displayErrors: Record<string, string>
  touchedFields: Record<string, boolean>
  submitAttempted: boolean
  forceShowAllErrors: boolean
  serverErrors: Record<string, string>
}

type FormMetadata = {
  // Form metadata
  mode: 'create' | 'edit'
  isSubmitting: boolean
  isValid: boolean

  // Available options for dropdowns
  availableTournaments: TournamentData[]
  availableDivisions: string[]
  availableCategories: string[]
}

type StoreState = FormFieldStates & ValidationStates & FormMetadata

type Actions = {
  // Form field setters
  setTournamentId: (tournamentId: string) => void
  setDivision: (division: string) => void
  setCategory: (category: string) => void
  setClubName: (clubName: string) => void
  setTeamName: (teamName: string) => void
  setTeamLeaderName: (name: string) => void
  setTeamLeaderPhone: (phone: string) => void
  setTeamLeaderEmail: (email: string) => void
  setPrivacyAgreement: (agreement: boolean) => void

  // Bulk form data setters
  setFormData: (formData: Partial<FlexibleTeamFormData>) => void
  resetForm: () => void

  // Touch and validation - these work together reactively
  setFieldTouched: (fieldName: string, touched?: boolean) => void

  // Validation management
  setValidationErrors: (errors: Record<string, string>) => void
  setDisplayErrors: (errors: Record<string, string>) => void
  setFieldError: (fieldName: string, error: string) => void
  clearFieldError: (fieldName: string) => void
  clearAllErrors: () => void
  setSubmitAttempted: (attempted: boolean) => void
  setForceShowAllErrors: (force: boolean) => void

  // Form metadata setters
  setMode: (mode: 'create' | 'edit') => void
  setSubmitting: (submitting: boolean) => void
  setValid: (valid: boolean) => void

  // Tournament management - set from server loaders
  setAvailableTournaments: (tournaments: TournamentData[]) => void

  // Computed setters (based on selected tournament/division)
  updateAvailableOptions: () => void

  // Get current form data as TeamFormData
  getFormData: () => TeamFormData

  // Validation helpers - reactive validation system
  validateField: (fieldName: string) => void
  validateAllTouchedFields: () => void
  validateForm: () => boolean

  // Helper to get current field value
  getFieldValue: (fieldName: string) => string | boolean

  // Server-side error handling
  setServerErrors: (errors: Record<string, string>) => void

  // Helper to merge server errors with validation errors
  mergeDisplayErrors: () => void
}

const storeName = 'TeamFormStore'

const initialFormFieldStates: FormFieldStates = {
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

const initialValidationStates: ValidationStates = {
  validationErrors: {},
  displayErrors: {},
  touchedFields: {},
  submitAttempted: false,
  forceShowAllErrors: false,
  serverErrors: {},
}

const initialFormMetadata: FormMetadata = {
  mode: 'create',
  isSubmitting: false,
  isValid: false,
  availableTournaments: [],
  availableDivisions: [],
  availableCategories: [],
}

const initialStoreState: StoreState = {
  ...initialFormFieldStates,
  ...initialValidationStates,
  ...initialFormMetadata,
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

          // Helper to get current field value
          getFieldValue: (fieldName: string): string | boolean => {
            const state = get()
            switch (fieldName) {
              case 'tournamentId':
                return state.tournamentId
              case 'clubName':
                return state.clubName
              case 'teamName':
                return state.teamName
              case 'division':
                return state.division
              case 'category':
                return state.category
              case 'teamLeaderName':
                return state.teamLeaderName
              case 'teamLeaderPhone':
                return state.teamLeaderPhone
              case 'teamLeaderEmail':
                return state.teamLeaderEmail
              case 'privacyAgreement':
                return state.privacyAgreement
              default:
                return ''
            }
          },

          // Form field setters
          setTournamentId: tournamentId => {
            set({
              tournamentId,
              // Reset dependent fields when tournament changes
              division: '',
              category: '',
            })
            // Update available options
            get().updateAvailableOptions()

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.tournamentId) {
              state.validateField('tournamentId')
            }
          },
          setDivision: division => {
            set({ division })
            // Reset dependent fields
            set({ category: '' })

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.division) {
              state.validateField('division')
            }
          },
          setCategory: category => {
            set({ category })

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.category) {
              state.validateField('category')
            }
          },
          setClubName: clubName => {
            set({ clubName })

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.clubName) {
              state.validateField('clubName')
            }
          },
          setTeamName: teamName => {
            set({ teamName })

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.teamName) {
              state.validateField('teamName')
            }
          },
          setTeamLeaderName: teamLeaderName => {
            set({ teamLeaderName })

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.teamLeaderName) {
              state.validateField('teamLeaderName')
            }
          },
          setTeamLeaderPhone: teamLeaderPhone => {
            set({ teamLeaderPhone })

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.teamLeaderPhone) {
              state.validateField('teamLeaderPhone')
            }
          },
          setTeamLeaderEmail: teamLeaderEmail => {
            set({ teamLeaderEmail })

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.teamLeaderEmail) {
              state.validateField('teamLeaderEmail')
            }
          },
          setPrivacyAgreement: privacyAgreement => {
            set({ privacyAgreement })

            // Re-validate touched field
            const state = get()
            if (state.touchedFields.privacyAgreement) {
              state.validateField('privacyAgreement')
            }
          },

          // Bulk form data setters
          setFormData: formData => {
            // Map external field names to internal store field names
            const mappedData: Partial<FormFieldStates> = {}

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
            set(state => ({ ...state, ...mappedData }))

            // Update available options if tournament was set
            if (mappedData.tournamentId !== undefined) {
              get().updateAvailableOptions()
            }

            // Clear ALL validation state completely after everything is set
            // This prevents validation errors from showing for valid pre-populated data
            set({
              validationErrors: {},
              displayErrors: {},
              serverErrors: {}, // Clear server errors too
              touchedFields: {},
              submitAttempted: false,
              forceShowAllErrors: false,
            })
          },
          resetForm: () =>
            set({
              ...initialStoreState,
              availableTournaments: get().availableTournaments,
            }),

          // Touch and validation - reactive system
          setFieldTouched: (fieldName, touched = true) => {
            set(state => ({
              touchedFields: { ...state.touchedFields, [fieldName]: touched },
            }))

            // Reactive validation: when field becomes touched, validate it immediately
            if (touched) {
              get().validateField(fieldName)
            }
          },

          // Validation management
          setValidationErrors: validationErrors => set({ validationErrors }),
          setDisplayErrors: displayErrors => set({ displayErrors }),

          // Helper to merge server errors with validation errors
          mergeDisplayErrors: () => {
            const state = get()
            // Server errors take priority over validation errors
            const mergedErrors = { ...state.displayErrors, ...state.serverErrors }
            set({ displayErrors: mergedErrors })
          },

          setFieldError: (fieldName, error) => {
            set(state => ({
              displayErrors: { ...state.displayErrors, [fieldName]: error },
            }))
            // After setting validation error, merge with server errors
            get().mergeDisplayErrors()
          },
          clearFieldError: fieldName => {
            const state = get()
            // Only clear if it's not a server error
            if (!state.serverErrors[fieldName]) {
              set(() => {
                const newDisplayErrors = { ...state.displayErrors }
                delete newDisplayErrors[fieldName]
                return { displayErrors: newDisplayErrors }
              })
            }
          },
          clearAllErrors: () =>
            set({ validationErrors: {}, displayErrors: {}, serverErrors: {} }),
          setSubmitAttempted: submitAttempted => set({ submitAttempted }),
          setForceShowAllErrors: forceShowAllErrors => set({ forceShowAllErrors }),

          // Form metadata setters
          setMode: mode => set({ mode }),
          setSubmitting: isSubmitting => set({ isSubmitting }),
          setValid: isValid => set({ isValid }),

          // Tournament management - set from server loaders
          setAvailableTournaments: tournaments =>
            set({ availableTournaments: tournaments }),

          // Computed setters (based on selected tournament/division)
          updateAvailableOptions: () => {
            const state = get()
            const selectedTournament = state.availableTournaments.find(
              t => t.id === state.tournamentId
            )

            set({
              availableDivisions: selectedTournament?.divisions || [],
              availableCategories: selectedTournament?.categories || [],
            })
          },

          // Get current form data as TeamFormData
          getFormData: (): TeamFormData => {
            const state = get()
            return {
              tournamentId: state.tournamentId,
              clubName: state.clubName,
              teamName: state.teamName as TeamFormData['teamName'],
              division: state.division as TeamFormData['division'],
              category: state.category,
              teamLeaderName: state.teamLeaderName,
              teamLeaderPhone: state.teamLeaderPhone,
              teamLeaderEmail: state.teamLeaderEmail as TeamFormData['teamLeaderEmail'],
              privacyAgreement: state.privacyAgreement,
            }
          },

          // Individual field validation - called reactively when field is touched
          validateField: (fieldName: string) => {
            const state = get()

            // Only validate if field is touched OR if we're forcing all errors
            const shouldValidate =
              state.touchedFields[fieldName] ||
              state.forceShowAllErrors ||
              state.submitAttempted

            if (!shouldValidate) {
              return
            }

            // Get current form data for validation
            const formData = state.getFormData()

            // Use the simplified validation function
            const error = validateSingleField(fieldName, formData, state.mode)

            if (error) {
              state.setFieldError(fieldName, error)
            } else {
              state.clearFieldError(fieldName)
            }
          },

          // Validate all currently touched fields
          validateAllTouchedFields: () => {
            const state = get()
            Object.keys(state.touchedFields).forEach(fieldName => {
              if (state.touchedFields[fieldName]) {
                state.validateField(fieldName)
              }
            })
          },

          // Full form validation - called on form submission
          validateForm: (): boolean => {
            const state = get()

            // Force validation for all fields regardless of touched state
            set({ forceShowAllErrors: true })

            const formData = state.getFormData()

            // Use the simplified validation function
            const errors = validateEntireForm(formData, state.mode)

            if (Object.keys(errors).length > 0) {
              // Set all errors at once
              set(() => ({
                displayErrors: { ...state.displayErrors, ...errors },
              }))
              state.setValid(false)
              return false
            }

            // Clear all errors and set valid state if validation passed
            state.clearAllErrors()
            state.setValid(true)
            return true
          },

          // Server-side error handling
          setServerErrors: errors => {
            set({ serverErrors: errors })
            // Merge server errors with existing validation errors
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
                  tournamentId: state.tournamentId,
                  division: state.division,
                  category: state.category,
                  clubName: state.clubName,
                  teamName: state.teamName,
                  teamLeaderName: state.teamLeaderName,
                  teamLeaderPhone: state.teamLeaderPhone,
                  teamLeaderEmail: state.teamLeaderEmail,
                  mode: state.mode,
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

// Optional: Create a subscription to watch for touched field changes
// This could be used for additional reactive behaviors
export const subscribeToTouchedFields = (
  handler: (touchedFields: Record<string, boolean>) => void
): (() => void) => useTeamFormStore.subscribe(state => state.touchedFields, handler)
