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

    // Force all errors to show immediately
    setForceShowAllErrors(true)

    // Run validation with current form data
    try {
      const currentFormData = new FormData(formRef.current || undefined)
      currentFormData.set(name, value.toString())
      validateForm(currentFormData)
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
    currentTouchedFields?: Record<string, boolean>
  ): Record<string, string> => {
    const displayErrors: Record<string, string> = {}
    const effectiveTouchedFields = currentTouchedFields || touchedFields

    // Always show server-side errors (translate them if they are error keys)
    Object.keys(serverErrors).forEach(fieldName => {
      // Don't show errors for disabled fields
      if (isFieldDisabled(fieldName)) {
        return
      }

      const errorValue = serverErrors[fieldName]
      // Check if the error value looks like a translation key (contains no spaces and ends with 'Required' or similar patterns)
      const isTranslationKey =
        errorValue &&
        !errorValue.includes(' ') &&
        (errorValue.includes('Required') ||
          errorValue.includes('Invalid') ||
          errorValue.includes('TooLong'))

      displayErrors[fieldName] = isTranslationKey
        ? t(`teams.form.errors.${errorValue}`)
        : errorValue
    })

    // Show client-side validation errors only if field was touched or submit attempted
    Object.keys(validationErrors).forEach(fieldName => {
      // Don't show errors for disabled fields
      if (isFieldDisabled(fieldName)) {
        return
      }

      if (forceShowAllErrors || submitAttempted || effectiveTouchedFields[fieldName]) {
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

    // Mark that submission was attempted
    setSubmitAttempted(true)

    // Run client-side validation immediately
    const isValid = validateForm(submissionData, true) // Pass forceShowErrors = true

    if (!isValid) {
      // Validation failed, errors have been set in state
      return
    }

    // If validation passes, manually submit the form
    form.submit()
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
