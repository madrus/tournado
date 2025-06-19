import { JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import { Division } from '@prisma/client'

import { ComboField } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { getDivisionLabel } from '~/lib/lib.helpers'
import type { TeamFormProps } from '~/lib/lib.types'
import { useTeamFormStore } from '~/stores/useTeamFormStore'
import { cn } from '~/utils/misc'
import { getLatinTextClass, getLatinTitleClass } from '~/utils/rtlUtils'

import { ActionButton } from './buttons/ActionButton'
import { CheckIcon } from './icons'

export function TeamForm({
  mode: formMode = 'create',
  variant,
  isSuccess = false,
  successMessage,
  showDeleteButton = false,
  onDelete,
  className = '',
  intent,
  formData,
  submitButtonText,
}: TeamFormProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const formRef = useRef<HTMLFormElement>(null)

  // Zustand store destructure - get all needed properties
  const {
    // Form field values
    tournamentId,
    division,
    category,
    clubName,
    teamName,
    teamLeaderName,
    teamLeaderPhone,
    teamLeaderEmail,
    privacyAgreement,
    // Validation state
    displayErrors,
    // Stores
    availableTournaments,
    availableDivisions,
    availableCategories,
    // Actions
    setTournamentId,
    setDivision,
    setCategory,
    setClubName,
    setTeamName,
    setTeamLeaderName,
    setTeamLeaderPhone,
    setTeamLeaderEmail,
    setPrivacyAgreement,
    setFieldTouched,
    setFormData,
    validateForm,
    // Form metadata
    mode,
    setMode,
  } = useTeamFormStore()

  // Helper function to translate error keys to user-readable messages
  const getTranslatedError = (fieldName: string): string | undefined => {
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
      setMode(formMode)
    }
  }, [formMode, mode, setMode])

  // Initialize form data in store when formData prop is provided
  useEffect(() => {
    if (formData && availableTournaments.length > 0) {
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
    }
  }, [formData, setFormData, availableTournaments.length])

  // Handle form submission and validation
  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    // If this is for testing or validation, prevent default and validate
    if (!intent) {
      formEvent.preventDefault()
      validateForm()
      return
    }
    // Otherwise let Remix handle the submission normally
  }

  return (
    <div className={`mx-auto max-w-6xl ${className}`}>
      {/* Success Message for Public Variant */}
      {isSuccess && variant === 'public' && successMessage ? (
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
                {t('teams.deleteTeam')}
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
                    setTournamentId(value)
                    setDivision('')
                    setCategory('')
                  }}
                  options={availableTournaments.map(tournament => ({
                    value: tournament.id,
                    label: `${tournament.name} - ${tournament.location}`,
                  }))}
                  placeholder={t('teams.form.selectTournament')}
                  error={getTranslatedError('tournamentId')}
                  required
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => setFieldTouched('tournamentId')}
                />
                {tournamentId && !getTranslatedError('tournamentId') ? (
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
                  onChange={setDivision}
                  options={availableDivisions.map(d => ({
                    value: d,
                    label: getDivisionLabel(d as Division, i18n.language),
                  }))}
                  placeholder={t('teams.form.selectDivision')}
                  error={getTranslatedError('division')}
                  required
                  disabled={!tournamentId}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => setFieldTouched('division')}
                />
                {division && !getTranslatedError('division') ? (
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
                  onChange={setCategory}
                  options={availableCategories.map(c => ({
                    value: c,
                    label: c,
                  }))}
                  placeholder={t('teams.form.selectCategory')}
                  error={getTranslatedError('category')}
                  required
                  disabled={!tournamentId}
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => setFieldTouched('category')}
                />
                {category && !getTranslatedError('category') ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Team Information */}
        <div className='relative'>
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6'>
            2
          </div>

          <div className='rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold text-blue-800',
                  getLatinTitleClass(i18n.language)
                )}
              >
                {t('teams.form.teamInfo')}
              </h2>
              <p className='text-sm text-blue-600'>
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
                  onChange={setClubName}
                  placeholder={t('teams.form.placeholders.clubName')}
                  error={getTranslatedError('clubName')}
                  required
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => setFieldTouched('clubName')}
                />
                {clubName && !getTranslatedError('clubName') ? (
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
                  onChange={setTeamName}
                  placeholder={t('teams.form.placeholders.teamName')}
                  error={getTranslatedError('teamName')}
                  required
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => setFieldTouched('teamName')}
                />
                {teamName && !getTranslatedError('teamName') ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 rtl:right-auto rtl:-left-2'>
                    <CheckIcon className='h-4 w-4 text-white' size={16} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Team Leader Information */}
        <div className='relative'>
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6'>
            3
          </div>

          <div className='rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold text-green-800',
                  getLatinTitleClass(i18n.language)
                )}
              >
                {t('teams.form.teamLeaderInfo')}
              </h2>
              <p className='text-sm text-green-600'>
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
                  onChange={setTeamLeaderName}
                  placeholder={t('teams.form.placeholders.teamLeaderName')}
                  error={getTranslatedError('teamLeaderName')}
                  required
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => setFieldTouched('teamLeaderName')}
                />
                {teamLeaderName && !getTranslatedError('teamLeaderName') ? (
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
                  onChange={setTeamLeaderPhone}
                  placeholder={t('teams.form.placeholders.teamLeaderPhone')}
                  error={getTranslatedError('teamLeaderPhone')}
                  required
                  type='tel'
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => setFieldTouched('teamLeaderPhone')}
                />
                {teamLeaderPhone && !getTranslatedError('teamLeaderPhone') ? (
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
                  onChange={setTeamLeaderEmail}
                  placeholder={t('teams.form.placeholders.teamLeaderEmail')}
                  error={getTranslatedError('teamLeaderEmail')}
                  required
                  type='email'
                  className={getLatinTextClass(i18n.language)}
                  onBlur={() => setFieldTouched('teamLeaderEmail')}
                />
                {teamLeaderEmail && !getTranslatedError('teamLeaderEmail') ? (
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
          <div className='relative'>
            <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6'>
              4
            </div>

            <div className='rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
              <div className='mb-6'>
                <h2
                  className={cn(
                    'mb-2 text-xl font-bold text-purple-800',
                    getLatinTitleClass(i18n.language)
                  )}
                >
                  {t('teams.form.privacyPolicy')}
                </h2>
                <p className='text-sm text-purple-600'>
                  {t('teams.form.readAndAccept')}
                </p>
              </div>

              <label
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all duration-300',
                  privacyAgreement
                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                    : getTranslatedError('privacyAgreement')
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
                      setPrivacyAgreement(checkboxEvent.target.checked)
                    }
                    onBlur={() => setFieldTouched('privacyAgreement')}
                    className={cn(
                      'peer h-5 w-5 cursor-pointer appearance-none rounded border-2 transition-all duration-300',
                      privacyAgreement
                        ? 'border-purple-500 bg-purple-500'
                        : getTranslatedError('privacyAgreement')
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 bg-white'
                    )}
                    required
                  />
                  {privacyAgreement ? (
                    <CheckIcon
                      className='pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 text-white'
                      size={16}
                    />
                  ) : null}
                </div>
                <span className='text-sm font-medium'>
                  {t('teams.form.agreeToPrivacyPolicy')}
                </span>
              </label>
              {getTranslatedError('privacyAgreement') ? (
                <p className='mt-2 text-sm text-red-600'>
                  {getTranslatedError('privacyAgreement')}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Submit and Action Buttons */}
        <div className='flex flex-col gap-4 md:flex-row md:justify-end'>
          {variant === 'admin' && mode === 'edit' ? (
            <ActionButton type='button' onClick={() => window.history.back()}>
              {t('common.actions.cancel')}
            </ActionButton>
          ) : null}
          <ActionButton type='submit' variant='solid' className='md:ml-auto'>
            {submitButtonText || t('teams.form.submit')}
          </ActionButton>
        </div>
      </Form>
    </div>
  )
}
