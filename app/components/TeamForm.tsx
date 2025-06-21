import { JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, useNavigation } from 'react-router'

import { ComboField } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import type { Division } from '~/db.server'
import { getDivisionLabel } from '~/lib/lib.helpers'
import type { TeamFormProps } from '~/lib/lib.types'
import { useTeamFormStore, useTeamFormStoreHydration } from '~/stores/useTeamFormStore'
import { cn } from '~/utils/misc'
import { getLatinTextClass, getLatinTitleClass } from '~/utils/rtlUtils'

import { ActionButton } from './buttons/ActionButton'
import { ActionLinkButton } from './buttons/ActionLinkButton'
import { CheckIcon, RestorePageIcon } from './icons'

export function TeamForm({
  mode: formMode = 'create',
  variant,
  isSuccess = false,
  successMessage,
  showDeleteButton = false,
  onDelete,
  onCancel,
  className = '',
  intent,
  formData,
  submitButtonText,
}: Omit<
  TeamFormProps,
  'availableDivisions' | 'availableCategories' | 'tournamentId'
>): JSX.Element {
  const { t, i18n } = useTranslation()
  const formRef = useRef<HTMLFormElement>(null)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  // Ensure the team form store is properly hydrated
  useTeamFormStoreHydration()

  // Get all state from the form store
  const {
    formFields,
    initialFormFields,
    formFields: {
      tournamentId,
      division,
      category,
      clubName,
      teamName,
      teamLeaderName,
      teamLeaderPhone,
      teamLeaderEmail,
      privacyAgreement,
    },
    validation: { displayErrors, blurredFields, forceShowAllErrors, submitAttempted },
    formMeta: { mode },
    availableOptions: {
      tournaments: availableTournaments,
      divisions: availableDivisions,
      categories: availableCategories,
    },
    setFormField,
    setFormMetaField,
    setFormData,
    validateForm,
    validateFieldOnBlur,
    updateAvailableOptions,
    isPanelValid,
    isPanelEnabled,
    isFormReadyForSubmission,
  } = useTeamFormStore()

  // --- Panel Validity Logic ---
  // Panel enabling is handled directly in the JSX using isPanelEnabled() calls

  // Helper function to translate error keys to user-readable messages
  // Show errors for:
  // 1. Fields that have been blurred - for individual field validation
  // 2. All fields when forceShowAllErrors is true - for form submission validation
  // 3. All fields when submitAttempted is true - for form submission validation
  // Don't show errors for disabled fields
  const getTranslatedError = (
    fieldName: string,
    isDisabled = false
  ): string | undefined => {
    // Don't show errors for disabled fields
    if (isDisabled) return undefined

    // Show errors if field has been blurred OR if we're forcing all errors OR if form was submitted
    const shouldShowError =
      blurredFields[fieldName] || forceShowAllErrors || submitAttempted

    if (!shouldShowError) return undefined

    const errorKey = displayErrors[fieldName]
    if (!errorKey) return undefined

    // If the error is already a plain message (from server), return as-is
    if (!errorKey.includes('.')) return errorKey

    // Otherwise, translate the key
    return t(errorKey)
  }

  // Initialize mode in store
  useEffect(() => {
    if (formMode !== mode) {
      setFormMetaField('mode', formMode)
    }
  }, [formMode, mode, setFormMetaField])

  // Reset specific fields when switching to create mode to ensure clean state
  useEffect(() => {
    if (formMode === 'create') {
      // Clear team-specific fields for new team creation
      setFormField('clubName', '')
      setFormField('teamName', '')
      setFormField('privacyAgreement', false)
    }
  }, [formMode, setFormField])

  // Initialize form data in store when formData prop is provided
  useEffect(() => {
    if (formData) {
      // In edit mode, set form data immediately since we have all the data
      // In create mode, wait for tournaments to be loaded
      if (formMode === 'edit' || availableTournaments.length > 0) {
        setFormData({
          tournamentId: formData.tournamentId || '',
          clubName: formData.clubName || '',
          teamName: formData.teamName || '',
          division: formData.division || '',
          category: formData.category || '',
          teamLeaderName: formData.teamLeaderName || '',
          teamLeaderPhone: formData.teamLeaderPhone || '',
          teamLeaderEmail: formData.teamLeaderEmail || '',
          privacyAgreement: formData.privacyAgreement || false,
        })
        // Note: updateAvailableOptions() will be called by the second useEffect
        // when tournaments are loaded and tournamentId is set
      }
    }
  }, [formData, setFormData, formMode, availableTournaments.length])

  // When the list of available tournaments changes (i.e., is loaded from root),
  // check if a tournament is already selected (e.g., from persisted state).
  // If so, update the dependent dropdowns (divisions, categories).
  useEffect(() => {
    if (availableTournaments.length > 0 && tournamentId) {
      updateAvailableOptions()
    }
  }, [availableTournaments, tournamentId, updateAvailableOptions])

  // Handle form submission and validation
  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    const isValid = validateForm()

    if (!isValid) {
      formEvent.preventDefault()
    }
  }

  // Otherwise let Remix handle the submission normally

  const isPublicSuccess = isSuccess && variant === 'public'
  const isDirty = JSON.stringify(formFields) !== JSON.stringify(initialFormFields)

  return (
    <div className={`mx-auto max-w-6xl ${className}`}>
      {/* Success Message for Public Variant */}
      {isPublicSuccess && successMessage ? (
        <div className='mb-8 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-lg'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100'>
                <CheckIcon className='h-6 w-6 text-emerald-600' size={24} />
              </div>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-semibold text-emerald-800'>{successMessage}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header for Admin Variant */}
      {variant !== 'public' ? (
        <div className='mb-8 rounded-xl border-2 border-gray-300 bg-gradient-to-r from-slate-50 to-gray-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h2
                className={cn('text-2xl font-bold', getLatinTitleClass(i18n.language))}
              >
                {clubName && teamName
                  ? `${clubName} ${teamName}`
                  : t('teams.form.teamRegistration')}
              </h2>
              <p className='mt-2 text-gray-600'>
                {division
                  ? getDivisionLabel(division as Division, i18n.language)
                  : t('teams.form.fillOutForm')}
              </p>
            </div>
            {/* Delete Button for Admin Edit Mode */}
            {showDeleteButton && onDelete ? (
              <ActionButton
                onClick={onDelete}
                icon='delete'
                variant='outline'
                color='red'
                className='lg:self-start'
              >
                {t('common.actions.delete')}
              </ActionButton>
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
      >
        {/* Hidden fields */}
        {intent ? <input type='hidden' name='intent' value={intent} /> : null}

        {/* Step 1: Tournament Filters */}
        <div className='relative'>
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6'>
            1
          </div>

          <div className='rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50/50 to-pink-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold text-red-800',
                  getLatinTitleClass(i18n.language)
                )}
              >
                {t('teams.form.selectTournamentDetails')}
              </h2>
              <p className='text-sm text-red-600'>
                {t('teams.form.completeAllThreeFields')}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {/* Tournament Selection */}
              <div className='relative'>
                <ComboField
                  name='tournamentId'
                  label={t('teams.form.tournament')}
                  value={tournamentId}
                  onChange={value => {
                    setFormField('tournamentId', value)
                    setFormField('division', '')
                    setFormField('category', '')
                  }}
                  options={availableTournaments.map(tournament => ({
                    value: tournament.id,
                    label: `${tournament.name} - ${tournament.location}`,
                  }))}
                  placeholder={t('teams.form.selectTournament')}
                  error={getTranslatedError('tournamentId', isPublicSuccess)}
                  required
                  disabled={isPublicSuccess}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => validateFieldOnBlur('tournamentId')}
                />
                {tournamentId &&
                !getTranslatedError('tournamentId', isPublicSuccess) ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>

              {/* Division Selection */}
              <div className='relative'>
                <ComboField
                  name='division'
                  label={t('teams.form.division')}
                  value={division}
                  onChange={value => {
                    setFormField('division', value)
                    setFormField('category', '')
                  }}
                  options={availableDivisions.map(d => ({
                    value: d,
                    label: getDivisionLabel(d as Division, i18n.language),
                  }))}
                  placeholder={t('teams.form.selectDivision')}
                  error={getTranslatedError(
                    'division',
                    !tournamentId || isPublicSuccess
                  )}
                  required
                  disabled={!tournamentId || isPublicSuccess}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => validateFieldOnBlur('division')}
                />
                {division &&
                !getTranslatedError('division', !tournamentId || isPublicSuccess) ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>

              {/* Category Selection */}
              <div className='relative'>
                <ComboField
                  name='category'
                  label={t('teams.form.category')}
                  value={category}
                  onChange={value => setFormField('category', value)}
                  options={availableCategories.map(c => ({
                    value: c,
                    label: c,
                  }))}
                  placeholder={t('teams.form.selectCategory')}
                  error={getTranslatedError(
                    'category',
                    !tournamentId || !division || isPublicSuccess
                  )}
                  required
                  disabled={!tournamentId || !division || isPublicSuccess}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => validateFieldOnBlur('category')}
                />
                {category &&
                !getTranslatedError(
                  'category',
                  !tournamentId || !division || isPublicSuccess
                ) ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Team Information */}
        <div
          className={cn('relative transition-opacity duration-300', {
            'pointer-events-none opacity-50': !isPanelEnabled(2),
          })}
        >
          <div
            className={cn(
              'absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6',
              isPanelEnabled(2) ? 'bg-blue-600' : 'bg-gray-400'
            )}
          >
            2
          </div>

          <div
            className={cn(
              'rounded-xl border-2 p-6 shadow-lg transition-all duration-300 lg:p-8',
              isPanelEnabled(2)
                ? 'border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 hover:shadow-xl'
                : 'border-gray-200 bg-gray-50'
            )}
          >
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold',
                  getLatinTitleClass(i18n.language),
                  isPanelValid(1) ? 'text-blue-800' : 'text-gray-400'
                )}
              >
                {t('teams.form.teamInfo')}
              </h2>
              <p
                className={cn(
                  'text-sm',
                  isPanelValid(1) ? 'text-blue-600' : 'text-gray-400'
                )}
              >
                {t('teams.form.enterTeamDetails')}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Club Name */}
              <div className='relative'>
                <TextInputField
                  name='clubName'
                  label={t('teams.form.clubName')}
                  value={clubName || ''}
                  onChange={value => setFormField('clubName', value)}
                  placeholder={t('teams.form.placeholders.clubName')}
                  error={getTranslatedError(
                    'clubName',
                    isPublicSuccess || !isPanelValid(1)
                  )}
                  required
                  disabled={isPublicSuccess || !isPanelValid(1)}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => validateFieldOnBlur('clubName')}
                />
                {clubName && !getTranslatedError('clubName', !isPanelValid(1)) ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>

              {/* Team Name */}
              <div className='relative'>
                <TextInputField
                  name='teamName'
                  label={t('teams.form.teamName')}
                  value={teamName || ''}
                  onChange={value => setFormField('teamName', value)}
                  placeholder={t('teams.form.placeholders.teamName')}
                  error={getTranslatedError(
                    'teamName',
                    isPublicSuccess || !isPanelValid(1)
                  )}
                  required
                  disabled={isPublicSuccess || !isPanelValid(1)}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => validateFieldOnBlur('teamName')}
                />
                {teamName && !getTranslatedError('teamName', !isPanelValid(1)) ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Team Leader Information */}
        <div
          className={cn('relative transition-opacity duration-300', {
            'pointer-events-none opacity-50': !isPanelEnabled(3),
          })}
        >
          <div
            className={cn(
              'absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6',
              isPanelEnabled(3) ? 'bg-green-600' : 'bg-gray-400'
            )}
          >
            3
          </div>

          <div
            className={cn(
              'rounded-xl border-2 p-6 shadow-lg transition-all duration-300 lg:p-8',
              isPanelEnabled(3)
                ? 'border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30 hover:shadow-xl'
                : 'border-gray-200 bg-gray-50'
            )}
          >
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold',
                  getLatinTitleClass(i18n.language),
                  isPanelEnabled(3) ? 'text-green-800' : 'text-gray-400'
                )}
              >
                {t('teams.form.teamLeaderInfo')}
              </h2>
              <p
                className={cn(
                  'text-sm',
                  isPanelEnabled(3) ? 'text-green-600' : 'text-gray-400'
                )}
              >
                {t('teams.form.enterContactDetails')}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {/* Team Leader Name */}
              <div className='relative'>
                <TextInputField
                  name='teamLeaderName'
                  label={t('teams.form.teamLeaderName')}
                  value={teamLeaderName || ''}
                  onChange={value => setFormField('teamLeaderName', value)}
                  placeholder={t('teams.form.placeholders.teamLeaderName')}
                  error={getTranslatedError(
                    'teamLeaderName',
                    isPublicSuccess || !isPanelEnabled(3)
                  )}
                  required
                  disabled={isPublicSuccess || !isPanelEnabled(3)}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => validateFieldOnBlur('teamLeaderName')}
                />
                {teamLeaderName &&
                !getTranslatedError(
                  'teamLeaderName',
                  isPublicSuccess || !isPanelEnabled(3)
                ) ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>

              {/* Team Leader Phone */}
              <div className='relative'>
                <TextInputField
                  name='teamLeaderPhone'
                  label={t('teams.form.teamLeaderPhone')}
                  value={teamLeaderPhone || ''}
                  onChange={value => setFormField('teamLeaderPhone', value)}
                  placeholder={t('teams.form.placeholders.teamLeaderPhone')}
                  error={getTranslatedError(
                    'teamLeaderPhone',
                    isPublicSuccess || !isPanelEnabled(3)
                  )}
                  required
                  type='tel'
                  disabled={isPublicSuccess || !isPanelEnabled(3)}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => validateFieldOnBlur('teamLeaderPhone')}
                />
                {teamLeaderPhone &&
                !getTranslatedError(
                  'teamLeaderPhone',
                  isPublicSuccess || !isPanelEnabled(3)
                ) ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>

              {/* Team Leader Email */}
              <div className='relative'>
                <TextInputField
                  name='teamLeaderEmail'
                  label={t('teams.form.teamLeaderEmail')}
                  value={teamLeaderEmail || ''}
                  onChange={value => setFormField('teamLeaderEmail', value)}
                  placeholder={t('teams.form.placeholders.teamLeaderEmail')}
                  error={getTranslatedError(
                    'teamLeaderEmail',
                    isPublicSuccess || !isPanelEnabled(3)
                  )}
                  required
                  type='email'
                  disabled={isPublicSuccess || !isPanelEnabled(3)}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => validateFieldOnBlur('teamLeaderEmail')}
                />
                {teamLeaderEmail &&
                !getTranslatedError(
                  'teamLeaderEmail',
                  isPublicSuccess || !isPanelEnabled(3)
                ) ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Privacy Agreement (Create Mode Only) */}
        {mode === 'create' ? (
          <div
            className={cn('relative transition-opacity duration-300', {
              'pointer-events-none opacity-50': !isPanelEnabled(4),
            })}
          >
            <div
              className={cn(
                'absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6',
                isPanelEnabled(4) ? 'bg-purple-600' : 'bg-gray-400'
              )}
            >
              4
            </div>

            <div
              className={cn(
                'rounded-xl border-2 p-6 shadow-lg transition-all duration-300 lg:p-8',
                isPanelEnabled(4)
                  ? 'border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 hover:shadow-xl'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className='mb-6'>
                <h2
                  className={cn(
                    'mb-2 text-xl font-bold',
                    getLatinTitleClass(i18n.language),
                    isPanelEnabled(4) ? 'text-purple-800' : 'text-gray-400'
                  )}
                >
                  {t('teams.form.privacyPolicy')}
                </h2>
                <p
                  className={cn(
                    'text-sm',
                    isPanelEnabled(4) ? 'text-purple-600' : 'text-gray-400'
                  )}
                >
                  {t('teams.form.readAndAccept')}
                </p>
              </div>

              <label
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all duration-300',
                  privacyAgreement
                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                    : getTranslatedError(
                          'privacyAgreement',
                          isPublicSuccess || !isPanelEnabled(4)
                        )
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                )}
              >
                <div className='relative flex-shrink-0'>
                  <input
                    type='checkbox'
                    name='privacyAgreement'
                    checked={privacyAgreement}
                    onChange={checkboxEvent =>
                      setFormField('privacyAgreement', checkboxEvent.target.checked)
                    }
                    onBlur={() => validateFieldOnBlur('privacyAgreement')}
                    className={cn(
                      'peer h-5 w-5 cursor-pointer appearance-none rounded border-2 transition-all duration-300',
                      privacyAgreement
                        ? 'border-purple-500 bg-purple-500'
                        : getTranslatedError(
                              'privacyAgreement',
                              isPublicSuccess || !isPanelEnabled(4)
                            )
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 bg-white'
                    )}
                    required
                    disabled={isPublicSuccess || !isPanelEnabled(4)}
                  />
                  {privacyAgreement ? (
                    <CheckIcon
                      className='pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 text-white'
                      size={16}
                    />
                  ) : null}
                </div>
                <span
                  className={cn(
                    'text-lg font-normal text-gray-600',
                    getLatinTextClass(i18n.language)
                  )}
                >
                  {t('teams.form.agreeToPrivacyPolicy')}
                </span>
              </label>
              {getTranslatedError(
                'privacyAgreement',
                isPublicSuccess || !isPanelEnabled(4)
              ) ? (
                <p className='mt-2 text-sm text-red-600'>
                  {getTranslatedError(
                    'privacyAgreement',
                    isPublicSuccess || !isPanelEnabled(4)
                  )}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Submit and Action Buttons */}
        <div className='flex flex-col gap-4 md:flex-row md:justify-end'>
          {onCancel ? (
            <ActionButton
              type='button'
              onClick={onCancel}
              variant='outline'
              color='gray'
              className='min-w-32'
            >
              <RestorePageIcon className='mr-2 h-6 w-6' size={24} />
              {t('common.actions.reset')}
            </ActionButton>
          ) : null}
          {isPublicSuccess ? (
            <ActionLinkButton
              to='/teams/new'
              variant='emerald'
              icon='add'
              label={t('teams.form.createAnotherTeam')}
            />
          ) : null}
          <ActionButton
            type='submit'
            variant='solid'
            color='red'
            icon='check_circle'
            aria-label={t('common.actions.save')}
            className='min-w-32'
            disabled={
              isSubmitting ||
              isPublicSuccess ||
              !isFormReadyForSubmission() ||
              (mode === 'edit' && !isDirty)
            }
          >
            {isSubmitting
              ? t('common.actions.saving')
              : submitButtonText || t('common.actions.save')}
          </ActionButton>
        </div>
      </Form>
    </div>
  )
}
