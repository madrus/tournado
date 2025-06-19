import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import type { UseTeamFormValidationReturn } from '~/lib/lib.types'
import { extractTeamDataFromFormData, getTeamValidationSchema } from '~/lib/lib.zod'

type UseTeamFormValidationProps = {
  mode: 'create' | 'edit'
  formRef: React.RefObject<HTMLFormElement | null>
  serverErrors?: Record<string, string>
  fieldStates?: {
    selectedTournamentId?: string
    divisionValue?: string
    categoryValue?: string
  }
}

export function useTeamFormValidation({
  mode,
  formRef,
  serverErrors = {},
  fieldStates = {},
}: UseTeamFormValidationProps): UseTeamFormValidationReturn {
  const { t } = useTranslation()

  // State for client-side validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // State to track which fields have been touched (interacted with)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // State to track if form submission was attempted
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false)

  // State to track forced error display during form submission
  const [forceShowAllErrors, setForceShowAllErrors] = useState<boolean>(false)

  // Get validation schema
  const getValidationSchema = () => getTeamValidationSchema(mode, t)

  // Validate a single field
  const validateSingleField = (
    fieldName: string,
    fieldValue: string | boolean
  ): void => {
    try {
      const schema = getValidationSchema()
      const fieldSchema = schema.shape[fieldName as keyof typeof schema.shape]

      if (fieldSchema) {
        fieldSchema.parse(fieldValue)
        // Field is valid, clear its error
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || `${fieldName} is invalid`
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: errorMessage,
        }))
      }
    }
  }

  // Validate entire form
  const validateForm = (
    submissionFormData: FormData,
    forceShowErrors = false
  ): boolean => {
    const schema = getValidationSchema()
    const validationValues = extractTeamDataFromFormData(submissionFormData)

    try {
      schema.parse(validationValues)
      setValidationErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setValidationErrors(newErrors)

        // If forceShowErrors is true (form submission), force show all errors immediately
        if (forceShowErrors) {
          setForceShowAllErrors(true)
        }
      }
      return false
    }
  }

  // Handle field validation on blur (when user leaves the field)
  const handleFieldBlur = (name: string, value: string | boolean) => {
    // Mark field as touched immediately
    setTouchedFields(prev => ({ ...prev, [name]: true }))

    // Run validation with current form data AND the new field value
    try {
      const currentFormData = new FormData(formRef.current || undefined)

      // For controlled fields, ensure their current state values are in FormData
      // But use the new value for the field being validated
      if (fieldStates?.selectedTournamentId) {
        currentFormData.set('tournamentId', fieldStates.selectedTournamentId)
      }
      if (fieldStates?.divisionValue && name !== 'division') {
        currentFormData.set('division', fieldStates.divisionValue)
      }
      if (fieldStates?.categoryValue && name !== 'category') {
        currentFormData.set('category', fieldStates.categoryValue)
      }

      // For field selections, only validate the specific field
      if (value !== '') {
        validateSingleField(name, value)
      } else {
        // For empty values (blur without selection), validate with full form context
        // ALWAYS use the immediate new value for the field being validated
        currentFormData.set(name, value.toString())

        validateForm(currentFormData)
      }
    } catch (_error) {
      // Validation error handling
    }
  }

  // Check if a field should be disabled based on dependencies
  const isFieldDisabled = (fieldName: string): boolean => {
    const { selectedTournamentId, divisionValue } = fieldStates

    switch (fieldName) {
      case 'division':
        return !selectedTournamentId
      case 'category':
        return !divisionValue
      default:
        return false
    }
  }

  // Determine whether to show error for a specific field
  const shouldShowFieldError = (fieldName: string): boolean =>
    submitAttempted || touchedFields[fieldName] || false

  // Get filtered errors (only show errors for touched fields or after submit attempt)
  const getDisplayErrors = (
    currentTouchedFields?: Record<string, boolean>,
    forceAll?: boolean
  ): Record<string, string> => {
    const displayErrors: Record<string, string> = {}
    const effectiveTouchedFields = currentTouchedFields || touchedFields
    const shouldForceAll = forceAll ?? forceShowAllErrors

    // Always show server-side errors (translate them if they are error keys)
    Object.keys(serverErrors).forEach(fieldName => {
      // Don't show errors for disabled fields UNLESS we're forcing all errors (form submission)
      if (isFieldDisabled(fieldName) && !shouldForceAll) {
        return
      }

      const errorValue = serverErrors[fieldName]
      // Check if the error value looks like a translation key (contains no spaces and ends with 'Required' or similar patterns)
      const isTranslationKey =
        errorValue &&
        typeof errorValue === 'string' &&
        !errorValue.includes(' ') &&
        (errorValue.includes('.') || errorValue.endsWith('Required'))

      displayErrors[fieldName] = isTranslationKey ? t(errorValue) : errorValue
    })

    // Show validation errors if we're forcing all errors, submitted, or field is touched
    Object.keys(validationErrors).forEach(fieldName => {
      // Don't show errors for disabled fields UNLESS we're forcing all errors (form submission)
      if (isFieldDisabled(fieldName) && !shouldForceAll) {
        return
      }

      if (shouldForceAll || submitAttempted || effectiveTouchedFields[fieldName]) {
        displayErrors[fieldName] = validationErrors[fieldName]
      }
    })

    return displayErrors
  }

  // Handle form submission with validation
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Always prevent the default to control the flow
    event.preventDefault()

    const form = event.currentTarget
    const submissionData = new FormData(form)

    // For controlled fields, ensure their values are set in FormData
    // This is needed because controlled components might not always update FormData immediately
    if (fieldStates?.selectedTournamentId) {
      submissionData.set('tournamentId', fieldStates.selectedTournamentId)
    }
    if (fieldStates?.divisionValue) {
      submissionData.set('division', fieldStates.divisionValue)
    }
    if (fieldStates?.categoryValue) {
      submissionData.set('category', fieldStates.categoryValue)
    }

    // Mark that a submit was attempted and force show all errors
    setSubmitAttempted(true)
    setForceShowAllErrors(true)

    // Validate form data
    const isValid = validateForm(submissionData, true)

    if (isValid) {
      // If validation passes and form has action, let it submit
      if (form.action) {
        form.submit()
      }
    }
  }

  // Reactive computed value for display errors
  const displayErrors = useMemo(
    () => getDisplayErrors(),
    [
      validationErrors,
      touchedFields,
      submitAttempted,
      forceShowAllErrors,
      serverErrors,
      fieldStates,
      t,
    ]
  )

  return {
    // State
    validationErrors,
    touchedFields,
    submitAttempted,
    forceShowAllErrors,

    // Computed values
    displayErrors,

    // Functions
    validateForm,
    handleFieldBlur,
    handleSubmit,
    shouldShowFieldError,

    // State setters (for component-specific needs)
    setValidationErrors,
    setTouchedFields,
    setSubmitAttempted,
    setForceShowAllErrors,
  }
}
