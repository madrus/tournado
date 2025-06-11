import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import type { UseTeamFormValidationReturn } from '~/lib/lib.types'
import { extractTeamDataFromFormData, getTeamValidationSchema } from '~/lib/lib.zod'

type UseTeamFormValidationProps = {
  mode: 'create' | 'edit'
  formRef: React.RefObject<HTMLFormElement | null>
  serverErrors?: Record<string, string>
}

export function useTeamFormValidation({
  mode,
  formRef,
  serverErrors = {},
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
    // Mark field as touched only when user leaves the field
    setTouchedFields(prev => ({ ...prev, [name]: true }))

    try {
      // For simple field validation, we'll validate the whole form data
      // since some fields depend on the mode/variant context
      const currentFormData = new FormData(formRef.current || undefined)
      currentFormData.set(name, value.toString())
      validateForm(currentFormData)
    } catch (_error) {
      // Silently handle validation errors for better UX
      // Error will be shown when user attempts to submit
    }
  }

  // Determine whether to show error for a specific field
  const shouldShowFieldError = (fieldName: string): boolean =>
    submitAttempted || touchedFields[fieldName] || false

  // Get filtered errors (only show errors for touched fields or after submit attempt)
  const getDisplayErrors = (): Record<string, string> => {
    const displayErrors: Record<string, string> = {}

    // Always show server-side errors
    Object.keys(serverErrors).forEach(fieldName => {
      displayErrors[fieldName] = serverErrors[fieldName]
    })

    // Show client-side validation errors only if field was touched or submit attempted
    Object.keys(validationErrors).forEach(fieldName => {
      if (forceShowAllErrors || shouldShowFieldError(fieldName)) {
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

  return {
    // State
    validationErrors,
    touchedFields,
    submitAttempted,
    forceShowAllErrors,

    // Computed values
    displayErrors: getDisplayErrors(),

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
