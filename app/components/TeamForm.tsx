import { JSX, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'
import { z } from 'zod'

import { InputField } from '~/components/InputField'
import { getDivisionLabel } from '~/lib/lib.helpers'
import type { TeamFormProps } from '~/lib/lib.types'

// Create validation schema with translated error messages using local t function
export function TeamForm({
  mode,
  variant,
  formData = {},
  tournaments = [],
  errors = {},
  isSuccess = false,
  successMessage,
  submitButtonText,
  onCancel,
  showDeleteButton = false,
  onDelete,
  className = '',
  intent,
}: TeamFormProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const teamNameRef = useRef<HTMLInputElement>(null)
  const teamClassRef = useRef<HTMLSelectElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Create validation schema with translated error messages using local t function
  const createTeamFormSchema = () =>
    z.object({
      // Tournament selection (required for create mode)
      tournamentId: z.string().min(1, t('teams.form.errors.tournamentRequired')),

      // Basic team information
      clubName: z
        .string()
        .min(1, t('teams.form.errors.clubNameRequired'))
        .max(100, t('teams.form.errors.clubNameTooLong')),
      teamName: z
        .string()
        .min(1, t('teams.form.errors.teamNameRequired'))
        .max(50, t('teams.form.errors.teamNameTooLong')),
      division: z.string().min(1, t('teams.form.errors.divisionRequired')),

      // Team leader information (required for create mode)
      teamLeaderName: z
        .string()
        .min(1, t('teams.form.errors.teamLeaderNameRequired'))
        .max(100, t('teams.form.errors.teamLeaderNameTooLong')),
      teamLeaderPhone: z
        .string()
        .min(1, t('teams.form.errors.phoneNumberRequired'))
        .refine(
          val => val.length === 0 || /^[\+]?[0-9\s\-\(\)]+$/.test(val),
          t('teams.form.errors.phoneNumberInvalid')
        ),
      teamLeaderEmail: z
        .string()
        .min(1, t('teams.form.errors.emailRequired'))
        .refine(
          val => val.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
          t('teams.form.errors.emailInvalid')
        ),

      // Privacy agreement (required for public create mode)
      privacyAgreement: z
        .boolean()
        .refine(val => val === true, t('teams.form.errors.privacyAgreementRequired')),
    })

  // State for selected tournament (for division filtering)
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    formData.tournamentId || ''
  )

  // State for client-side validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // State to track which fields have been touched (interacted with)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // State to track if form submission was attempted
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false)

  // Use appropriate schema based on mode
  const getValidationSchema = () =>
    mode === 'create'
      ? createTeamFormSchema() // All fields including privacy
      : createTeamFormSchema().omit({ privacyAgreement: true }) // Edit mode doesn't need privacy agreement

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

  // Validate entire form
  const validateForm = (
    submissionFormData: FormData,
    forceShowErrors = false
  ): boolean => {
    const schema = getValidationSchema()
    const validationValues: Record<string, string | boolean> = {}

    // Extract all possible form fields - let the schema decide which ones to validate
    validationValues.tournamentId =
      (submissionFormData.get('tournamentId') as string) || ''
    validationValues.clubName = (submissionFormData.get('clubName') as string) || ''
    validationValues.teamName = (submissionFormData.get('teamName') as string) || ''
    validationValues.division = (submissionFormData.get('division') as string) || ''
    validationValues.teamLeaderName =
      (submissionFormData.get('teamLeaderName') as string) || ''
    validationValues.teamLeaderPhone =
      (submissionFormData.get('teamLeaderPhone') as string) || ''
    validationValues.teamLeaderEmail =
      (submissionFormData.get('teamLeaderEmail') as string) || ''
    validationValues.privacyAgreement =
      submissionFormData.get('privacyAgreement') === 'on'

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

  // State to track forced error display during form submission
  const [forceShowAllErrors, setForceShowAllErrors] = useState<boolean>(false)

  // Get filtered errors (only show errors for touched fields or after submit attempt)
  const getDisplayErrors = (): Record<string, string> => {
    const displayErrors: Record<string, string> = {}

    // Always show server-side errors
    Object.keys(errors).forEach(fieldName => {
      displayErrors[fieldName] = errors[fieldName]
    })

    // Show client-side validation errors only if field was touched or submit attempted
    Object.keys(validationErrors).forEach(fieldName => {
      if (forceShowAllErrors || shouldShowFieldError(fieldName)) {
        displayErrors[fieldName] = validationErrors[fieldName]
      }
    })

    return displayErrors
  }

  // Get display errors instead of merged errors
  const displayErrors = getDisplayErrors()

  // Get available divisions for selected tournament
  const availableDivisions = selectedTournamentId
    ? tournaments.find(tournament => tournament.id === selectedTournamentId)
        ?.divisions || []
    : []

  // Focus management
  useEffect(() => {
    if (errors.teamName) {
      teamNameRef.current?.focus()
    } else if (errors.division) {
      teamClassRef.current?.focus()
    } else if (isSuccess && variant === 'public') {
      // Reset form on successful submission for public variant
      formRef.current?.reset()
    }
  }, [errors, isSuccess, variant])

  const isPublicVariant = variant === 'public'
  const showPrivacyAgreement = mode === 'create' // Only show privacy agreement in create mode

  return (
    <div className={`max-w-4xl ${className}`}>
      {/* Success Message for Public Variant */}
      {isSuccess && isPublicVariant && successMessage ? (
        <div className='mb-6 rounded-lg border border-green-200 bg-green-50 p-4'>
          <div className='flex items-center'>
            <svg
              className='h-5 w-5 text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>{successMessage}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header for Admin Variant */}
      {!isPublicVariant ? (
        <div className='mb-8 border-b border-gray-200 pb-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h3 className='text-xl font-bold text-gray-900'>
                {mode === 'create'
                  ? t('admin.teams.createTeam')
                  : formData.clubName && formData.teamName
                    ? `${formData.clubName} ${formData.teamName}`
                    : t('admin.teams.editTeam')}
              </h3>
              <p className='mt-1 text-gray-600'>
                {mode === 'create'
                  ? t('admin.teams.createTeamDescription')
                  : formData.division}
              </p>
            </div>

            {/* Delete Button for Admin Edit Mode */}
            {showDeleteButton && onDelete ? (
              <button
                type='button'
                onClick={onDelete}
                className='inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
              >
                <svg
                  className='mr-2 -ml-1 h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                {t('teams.deleteTeam')}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <Form
        ref={formRef}
        method='post'
        className='space-y-8'
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Hidden fields */}
        {intent ? <input type='hidden' name='intent' value={intent} /> : null}

        {/* Form Content */}
        {/* Unified form layout - all fields shown for all modes and variants */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Team Information Panel */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-semibold text-gray-900'>
              {t('teams.form.teamInfo')}
            </h3>

            {/* Tournament Selection */}
            <div className='mb-4'>
              <label className='flex w-full flex-col gap-1'>
                <span className='font-medium'>{t('teams.form.tournament')}</span>
                <select
                  name='tournamentId'
                  defaultValue={formData.tournamentId || ''}
                  onChange={event => setSelectedTournamentId(event.target.value)}
                  className={`h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6 ${!selectedTournamentId ? 'text-gray-500' : 'text-gray-900'}`}
                  aria-invalid={displayErrors.tournamentId ? true : undefined}
                  aria-errormessage={
                    displayErrors.tournamentId ? 'tournamentId-error' : undefined
                  }
                  onBlur={event => handleFieldBlur('tournamentId', event.target.value)}
                >
                  <option value='' className='text-gray-500'>
                    {t('teams.form.selectTournament')}
                  </option>
                  {tournaments.map(tournament => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} - {tournament.location} (
                      {new Date(tournament.startDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </label>
              {displayErrors.tournamentId ? (
                <div className='pt-1 text-sm text-red-700' id='tournamentId-error'>
                  {displayErrors.tournamentId}
                </div>
              ) : null}
            </div>

            {/* Club Name */}
            <InputField
              name='clubName'
              label={t('teams.form.clubName')}
              defaultValue={formData.clubName || ''}
              placeholder={t('teams.form.placeholders.clubName')}
              readOnly={false}
              required
              error={displayErrors.clubName}
              className='mb-4'
              onBlur={event => handleFieldBlur('clubName', event.target.value)}
            />

            {/* Team Name */}
            <InputField
              ref={teamNameRef}
              name='teamName'
              label={t('teams.form.teamName')}
              defaultValue={formData.teamName || ''}
              placeholder={t('teams.form.placeholders.teamName')}
              readOnly={false}
              required
              error={displayErrors.teamName}
              className='mb-4'
              onBlur={event => handleFieldBlur('teamName', event.target.value)}
            />

            {/* Team Class */}
            <div className='mb-4'>
              <label className='flex w-full flex-col gap-1'>
                <span className='font-medium'>{t('teams.form.division')}</span>
                <select
                  ref={teamClassRef}
                  name='division'
                  defaultValue={formData.division || ''}
                  required
                  className={`h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6 ${!formData.division ? 'text-gray-500' : 'text-gray-900'}`}
                  aria-invalid={displayErrors.division ? true : undefined}
                  aria-errormessage={
                    displayErrors.division ? 'division-error' : undefined
                  }
                  onBlur={event => handleFieldBlur('division', event.target.value)}
                >
                  <option value='' className='text-gray-500'>
                    {t('teams.form.selectDivision')}
                  </option>
                  {availableDivisions.map(division => (
                    <option key={division} value={division}>
                      {getDivisionLabel(division, i18n.language)}
                    </option>
                  ))}
                </select>
              </label>
              {displayErrors.division ? (
                <div className='pt-1 text-sm text-red-700' id='division-error'>
                  {displayErrors.division}
                </div>
              ) : null}
            </div>
          </div>

          {/* Team Leader Information Panel */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-semibold text-gray-900'>
              {t('teams.form.teamLeaderInfo')}
            </h3>

            {/* Team Leader Name */}
            <InputField
              name='teamLeaderName'
              label={t('teams.form.teamLeaderName')}
              defaultValue={formData.teamLeaderName || ''}
              placeholder={t('teams.form.placeholders.teamLeaderName')}
              readOnly={false}
              required
              error={displayErrors.teamLeaderName}
              className='mb-4'
              onBlur={event => handleFieldBlur('teamLeaderName', event.target.value)}
            />

            {/* Team Leader Phone */}
            <InputField
              name='teamLeaderPhone'
              label={t('teams.form.teamLeaderPhone')}
              type='tel'
              defaultValue={formData.teamLeaderPhone || ''}
              placeholder={t('teams.form.placeholders.teamLeaderPhone')}
              readOnly={false}
              required
              error={displayErrors.teamLeaderPhone}
              className='mb-4'
              onBlur={event => handleFieldBlur('teamLeaderPhone', event.target.value)}
            />

            {/* Team Leader Email */}
            <InputField
              name='teamLeaderEmail'
              label={t('teams.form.teamLeaderEmail')}
              type='email'
              defaultValue={formData.teamLeaderEmail || ''}
              placeholder={t('teams.form.placeholders.teamLeaderEmail')}
              readOnly={false}
              required
              error={displayErrors.teamLeaderEmail}
              className='mb-4'
              onBlur={event => handleFieldBlur('teamLeaderEmail', event.target.value)}
            />
          </div>
        </div>

        {/* Privacy Agreement - only shown in create mode */}
        {showPrivacyAgreement ? (
          <div className='rounded-lg bg-gray-50 p-6'>
            <div className='flex items-start gap-3'>
              <input
                type='checkbox'
                name='privacyAgreement'
                id='privacyAgreement'
                className='mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500'
                aria-invalid={displayErrors.privacyAgreement ? true : undefined}
                aria-errormessage={
                  displayErrors.privacyAgreement ? 'privacy-error' : undefined
                }
                onChange={event =>
                  handleFieldBlur('privacyAgreement', event.target.checked)
                }
              />
              <label htmlFor='privacyAgreement' className='text-sm text-gray-700'>
                {t('teams.form.privacyAgreement')}
              </label>
            </div>
            {displayErrors.privacyAgreement ? (
              <div className='mt-2 text-sm text-red-700' id='privacy-error'>
                {displayErrors.privacyAgreement}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Submit Buttons */}
        <div className='flex justify-end gap-3'>
          {/* Cancel Button for Admin Variant */}
          {!isPublicVariant && onCancel ? (
            <button
              type='button'
              onClick={onCancel}
              className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
            >
              {t('common.cancel')}
            </button>
          ) : null}

          {/* Submit Button */}
          <button
            type='submit'
            className={`inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 ${
              isPublicVariant ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
            } font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none`}
          >
            {submitButtonText ||
              (isPublicVariant
                ? isSuccess
                  ? t('teams.form.createAnotherTeam')
                  : t('teams.form.createTeam')
                : mode === 'edit'
                  ? t('admin.teams.saveChanges')
                  : t('admin.teams.createTeam'))}
          </button>
        </div>
      </Form>
    </div>
  )
}
