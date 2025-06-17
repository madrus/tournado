import { JSX, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import { Division } from '@prisma/client'

import { ComboField } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { useTeamFormValidation } from '~/hooks/useTeamFormValidation'
import { getDivisionLabel } from '~/lib/lib.helpers'
import type { TeamFormProps } from '~/lib/lib.types'
import { getLatinContentClass, getLatinTextClass } from '~/utils/rtlUtils'

import { ActionButton } from './buttons/ActionButton'

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

  // Use the custom validation hook
  const { displayErrors, handleSubmit, handleFieldBlur } = useTeamFormValidation({
    mode,
    formRef,
    serverErrors: errors,
  })

  // State for selected tournament (for division filtering)
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    formData.tournamentId || ''
  )
  useEffect(() => {
    setSelectedTournamentId(formData.tournamentId || '')
  }, [formData.tournamentId])
  // State for selected division (for className and value control)
  const [divisionValue, setDivisionValue] = useState<string>(formData.division || '')
  // Add state for category
  const [categoryValue, setCategoryValue] = useState<string>(formData.category || '')

  // Get available divisions for selected tournament
  const availableDivisions = selectedTournamentId
    ? tournaments.find(tournament => tournament.id === selectedTournamentId)
        ?.divisions || []
    : []

  // Get available categories for selected tournament
  const availableCategories = selectedTournamentId
    ? tournaments.find(tournament => tournament.id === selectedTournamentId)
        ?.categories || []
    : []

  // Check if all filter fields are filled to enable the next step
  const filtersComplete = selectedTournamentId && divisionValue && categoryValue
  const canProceedToDetails = filtersComplete

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
    <div className={`mx-auto max-w-6xl ${className}`}>
      {/* Success Message for Public Variant */}
      {isSuccess && isPublicVariant && successMessage ? (
        <div className='mb-8 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-lg'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100'>
                <svg
                  className='h-6 w-6 text-emerald-600'
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
              </div>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-semibold text-emerald-800'>{successMessage}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header for Admin Variant */}
      {!isPublicVariant ? (
        <div className='mb-8 rounded-xl border border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 p-6 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h1
                className={`text-2xl font-bold text-gray-900 ${getLatinTextClass(i18n.language)}`}
              >
                {formData.clubName && formData.teamName
                  ? `${formData.clubName} ${formData.teamName}`
                  : t('teams.form.teamRegistration')}
              </h1>
              <p className='mt-2 text-gray-600'>
                {formData.division
                  ? getDivisionLabel(formData.division as Division, i18n.language)
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
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Hidden fields */}
        {intent ? <input type='hidden' name='intent' value={intent} /> : null}

        {/* Step 1: Tournament Filters */}
        <div className='relative'>
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-lg lg:-left-6'>
            1
          </div>

          <div className='rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50/50 to-pink-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2 className='mb-2 text-xl font-bold text-red-800'>
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
                  value={selectedTournamentId}
                  onChange={event => {
                    setSelectedTournamentId(event.target.value)
                    // Reset dependent fields when tournament changes
                    setDivisionValue('')
                    setCategoryValue('')
                  }}
                  onBlur={event => handleFieldBlur('tournamentId', event.target.value)}
                  options={tournaments.map(tournament => ({
                    value: tournament.id,
                    label: `${tournament.name} - ${tournament.location}`,
                  }))}
                  placeholder={t('teams.form.selectTournament')}
                  error={displayErrors.tournamentId}
                  required
                  className={getLatinContentClass(i18n.language)}
                />
                {selectedTournamentId ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500'>
                    <svg
                      className='h-4 w-4 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                ) : null}
              </div>

              {/* Team Division */}
              <div className='relative'>
                <ComboField
                  name='division'
                  label={t('teams.form.division')}
                  value={divisionValue}
                  onChange={event => {
                    setDivisionValue(event.target.value)
                    // Reset category when division changes
                    setCategoryValue('')
                  }}
                  onBlur={event => handleFieldBlur('division', event.target.value)}
                  options={availableDivisions.map(division => ({
                    value: division,
                    label: getDivisionLabel(division as Division, i18n.language),
                  }))}
                  placeholder={t('teams.form.selectDivision')}
                  error={displayErrors.division}
                  required
                  disabled={!selectedTournamentId}
                  selectRef={teamClassRef}
                  className={!selectedTournamentId ? 'opacity-50' : ''}
                />
                {divisionValue ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500'>
                    <svg
                      className='h-4 w-4 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                ) : null}
              </div>

              {/* Team Category */}
              <div className='relative md:col-span-2 lg:col-span-1'>
                <ComboField
                  name='category'
                  label={t('teams.form.category')}
                  value={categoryValue}
                  onChange={event => setCategoryValue(event.target.value)}
                  onBlur={event => handleFieldBlur('category', event.target.value)}
                  options={availableCategories.map(category => ({
                    value: category,
                    label: category,
                  }))}
                  placeholder={t('teams.form.selectCategory')}
                  error={displayErrors.category}
                  required
                  disabled={!divisionValue}
                  className={`${getLatinContentClass(i18n.language)} ${!divisionValue ? 'opacity-50' : ''}`}
                />
                {categoryValue ? (
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500'>
                    <svg
                      className='h-4 w-4 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className='mt-6 flex items-center justify-center'>
              <div className='flex items-center space-x-2'>
                <div
                  className={`h-3 w-3 rounded-full transition-colors duration-300 ${selectedTournamentId ? 'bg-emerald-500' : 'bg-gray-300'}`}
                />
                <div
                  className={`h-3 w-3 rounded-full transition-colors duration-300 ${divisionValue ? 'bg-emerald-500' : 'bg-gray-300'}`}
                />
                <div
                  className={`h-3 w-3 rounded-full transition-colors duration-300 ${categoryValue ? 'bg-emerald-500' : 'bg-gray-300'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Team Details */}
        <div
          className={`relative transition-all duration-500 ${canProceedToDetails ? 'opacity-100' : 'pointer-events-none opacity-40'}`}
        >
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg lg:-left-6'>
            2
          </div>

          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            {/* Team Information Panel */}
            <div className='rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
              <div className='mb-6'>
                <h3 className='mb-2 text-xl font-bold text-blue-800'>
                  {t('teams.form.teamInfo')}
                </h3>
                <p className='text-sm text-blue-600'>
                  {t('teams.form.enterTeamDetails')}
                </p>
              </div>

              <div className='space-y-6'>
                {/* Club Name */}
                <TextInputField
                  name='clubName'
                  label={t('teams.form.clubName')}
                  defaultValue={formData.clubName || ''}
                  placeholder={t('teams.form.placeholders.clubName')}
                  readOnly={false}
                  required
                  error={displayErrors.clubName}
                  className={getLatinContentClass(i18n.language)}
                  onBlur={event => handleFieldBlur('clubName', event.target.value)}
                />

                {/* Team Name */}
                <TextInputField
                  ref={teamNameRef}
                  name='teamName'
                  label={t('teams.form.teamName')}
                  defaultValue={formData.teamName || ''}
                  placeholder={t('teams.form.placeholders.teamName')}
                  readOnly={false}
                  required
                  error={displayErrors.teamName}
                  className={getLatinContentClass(i18n.language)}
                  onBlur={event => handleFieldBlur('teamName', event.target.value)}
                />
              </div>
            </div>

            {/* Team Leader Information Panel */}
            <div className='rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
              <div className='mb-6'>
                <h3 className='mb-2 text-xl font-bold text-purple-800'>
                  {t('teams.form.teamLeaderInfo')}
                </h3>
                <p className='text-sm text-purple-600'>
                  {t('teams.form.enterContactDetails')}
                </p>
              </div>

              <div className='space-y-6'>
                {/* Team Leader Name */}
                <TextInputField
                  name='teamLeaderName'
                  label={t('teams.form.teamLeaderName')}
                  defaultValue={formData.teamLeaderName || ''}
                  placeholder={t('teams.form.placeholders.teamLeaderName')}
                  readOnly={false}
                  required
                  error={displayErrors.teamLeaderName}
                  className={getLatinContentClass(i18n.language)}
                  onBlur={event =>
                    handleFieldBlur('teamLeaderName', event.target.value)
                  }
                />

                {/* Team Leader Phone */}
                <TextInputField
                  name='teamLeaderPhone'
                  label={t('teams.form.teamLeaderPhone')}
                  type='tel'
                  defaultValue={formData.teamLeaderPhone || ''}
                  placeholder={t('teams.form.placeholders.teamLeaderPhone')}
                  readOnly={false}
                  required
                  error={displayErrors.teamLeaderPhone}
                  className={getLatinContentClass(i18n.language)}
                  onBlur={event =>
                    handleFieldBlur('teamLeaderPhone', event.target.value)
                  }
                />

                {/* Team Leader Email */}
                <TextInputField
                  name='teamLeaderEmail'
                  label={t('teams.form.teamLeaderEmail')}
                  type='email'
                  defaultValue={formData.teamLeaderEmail || ''}
                  placeholder={t('teams.form.placeholders.teamLeaderEmail')}
                  readOnly={false}
                  required
                  error={displayErrors.teamLeaderEmail}
                  className={getLatinContentClass(i18n.language)}
                  onBlur={event =>
                    handleFieldBlur('teamLeaderEmail', event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Agreement - only shown in create mode */}
        {showPrivacyAgreement ? (
          <div
            className={`transition-all duration-500 ${canProceedToDetails ? 'opacity-100' : 'pointer-events-none opacity-40'}`}
          >
            <div className='rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 p-6 shadow-sm'>
              <div className='flex items-start gap-4'>
                <input
                  type='checkbox'
                  name='privacyAgreement'
                  id='privacyAgreement'
                  className='mt-1 h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500'
                  aria-invalid={displayErrors.privacyAgreement ? true : undefined}
                  aria-errormessage={
                    displayErrors.privacyAgreement ? 'privacy-error' : undefined
                  }
                  onChange={event =>
                    handleFieldBlur('privacyAgreement', event.target.checked)
                  }
                />
                <label
                  htmlFor='privacyAgreement'
                  className='text-sm leading-relaxed text-gray-700'
                >
                  {t('teams.form.privacyAgreement')}
                </label>
              </div>
              {displayErrors.privacyAgreement ? (
                <div
                  className='mt-3 text-sm font-medium text-red-700'
                  id='privacy-error'
                >
                  {displayErrors.privacyAgreement}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Submit Buttons */}
        <div
          className={`flex flex-col gap-4 transition-all duration-500 lg:flex-row lg:justify-end lg:gap-3 ${canProceedToDetails ? 'opacity-100' : 'pointer-events-none opacity-40'}`}
        >
          {/* Cancel Button for Admin Variant */}
          {!isPublicVariant && onCancel ? (
            <ActionButton
              onClick={onCancel}
              variant='light'
              color='emerald'
              className='order-2 min-w-32 lg:order-1'
            >
              {t('common.cancel')}
            </ActionButton>
          ) : null}

          {/* Submit Button */}
          <ActionButton
            type='submit'
            variant='solid'
            color='emerald'
            className={`order-1 lg:order-2 ${isPublicVariant ? 'px-8 py-4 text-lg font-semibold' : 'min-w-40'} shadow-lg transition-all duration-300 hover:shadow-xl`}
          >
            {submitButtonText ||
              (isPublicVariant
                ? isSuccess
                  ? t('teams.form.createAnotherTeam')
                  : t('teams.form.createTeam')
                : mode === 'edit'
                  ? t('admin.teams.saveChanges')
                  : t('admin.teams.createTeam'))}
          </ActionButton>
        </div>
      </Form>
    </div>
  )
}
