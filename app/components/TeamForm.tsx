import { JSX, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import { InputField } from '~/components/InputField'
import type { TournamentData } from '~/lib/lib.types'
import { divisionLabels } from '~/utils/division'

export type TeamFormMode = 'create' | 'edit'
export type TeamFormVariant = 'public' | 'admin'

export interface TeamFormData {
  clubName: string
  teamName: string
  division: string
  teamLeaderName?: string
  teamLeaderPhone?: string
  teamLeaderEmail?: string
  tournamentId?: string
}

export interface TeamFormProps {
  mode: TeamFormMode
  variant: TeamFormVariant
  formData?: Partial<TeamFormData>
  tournaments?: Array<TournamentData>
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
  const { t } = useTranslation()
  const teamNameRef = useRef<HTMLInputElement>(null)
  const teamClassRef = useRef<HTMLSelectElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // State for selected tournament (for division filtering)
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    formData.tournamentId || ''
  )

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
  const showTournamentSelection = mode === 'create'
  const showTeamLeaderInfo = mode === 'create'
  const showPrivacyAgreement = mode === 'create'

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

      <Form ref={formRef} method='post' className='space-y-8'>
        {/* Hidden fields */}
        {intent ? <input type='hidden' name='intent' value={intent} /> : null}

        {/* Form Content */}
        {isPublicVariant ? (
          /* Public Form Layout - Responsive Panels */
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            {/* Team Information Panel */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h3 className='mb-6 text-lg font-semibold text-gray-900'>
                {t('teams.form.teamInfo')}
              </h3>

              {/* Tournament Selection */}
              {showTournamentSelection ? (
                <div className='mb-4'>
                  <label className='flex w-full flex-col gap-1'>
                    <span className='font-medium'>{t('teams.form.tournament')}</span>
                    <select
                      name='tournamentId'
                      defaultValue={formData.tournamentId || ''}
                      onChange={event => setSelectedTournamentId(event.target.value)}
                      className='h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6'
                      aria-invalid={errors.tournamentId ? true : undefined}
                      aria-errormessage={
                        errors.tournamentId ? 'tournamentId-error' : undefined
                      }
                    >
                      <option value=''>{t('teams.form.selectTournament')}</option>
                      {tournaments.map(tournament => (
                        <option key={tournament.id} value={tournament.id}>
                          {tournament.name} - {tournament.location} (
                          {new Date(tournament.startDate).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </label>
                  {errors.tournamentId ? (
                    <div className='pt-1 text-red-700' id='tournamentId-error'>
                      {t('teams.form.tournamentRequired')}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Club Name */}
              <InputField
                name='clubName'
                label={t('teams.form.clubName')}
                defaultValue={formData.clubName || ''}
                readOnly={false}
                required
                error={errors.clubName ? t('teams.form.clubNameRequired') : undefined}
                className='mb-4'
              />

              {/* Team Name */}
              <InputField
                ref={teamNameRef}
                name='teamName'
                label={t('teams.form.teamName')}
                defaultValue={formData.teamName || ''}
                readOnly={false}
                required
                error={errors.teamName ? t('teams.form.teamNameRequired') : undefined}
                className='mb-4'
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
                    className='h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6'
                    aria-invalid={errors.division ? true : undefined}
                    aria-errormessage={errors.division ? 'division-error' : undefined}
                  >
                    <option value=''>{t('teams.form.selectDivision')}</option>
                    {availableDivisions.map(division => (
                      <option key={division} value={division}>
                        {divisionLabels[division].nl} ({divisionLabels[division].en})
                      </option>
                    ))}
                  </select>
                </label>
                {errors.division ? (
                  <div className='pt-1 text-red-700' id='division-error'>
                    {t('teams.form.teamClassRequired')}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Team Leader Information Panel */}
            {showTeamLeaderInfo ? (
              <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
                <h3 className='mb-6 text-lg font-semibold text-gray-900'>
                  {t('teams.form.teamLeaderInfo')}
                </h3>

                {/* Team Leader Name */}
                <InputField
                  name='teamLeaderName'
                  label={t('teams.form.teamLeaderName')}
                  defaultValue={formData.teamLeaderName || ''}
                  readOnly={false}
                  required
                  error={
                    errors.teamLeaderName
                      ? t('teams.form.teamLeaderNameRequired')
                      : undefined
                  }
                  className='mb-4'
                />

                {/* Team Leader Phone */}
                <InputField
                  name='teamLeaderPhone'
                  label={t('teams.form.teamLeaderPhone')}
                  type='tel'
                  defaultValue={formData.teamLeaderPhone || ''}
                  readOnly={false}
                  required
                  error={
                    errors.teamLeaderPhone
                      ? t('teams.form.teamLeaderPhoneRequired')
                      : undefined
                  }
                  className='mb-4'
                />

                {/* Team Leader Email */}
                <InputField
                  name='teamLeaderEmail'
                  label={t('teams.form.teamLeaderEmail')}
                  type='email'
                  defaultValue={formData.teamLeaderEmail || ''}
                  readOnly={false}
                  required
                  error={
                    errors.teamLeaderEmail
                      ? errors.teamLeaderEmail === 'teamLeaderEmailInvalid'
                        ? t('teams.form.teamLeaderEmailInvalid')
                        : t('teams.form.teamLeaderEmailRequired')
                      : undefined
                  }
                  className='mb-4'
                />
              </div>
            ) : null}
          </div>
        ) : (
          /* Admin Form Layout - Single Panel */
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            {mode === 'edit' ? (
              <h4 className='mb-6 text-lg font-semibold text-gray-900'>
                {t('admin.teams.editTeam')}
              </h4>
            ) : null}

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              {/* Club Name */}
              <InputField
                name='clubName'
                label={t('teams.form.clubName')}
                defaultValue={formData.clubName || (mode === 'create' ? 'sv DIO' : '')}
                readOnly={false}
                required
                error={errors.clubName ? t('teams.form.clubNameRequired') : undefined}
              />

              {/* Team Name */}
              <InputField
                ref={teamNameRef}
                name='teamName'
                label={t('teams.form.teamName')}
                defaultValue={formData.teamName || ''}
                readOnly={false}
                required
                error={errors.teamName ? t('teams.form.teamNameRequired') : undefined}
              />

              {/* Team Class */}
              <div>
                <label className='flex w-full flex-col gap-1'>
                  <span className='font-medium'>{t('teams.form.division')}</span>
                  <select
                    ref={teamClassRef}
                    name='division'
                    defaultValue={formData.division || ''}
                    required
                    className='h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6'
                    aria-invalid={errors.division ? true : undefined}
                    aria-errormessage={
                      errors.division ? 'division-error-admin' : undefined
                    }
                  >
                    <option value=''>{t('teams.form.selectDivision')}</option>
                    {availableDivisions.map(division => (
                      <option key={division} value={division}>
                        {divisionLabels[division].nl} ({divisionLabels[division].en})
                      </option>
                    ))}
                  </select>
                </label>
                {errors.division ? (
                  <div className='pt-1 text-red-700' id='division-error-admin'>
                    {t('teams.form.teamClassRequired')}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Agreement for Public Variant */}
        {showPrivacyAgreement ? (
          <div className='rounded-lg bg-gray-50 p-6'>
            <div className='flex items-start gap-3'>
              <input
                type='checkbox'
                name='privacyAgreement'
                id='privacyAgreement'
                className='mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500'
                aria-invalid={errors.privacyAgreement ? true : undefined}
                aria-errormessage={
                  errors.privacyAgreement ? 'privacy-error' : undefined
                }
              />
              <label htmlFor='privacyAgreement' className='text-sm text-gray-700'>
                {t('teams.form.privacyAgreement')}
              </label>
            </div>
            {errors.privacyAgreement ? (
              <div className='mt-2 text-red-700' id='privacy-error'>
                {t('teams.form.privacyAgreementRequired')}
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
