import { JSX, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import { ActionButton } from '~/components/buttons'
import { CheckIcon, RestorePageIcon } from '~/components/icons'
import { CustomDatePicker } from '~/components/inputs/CustomDatePicker'
import { TextInputField } from '~/components/inputs/TextInputField'
import type { Category, Division } from '~/db.server'
import { getCategoryLabelByValue, getDivisionLabelByValue } from '~/lib/lib.helpers'
import {
  useTournamentFormStore,
  useTournamentFormStoreHydration,
} from '~/stores/useTournamentFormStore'
import { cn } from '~/utils/misc'
import { getLatinTextClass, getLatinTitleClass } from '~/utils/rtlUtils'

type TournamentFormProps = {
  mode?: 'create' | 'edit'
  variant?: 'admin' | 'public'
  formData?: {
    id?: string
    name?: string
    location?: string
    divisions?: string[]
    categories?: string[]
    startDate?: string
    endDate?: string
  }
  divisions?: string[]
  categories?: string[]
  errors?: Record<string, string>
  isSuccess?: boolean
  successMessage?: string
  submitButtonText?: string
  onCancel?: () => void
  showDeleteButton?: boolean
  onDelete?: () => void
  className?: string
  intent?: string
}

export function TournamentForm({
  mode: formMode = 'create',
  variant = 'admin',
  formData = {},
  divisions = [],
  categories = [],
  errors = {},
  isSuccess = false,
  successMessage,
  submitButtonText,
  onCancel,
  showDeleteButton = false,
  onDelete,
  className = '',
  intent,
}: TournamentFormProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  // Ensure the tournament form store is properly hydrated
  useTournamentFormStoreHydration()

  // Get all state from the form store
  const {
    formFields: {
      name,
      location,
      startDate,
      endDate,
      divisions: selectedDivisions,
      categories: selectedCategories,
    },
    validation: { displayErrors, blurredFields, forceShowAllErrors, submitAttempted },
    formMeta: { mode },
    setFormField,
    setFormMetaField,
    setFormData,
    setAvailableOptionsField,
    validateForm,
    validateFieldOnBlur,
    isPanelEnabled,
    isFormReadyForSubmission,
    isDirty,
  } = useTournamentFormStore()

  // Helper function to translate error keys to user-readable messages
  // Show errors for:
  // 1. Server errors (from props) - always shown with priority
  // 2. Fields that have been blurred - for individual field validation
  // 3. All fields when forceShowAllErrors is true - for form submission validation
  // 4. All fields when submitAttempted is true - for form submission validation
  // Don't show errors for disabled fields
  const getTranslatedError = useCallback(
    (fieldName: string, isDisabled = false): string | undefined => {
      // Don't show errors for disabled fields
      if (isDisabled) return undefined

      // Check for server errors first (these have priority and are always shown)
      if (errors[fieldName]) {
        return errors[fieldName]
      }

      // Show client-side errors if field has been blurred OR if we're forcing all errors OR if form was submitted
      const shouldShowError =
        blurredFields[fieldName] || forceShowAllErrors || submitAttempted

      if (!shouldShowError) return undefined

      const errorKey = displayErrors[fieldName]
      if (!errorKey) return undefined

      // If the error is already a plain message (from server), return as-is
      if (!errorKey.includes('.')) return errorKey

      // Otherwise, translate the key
      return t(errorKey)
    },
    [blurredFields, forceShowAllErrors, submitAttempted, displayErrors, t, errors]
  )

  // Initialize mode in store
  useEffect(() => {
    if (mode !== formMode) {
      setFormMetaField('mode', formMode)
    }
  }, [mode, formMode, setFormMetaField])

  // Reset form state when switching to create mode to ensure clean state
  useEffect(() => {
    if (formMode === 'create') {
      // Clear form fields for new tournament creation
      setFormField('name', '')
      setFormField('location', '')
      setFormField('startDate', '')
      setFormField('endDate', '')
      setFormField('divisions', [])
      setFormField('categories', [])
    }
  }, [formMode, setFormField])

  // Initialize form data in store when formData prop is provided
  useEffect(() => {
    // Only set form data if we have meaningful formData content (not just empty object)
    // AND we're in edit mode (create mode should start clean)
    if (formData && Object.keys(formData).length > 0 && formMode === 'edit') {
      setFormData({
        name: formData.name || '',
        location: formData.location || '',
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        divisions: formData.divisions || [],
        categories: formData.categories || [],
      })
    }
  }, [formData, formMode, setFormData])

  // Initialize available options in store
  useEffect(() => {
    setAvailableOptionsField('divisions', divisions)
    setAvailableOptionsField('categories', categories)
  }, [divisions, categories])

  // Focus management
  useEffect(() => {
    if (errors.name) {
      nameRef.current?.focus()
    } else if (isSuccess && variant === 'public') {
      // Reset form on successful submission for public variant
      formRef.current?.reset()
    }
  }, [errors, isSuccess, variant])

  // Handle client-side form submission and validation
  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    const isValid = validateForm()

    if (!isValid) {
      formEvent.preventDefault()
    }
  }

  const handleDivisionToggle = (division: string) => {
    const newDivisions = selectedDivisions.includes(division)
      ? selectedDivisions.filter(d => d !== division)
      : [...selectedDivisions, division]
    setFormField('divisions', newDivisions)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    setFormField('categories', newCategories)
  }

  const isPublicVariant = variant === 'public'
  const isPublicSuccess = isSuccess && variant === 'public'

  return (
    <div className={cn('mx-auto max-w-6xl', className)}>
      {/* Success Message for Public Variant */}
      {isPublicSuccess && successMessage ? (
        <div className='border-primary from-accent to-accent mb-8 rounded-xl border bg-gradient-to-r p-6 shadow-lg'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='bg-accent flex h-10 w-10 items-center justify-center rounded-full'>
                <CheckIcon className='text-primary h-6 w-6' size={24} />
              </div>
            </div>
            <div className='ml-4'>
              <p className='text-foreground-darker text-sm font-semibold'>
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header for Admin Variant */}
      {!isPublicVariant ? (
        <div className='border-foreground-lighter from-background to-background-hover mb-8 rounded-xl border-2 bg-gradient-to-r p-6 shadow-lg transition-all duration-300 hover:shadow-xl'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h2
                className={cn('text-2xl font-bold', getLatinTitleClass(i18n.language))}
              >
                {name ? name : t('tournaments.form.tournamentRegistration')}
              </h2>
              <p className='text-foreground-light mt-2'>
                {location
                  ? `${t('tournaments.form.location')} ${location}`
                  : t('tournaments.form.fillOutForm')}
              </p>
            </div>
            {/* Delete Button for Admin Edit Mode */}
            {showDeleteButton && onDelete ? (
              <div className='flex justify-end lg:justify-start rtl:justify-start lg:rtl:justify-end'>
                <ActionButton
                  onClick={onDelete}
                  icon='delete'
                  variant='secondary'
                  color='brand'
                >
                  {t('common.actions.delete')}
                </ActionButton>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <Form
        ref={formRef}
        method='post'
        className='space-y-8'
        noValidate
        onSubmit={handleSubmit}
        role='form'
      >
        {/* Hidden fields */}
        {intent ? <input type='hidden' name='intent' value={intent} /> : null}

        {/* Hidden fields for arrays */}
        {selectedDivisions.map((division, index) => (
          <input
            key={`hidden-division-${index}`}
            type='hidden'
            name='divisions'
            value={division}
          />
        ))}
        {selectedCategories.map((category, index) => (
          <input
            key={`hidden-category-${index}`}
            type='hidden'
            name='categories'
            value={category}
          />
        ))}

        {/* Step 1: Basic Information - Always enabled */}
        <div className='relative'>
          <div className='bg-brand text-primary-foreground absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6 lg:rtl:left-auto'>
            1
          </div>

          <div className='border-brand from-accent to-accent rounded-xl border-2 bg-gradient-to-br p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2
                className={cn(
                  'text-foreground-darker mb-2 text-xl font-bold',
                  getLatinTitleClass(i18n.language)
                )}
              >
                {t('tournaments.form.basicInformation')}
              </h2>
              <p className='text-brand text-sm'>
                {t('tournaments.form.enterBasicDetails')}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Tournament Name */}
              <TextInputField
                ref={nameRef}
                name='name'
                label={t('tournaments.form.name')}
                value={name}
                onChange={value => setFormField('name', value)}
                onBlur={() => validateFieldOnBlur('name')}
                error={getTranslatedError('name')}
                required
                className={getLatinTextClass(i18n.language)}
                disabled={isPublicSuccess}
              />

              {/* Location */}
              <TextInputField
                name='location'
                label={t('tournaments.form.location')}
                value={location}
                onChange={value => setFormField('location', value)}
                onBlur={() => validateFieldOnBlur('location')}
                error={getTranslatedError('location')}
                required
                className={getLatinTextClass(i18n.language)}
                disabled={isPublicSuccess}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Dates */}
        <div
          className={cn(
            'relative',
            !isPanelEnabled(2) ? 'pointer-events-none opacity-50' : ''
          )}
        >
          <div
            className={cn(
              'absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6 lg:rtl:left-auto',
              isPanelEnabled(2) ? 'bg-blue-600' : 'bg-gray-400'
            )}
          >
            2
          </div>

          <div className='rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold',
                  getLatinTitleClass(i18n.language),
                  isPanelEnabled(2) ? 'text-blue-800' : 'text-gray-400'
                )}
              >
                {t('tournaments.form.dates')}
              </h2>
              <p
                className={cn(
                  'text-sm',
                  isPanelEnabled(2) ? 'text-blue-600' : 'text-gray-400'
                )}
              >
                {t('tournaments.form.selectDates')}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Start Date */}
              <CustomDatePicker
                name='startDate'
                label={t('tournaments.form.startDate')}
                value={startDate}
                onChange={event => setFormField('startDate', event.target.value)}
                onBlur={() => validateFieldOnBlur('startDate')}
                error={getTranslatedError('startDate', !isPanelEnabled(2))}
                required
                className={getLatinTextClass(i18n.language)}
                readOnly={isPublicSuccess || !isPanelEnabled(2)}
              />

              {/* End Date */}
              <CustomDatePicker
                name='endDate'
                label={t('tournaments.form.endDate')}
                value={endDate}
                onChange={event => setFormField('endDate', event.target.value)}
                onBlur={() => validateFieldOnBlur('endDate')}
                error={getTranslatedError('endDate', !isPanelEnabled(2))}
                className={getLatinTextClass(i18n.language)}
                readOnly={isPublicSuccess || !isPanelEnabled(2)}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Divisions */}
        <div
          className={cn(
            'relative',
            !isPanelEnabled(3) ? 'pointer-events-none opacity-50' : ''
          )}
        >
          <div
            className={cn(
              'absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6 lg:rtl:left-auto',
              isPanelEnabled(3) ? 'bg-green-600' : 'bg-gray-400'
            )}
          >
            3
          </div>

          <div className='rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold',
                  getLatinTitleClass(i18n.language),
                  isPanelEnabled(3) ? 'text-green-800' : 'text-gray-400'
                )}
              >
                {t('tournaments.form.divisions')}
              </h2>
              <p
                className={cn(
                  'text-sm',
                  isPanelEnabled(3) ? 'text-green-600' : 'text-gray-400'
                )}
              >
                {t('tournaments.form.selectDivisions')} ({selectedDivisions.length}{' '}
                {t('tournaments.form.selected')})
              </p>
            </div>

            <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
              {divisions.map(division => (
                <label
                  key={division}
                  className={cn(
                    'flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all duration-200',
                    selectedDivisions.includes(division)
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50',
                    (!isPanelEnabled(3) || isPublicSuccess) &&
                      'cursor-not-allowed opacity-50'
                  )}
                  data-testid={`division-${division.toLowerCase()}`}
                >
                  <input
                    type='checkbox'
                    checked={selectedDivisions.includes(division)}
                    onChange={() => handleDivisionToggle(division)}
                    disabled={!isPanelEnabled(3) || isPublicSuccess}
                    className='sr-only'
                  />
                  <span
                    className={cn(
                      'text-base font-medium',
                      i18n.language !== 'ar' ? getLatinTextClass(i18n.language) : ''
                    )}
                  >
                    {getDivisionLabelByValue(
                      division as Division,
                      i18n.language as 'en' | 'nl' | 'ar' | 'tr'
                    )}
                  </span>
                </label>
              ))}
            </div>
            {getTranslatedError('divisions', !isPanelEnabled(3)) ? (
              <p className='text-destructive mt-2 text-sm'>
                {getTranslatedError('divisions', !isPanelEnabled(3))}
              </p>
            ) : null}
          </div>
        </div>

        {/* Step 4: Categories */}
        <div
          className={cn(
            'relative',
            !isPanelEnabled(4) ? 'pointer-events-none opacity-50' : ''
          )}
        >
          <div
            className={cn(
              'absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6 lg:rtl:left-auto',
              isPanelEnabled(4) ? 'bg-purple-600' : 'bg-gray-400'
            )}
          >
            4
          </div>

          <div className='rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-violet-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold',
                  getLatinTitleClass(i18n.language),
                  isPanelEnabled(4) ? 'text-purple-800' : 'text-gray-400'
                )}
              >
                {t('tournaments.form.categories')}
              </h2>
              <p
                className={cn(
                  'text-sm',
                  isPanelEnabled(4) ? 'text-purple-600' : 'text-gray-400'
                )}
              >
                {t('tournaments.form.selectCategories')} ({selectedCategories.length}{' '}
                {t('tournaments.form.selected')})
              </p>
            </div>

            <div className='grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6'>
              {categories.map(category => (
                <label
                  key={category}
                  className={cn(
                    'flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all duration-200',
                    selectedCategories.includes(category)
                      ? 'border-purple-500 bg-purple-50 text-purple-800'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50',
                    (!isPanelEnabled(4) || isPublicSuccess) &&
                      'cursor-not-allowed opacity-50'
                  )}
                  data-testid={`category-${category.toLowerCase()}`}
                >
                  <input
                    type='checkbox'
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    disabled={!isPanelEnabled(4) || isPublicSuccess}
                    className='sr-only'
                  />
                  <span
                    className={cn(
                      'text-base font-medium',
                      i18n.language !== 'ar' ? getLatinTextClass(i18n.language) : ''
                    )}
                  >
                    {getCategoryLabelByValue(
                      category as Category,
                      i18n.language as 'en' | 'nl' | 'ar' | 'tr'
                    )}
                  </span>
                </label>
              ))}
            </div>
            {getTranslatedError('categories', !isPanelEnabled(4)) ? (
              <p className='text-destructive mt-2 text-sm'>
                {getTranslatedError('categories', !isPanelEnabled(4))}
              </p>
            ) : null}
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end rtl:justify-start'>
          <div className='flex gap-4'>
            {onCancel ? (
              <ActionButton
                type='button'
                onClick={onCancel}
                variant='secondary'
                color='brand'
              >
                <RestorePageIcon className='mr-2 h-6 w-6' size={24} />
                {t('common.actions.reset')}
              </ActionButton>
            ) : null}

            <ActionButton
              type='submit'
              variant='primary'
              color='brand'
              icon='check_circle'
              aria-label={t('common.actions.save')}
              disabled={
                isPublicSuccess ||
                !isFormReadyForSubmission() ||
                (mode === 'edit' && !isDirty())
              }
            >
              {submitButtonText || t('common.actions.save')}
            </ActionButton>
          </div>
        </div>
      </Form>
    </div>
  )
}
