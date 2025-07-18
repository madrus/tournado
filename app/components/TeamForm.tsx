import { JSX, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, useNavigation } from 'react-router'

import { CheckboxAgreementField } from '~/components/inputs/CheckboxAgreementField'
import { ComboField } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { PanelOld as Panel } from '~/components/PanelOld'
import { FieldStatusIcon } from '~/components/shared/FieldStatusIcon'
import {
  panelDescriptionVariants,
  panelTitleVariants,
} from '~/components/shared/panel.variants'
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

  // Panel color constants - single source of truth
  const PANEL_COLORS = {
    header: 'sky' as const,
    step1: 'red' as const,
    step2: 'amber' as const,
    step3: 'indigo' as const,
    step4: 'fuchsia' as const,
  }

  // Ensure the team form store is properly hydrated
  useTeamFormStoreHydration()

  // Get all state from the form store
  const {
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
    isPanelEnabled,
    isFormReadyForSubmission,
    isDirty,
  } = useTeamFormStore()

  // --- Panel Validity Logic ---
  // Panel enabling is handled directly in the JSX using isPanelEnabled() calls

  // Helper function to translate error keys to user-readable messages
  // Show errors for:
  // 1. Fields that have been blurred - for individual field validation
  // 2. All fields when forceShowAllErrors is true - for form submission validation
  // 3. All fields when submitAttempted is true - for form submission validation
  // Don't show errors for disabled fields
  const getTranslatedError = useCallback(
    (fieldName: string, isDisabled = false): string | undefined => {
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
    },
    [blurredFields, forceShowAllErrors, submitAttempted, displayErrors, t]
  )

  // Helper function to get field status (success/error/neutral)
  const getFieldStatus = useCallback(
    (
      fieldName: string,
      fieldValue: string | boolean,
      isDisabled = false
    ): 'success' | 'error' | 'neutral' => {
      // Don't show any status for disabled fields
      if (isDisabled) return 'neutral'

      // Check if field has a value
      const hasValue = Boolean(fieldValue)

      // Check if field has an error
      const hasError = Boolean(getTranslatedError(fieldName, isDisabled))

      // Return appropriate status
      if (hasValue && !hasError) return 'success'
      if (hasError) return 'error'
      return 'neutral'
    },
    [getTranslatedError]
  )

  // Initialize mode in store
  useEffect(() => {
    if (mode !== formMode) {
      setFormMetaField('mode', formMode)
    }
  }, [mode, formMode, setFormMetaField])

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

  // Handle client-side form submission and validation
  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    const isValid = validateForm()

    if (!isValid) {
      formEvent.preventDefault()
    }
  }

  // Otherwise let React Router handle the submission normally

  const isPublicSuccess = isSuccess && variant === 'public'

  return (
    <div className={cn('w-full', className)}>
      {/* Success Message for Public Variant */}
      {isPublicSuccess && successMessage ? (
        <div className='border-accent from-accent-50 via-accent-100 to-accent-50 mb-8 rounded-xl border bg-gradient-to-r p-6 shadow-lg'>
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
      {variant !== 'public' ? (
        <Panel color={PANEL_COLORS.header} className='mb-8'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h2
                className={cn('text-2xl font-bold', getLatinTitleClass(i18n.language))}
              >
                {clubName && teamName
                  ? `${clubName} ${teamName}`
                  : t('teams.form.teamRegistration')}
              </h2>
              <p className='text-foreground mt-2'>
                {division
                  ? getDivisionLabel(division as Division, i18n.language)
                  : t('teams.form.fillOutForm')}
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
        </Panel>
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
        <Panel color={PANEL_COLORS.step1} panelNumber={1} className='pb-4 lg:p-8'>
          <div className='mb-6'>
            <h2
              className={cn(
                panelTitleVariants({ size: 'md', color: PANEL_COLORS.step1 }),
                getLatinTitleClass(i18n.language)
              )}
            >
              {t('teams.form.selectTournamentDetails')}
            </h2>
            <p className={panelDescriptionVariants()}>
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
                  // Only clear dependent fields in create mode
                  // In edit mode, preserve existing values
                  if (formMode === 'create') {
                    setFormField('division', '')
                    setFormField('category', '')
                  }
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
                color={PANEL_COLORS.step1}
                onBlur={() => validateFieldOnBlur('tournamentId')}
              />
              <FieldStatusIcon
                status={getFieldStatus('tournamentId', tournamentId, isPublicSuccess)}
              />
            </div>

            {/* Division Selection */}
            <div className='relative'>
              <ComboField
                name='division'
                label={t('teams.form.division')}
                value={division}
                onChange={value => {
                  setFormField('division', value)
                  // Only clear dependent fields in create mode
                  // In edit mode, preserve existing values
                  if (formMode === 'create') {
                    setFormField('category', '')
                  }
                }}
                options={availableDivisions.map(d => ({
                  value: d,
                  label: getDivisionLabel(d as Division, i18n.language),
                }))}
                placeholder={t('teams.form.selectDivision')}
                error={getTranslatedError('division', !tournamentId || isPublicSuccess)}
                required
                disabled={!tournamentId || isPublicSuccess}
                className={getLatinTextClass(i18n.language)}
                color={PANEL_COLORS.step1}
                onBlur={() => validateFieldOnBlur('division')}
              />
              <FieldStatusIcon
                status={getFieldStatus(
                  'division',
                  division,
                  !tournamentId || isPublicSuccess
                )}
              />
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
                color={PANEL_COLORS.step1}
                onBlur={() => validateFieldOnBlur('category')}
              />
              <FieldStatusIcon
                status={getFieldStatus(
                  'category',
                  category,
                  !tournamentId || !division || isPublicSuccess
                )}
              />
            </div>
          </div>
        </Panel>

        {/* Step 2: Team Information */}
        <Panel
          color={PANEL_COLORS.step2}
          panelNumber={2}
          disabled={formMode === 'create' ? !isPanelEnabled(2) : undefined}
          className='lg:p-8'
        >
          <div className='mb-6'>
            <h2
              className={cn(
                panelTitleVariants({
                  size: 'md',
                  color:
                    formMode === 'edit' || isPanelEnabled(2)
                      ? PANEL_COLORS.step2
                      : 'slate',
                }),
                getLatinTitleClass(i18n.language)
              )}
            >
              {t('teams.form.teamInfo')}
            </h2>
            <p
              className={cn(
                panelDescriptionVariants(),
                formMode === 'edit' || isPanelEnabled(2)
                  ? 'text-foreground'
                  : 'text-foreground-lighter'
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
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
                )}
                required
                disabled={
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
                }
                className={getLatinTextClass(i18n.language)}
                color={PANEL_COLORS.step2}
                onBlur={() => validateFieldOnBlur('clubName')}
              />
              <FieldStatusIcon
                status={getFieldStatus(
                  'clubName',
                  clubName || '',
                  formMode === 'create' && !isPanelEnabled(2)
                )}
              />
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
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
                )}
                required
                disabled={
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
                }
                className={getLatinTextClass(i18n.language)}
                color={PANEL_COLORS.step2}
                onBlur={() => validateFieldOnBlur('teamName')}
              />
              <FieldStatusIcon
                status={getFieldStatus(
                  'teamName',
                  teamName || '',
                  formMode === 'create' && !isPanelEnabled(2)
                )}
              />
            </div>
          </div>
        </Panel>

        {/* Step 3: Team Leader Information */}
        <Panel
          color={PANEL_COLORS.step3}
          panelNumber={3}
          disabled={formMode === 'create' ? !isPanelEnabled(3) : undefined}
          className='lg:p-8'
        >
          <div className='mb-6'>
            <h2
              className={cn(
                panelTitleVariants({
                  size: 'md',
                  color:
                    formMode === 'edit' || isPanelEnabled(3)
                      ? PANEL_COLORS.step3
                      : 'slate',
                }),
                getLatinTitleClass(i18n.language)
              )}
            >
              {t('teams.form.teamLeaderInfo')}
            </h2>
            <p
              className={cn(
                panelDescriptionVariants(),
                formMode === 'edit' || isPanelEnabled(3)
                  ? 'text-foreground'
                  : 'text-foreground-lighter'
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
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                )}
                required
                disabled={
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                }
                className={getLatinTextClass(i18n.language)}
                color={PANEL_COLORS.step3}
                onBlur={() => validateFieldOnBlur('teamLeaderName')}
              />
              <FieldStatusIcon
                status={getFieldStatus(
                  'teamLeaderName',
                  teamLeaderName || '',
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                )}
              />
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
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                )}
                required
                type='tel'
                disabled={
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                }
                className={getLatinTextClass(i18n.language)}
                color={PANEL_COLORS.step3}
                onBlur={() => validateFieldOnBlur('teamLeaderPhone')}
              />
              <FieldStatusIcon
                status={getFieldStatus(
                  'teamLeaderPhone',
                  teamLeaderPhone || '',
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                )}
              />
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
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                )}
                required
                type='email'
                disabled={
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                }
                className={getLatinTextClass(i18n.language)}
                color={PANEL_COLORS.step3}
                onBlur={() => validateFieldOnBlur('teamLeaderEmail')}
              />
              <FieldStatusIcon
                status={getFieldStatus(
                  'teamLeaderEmail',
                  teamLeaderEmail || '',
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
                )}
              />
            </div>
          </div>
        </Panel>

        {/* Step 4: Privacy Agreement (Create Mode Only) */}
        {mode === 'create' ? (
          <Panel
            color={PANEL_COLORS.step4}
            panelNumber={4}
            disabled={formMode === 'create' ? !isPanelEnabled(4) : undefined}
            className='lg:p-8'
          >
            <div className='mb-6'>
              <h2
                className={cn(
                  panelTitleVariants({
                    size: 'md',
                    color:
                      formMode === 'edit' || isPanelEnabled(4)
                        ? PANEL_COLORS.step4
                        : 'slate',
                  }),
                  getLatinTitleClass(i18n.language)
                )}
              >
                {t('teams.form.privacyPolicy')}
              </h2>
              <p
                className={cn(
                  panelDescriptionVariants(),
                  formMode === 'edit' || isPanelEnabled(4)
                    ? 'text-foreground'
                    : 'text-foreground-lighter'
                )}
              >
                {t('teams.form.readAndAccept')}
              </p>
            </div>

            <div className='relative'>
              <CheckboxAgreementField
                name='privacyAgreement'
                checked={privacyAgreement}
                label={t('teams.form.agreeToPrivacyPolicy')}
                description={t('teams.form.readAndAccept')}
                error={getTranslatedError(
                  'privacyAgreement',
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(4))
                )}
                required
                disabled={
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(4))
                }
                onChange={(checked: boolean) =>
                  setFormField('privacyAgreement', checked)
                }
                onBlur={() => validateFieldOnBlur('privacyAgreement')}
                language={i18n.language}
                color={PANEL_COLORS.step4}
              />
              <FieldStatusIcon
                status={getFieldStatus(
                  'privacyAgreement',
                  privacyAgreement,
                  isPublicSuccess || (formMode === 'create' && !isPanelEnabled(4))
                )}
              />
            </div>
          </Panel>
        ) : null}

        {/* Submit and Action Buttons */}
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
            {isPublicSuccess ? (
              <ActionLinkButton
                to='/teams/new'
                variant='primary'
                color='emerald'
                icon='add'
                label={t('teams.form.createAnotherTeam')}
              />
            ) : null}
            <ActionButton
              type='submit'
              variant='primary'
              color='brand'
              icon='check_circle'
              aria-label={t('common.actions.save')}
              disabled={
                isSubmitting ||
                isPublicSuccess ||
                !isFormReadyForSubmission() ||
                (mode === 'edit' && !isDirty())
              }
            >
              {isSubmitting
                ? t('common.actions.saving')
                : submitButtonText || t('common.actions.save')}
            </ActionButton>
          </div>
        </div>
      </Form>
    </div>
  )
}
