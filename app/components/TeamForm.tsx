import { JSX, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import { Division } from '@prisma/client'

import { ComboField } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { useTeamFormValidation } from '~/hooks/useTeamFormValidation'
import { getDivisionLabel } from '~/lib/lib.helpers'
import type { TeamFormProps } from '~/lib/lib.types'
import { getLatinTextClass } from '~/utils/rtlUtils'

import { DeleteButton } from './buttons/DeleteButton'

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
              <h1 className={`text-xl font-bold ${getLatinTextClass(i18n.language)}`}>
                {formData.clubName && formData.teamName
                  ? `${formData.clubName} ${formData.teamName}`
                  : ''}
              </h1>
              <p className='text-foreground-light mt-2'>
                {formData.division
                  ? getDivisionLabel(formData.division as Division, i18n.language)
                  : ''}
              </p>
            </div>
            {/* Delete Button for Admin Edit Mode */}
            {showDeleteButton && onDelete ? (
              <DeleteButton onClick={onDelete} label={t('teams.deleteTeam')} />
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
            <h3 className='mb-6 text-lg font-semibold'>{t('teams.form.teamInfo')}</h3>

            {/* Tournament Selection */}
            <ComboField
              name='tournamentId'
              label={t('teams.form.tournament')}
              value={selectedTournamentId}
              onChange={event => setSelectedTournamentId(event.target.value)}
              onBlur={event => handleFieldBlur('tournamentId', event.target.value)}
              options={tournaments.map(tournament => ({
                value: tournament.id,
                label: `${tournament.name} - ${tournament.location} (${new Date(tournament.startDate).toLocaleDateString()})`,
              }))}
              placeholder={t('teams.form.selectTournament')}
              error={displayErrors.tournamentId}
              required
            />

            {/* Club Name */}
            <TextInputField
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

            {/* Team Category */}
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
            />

            {/* Team Class */}
            <ComboField
              name='division'
              label={t('teams.form.division')}
              value={divisionValue}
              onChange={event => setDivisionValue(event.target.value)}
              onBlur={event => handleFieldBlur('division', event.target.value)}
              options={availableDivisions.map(division => ({
                value: division,
                label: getDivisionLabel(division as Division, i18n.language),
              }))}
              placeholder={t('teams.form.selectDivision')}
              error={displayErrors.division}
              required
              selectRef={teamClassRef}
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
              className='mb-4'
              onBlur={event => handleFieldBlur('teamName', event.target.value)}
            />
          </div>

          {/* Team Leader Information Panel */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-semibold'>
              {t('teams.form.teamLeaderInfo')}
            </h3>

            {/* Team Leader Name */}
            <TextInputField
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
            <TextInputField
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
            <TextInputField
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
