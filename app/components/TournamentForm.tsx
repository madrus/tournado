import { JSX, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import { ActionButton } from '~/components/buttons'
import { ErrorMessage } from '~/components/ErrorMessage'
import { CheckIcon, RestorePageIcon } from '~/components/icons'
import { CustomDatePicker } from '~/components/inputs/CustomDatePicker'
import { TextInputField } from '~/components/inputs/TextInputField'
import { Panel } from '~/components/Panel'
import { ToggleChip } from '~/components/ToggleChip'
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

  // Panel color constants - single source of truth
  const PANEL_COLORS = {
    header: 'sky' as const,
    step1: 'red' as const,
    step2: 'amber' as const,
    step3: 'indigo' as const,
    step4: 'fuchsia' as const,
  }

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
    <div className={cn('w-full', className)}>
      {/* Success Message for Public Variant */}
      {isPublicSuccess && successMessage ? (
        <Panel
          variant='content-panel'
          color='primary'
          icon={<CheckIcon size={24} />}
          className='mb-8'
          data-testid='tournament-form-success'
        >
          <p className='text-foreground-darker text-sm font-semibold'>
            {successMessage}
          </p>
        </Panel>
      ) : null}

      {/* Header for Admin Variant */}
      {!isPublicVariant ? (
        <Panel color={PANEL_COLORS.header} className='mb-8'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h2
                className={cn('text-2xl font-bold', getLatinTitleClass(i18n.language))}
              >
                {name ? name : t('tournaments.form.tournamentRegistration')}
              </h2>
              <p className='text-foreground mt-2'>
                {location
                  ? `${t('tournaments.form.location')} ${location}`
                  : t('tournaments.form.fillOutForm')}
              </p>
            </div>
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
        </Panel>
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
        <Panel
          variant='form-panel'
          color={PANEL_COLORS.step1}
          panelNumber={1}
          title={t('tournaments.form.basicInformation')}
          subtitle={t('tournaments.form.enterBasicDetails')}
        >
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
              color={PANEL_COLORS.step1}
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
              color={PANEL_COLORS.step1}
              disabled={isPublicSuccess}
            />
          </div>
        </Panel>

        {/* Step 2: Dates */}
        <Panel
          variant='form-panel'
          color={
            formMode === 'edit' || isPanelEnabled(2) ? PANEL_COLORS.step2 : 'slate'
          }
          panelNumber={2}
          disabled={formMode === 'create' ? !isPanelEnabled(2) : undefined}
          title={t('tournaments.form.dates')}
          subtitle={t('tournaments.form.selectDates')}
        >
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Start Date */}
            <CustomDatePicker
              name='startDate'
              label={t('tournaments.form.startDate')}
              value={startDate}
              onChange={event => setFormField('startDate', event.target.value)}
              onBlur={() => validateFieldOnBlur('startDate')}
              error={getTranslatedError(
                'startDate',
                isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
              )}
              required
              className={getLatinTextClass(i18n.language)}
              color={PANEL_COLORS.step2}
              readOnly={
                isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
              }
            />

            {/* End Date */}
            <CustomDatePicker
              name='endDate'
              label={t('tournaments.form.endDate')}
              value={endDate}
              onChange={event => setFormField('endDate', event.target.value)}
              onBlur={() => validateFieldOnBlur('endDate')}
              error={getTranslatedError(
                'endDate',
                isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
              )}
              className={getLatinTextClass(i18n.language)}
              color={PANEL_COLORS.step2}
              readOnly={
                isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
              }
            />
          </div>
        </Panel>

        {/* Step 3: Divisions */}
        <Panel
          variant='form-panel'
          color={
            formMode === 'edit' || isPanelEnabled(3) ? PANEL_COLORS.step3 : 'slate'
          }
          panelNumber={3}
          disabled={formMode === 'create' ? !isPanelEnabled(3) : undefined}
          title={t('tournaments.form.divisions')}
          subtitle={`${t('tournaments.form.selectDivisions')} (${selectedDivisions.length} ${t('tournaments.form.selected')})`}
        >
          <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
            {divisions.map(division => (
              <ToggleChip
                key={division}
                value={division}
                label={getDivisionLabelByValue(
                  division as Division,
                  i18n.language as 'en' | 'nl' | 'ar' | 'tr' | 'fr'
                )}
                selected={selectedDivisions.includes(division)}
                disabled={
                  (formMode === 'create' && !isPanelEnabled(3)) || isPublicSuccess
                }
                color={PANEL_COLORS.step3}
                onToggle={handleDivisionToggle}
                data-testid={`division-${division.toLowerCase()}`}
              />
            ))}
          </div>
          {getTranslatedError(
            'divisions',
            isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
          ) ? (
            <ErrorMessage panelColor={PANEL_COLORS.step3}>
              {getTranslatedError(
                'divisions',
                isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
              )}
            </ErrorMessage>
          ) : null}
        </Panel>

        {/* Step 4: Categories */}
        <Panel
          variant='form-panel'
          color={
            formMode === 'edit' || isPanelEnabled(4) ? PANEL_COLORS.step4 : 'slate'
          }
          panelNumber={4}
          disabled={formMode === 'create' ? !isPanelEnabled(4) : undefined}
          title={t('tournaments.form.categories')}
          subtitle={`${t('tournaments.form.selectCategories')} (${selectedCategories.length} ${t('tournaments.form.selected')})`}
        >
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6'>
            {categories.map(category => (
              <ToggleChip
                key={category}
                value={category}
                label={getCategoryLabelByValue(
                  category as Category,
                  i18n.language as 'en' | 'nl' | 'fr' | 'ar' | 'tr'
                )}
                selected={selectedCategories.includes(category)}
                disabled={
                  (formMode === 'create' && !isPanelEnabled(4)) || isPublicSuccess
                }
                color={PANEL_COLORS.step4}
                onToggle={handleCategoryToggle}
                data-testid={`category-${category.toLowerCase()}`}
              />
            ))}
          </div>
          {getTranslatedError(
            'categories',
            isPublicSuccess || (formMode === 'create' && !isPanelEnabled(4))
          ) ? (
            <ErrorMessage panelColor={PANEL_COLORS.step4}>
              {getTranslatedError(
                'categories',
                isPublicSuccess || (formMode === 'create' && !isPanelEnabled(4))
              )}
            </ErrorMessage>
          ) : null}
        </Panel>

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
