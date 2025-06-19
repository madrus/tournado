import { JSX, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import { DateInputField } from '~/components/inputs/DateInputField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { getDivisionLabelByValue } from '~/lib/lib.helpers'
import type { DivisionValue } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getLatinTextClass, getLatinTitleClass } from '~/utils/rtlUtils'

import { ActionButton } from './buttons/ActionButton'
import { CheckIcon } from './icons'

type TournamentFormProps = {
  mode?: 'create' | 'edit' // Make optional since it's not used yet
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
  mode: _mode,
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
  const nameRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // State for selected divisions and categories (multi-select)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(
    formData.divisions || []
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    formData.categories || []
  )

  // Update state when formData changes
  useEffect(() => {
    setSelectedDivisions(formData.divisions || [])
    setSelectedCategories(formData.categories || [])
  }, [formData.divisions, formData.categories])

  // Focus management
  useEffect(() => {
    if (errors.name) {
      nameRef.current?.focus()
    } else if (isSuccess && variant === 'public') {
      // Reset form on successful submission for public variant
      formRef.current?.reset()
    }
  }, [errors, isSuccess, variant])

  const isPublicVariant = variant === 'public'

  const handleDivisionToggle = (division: string) => {
    setSelectedDivisions(prev =>
      prev.includes(division) ? prev.filter(d => d !== division) : [...prev, division]
    )
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  return (
    <div className={`mx-auto max-w-6xl ${className}`}>
      {/* Success Message for Public Variant */}
      {isSuccess && isPublicVariant && successMessage ? (
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
      {!isPublicVariant ? (
        <div className='mb-8 rounded-xl border-2 border-gray-300 bg-gradient-to-r from-slate-50 to-gray-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h2
                className={cn('text-2xl font-bold', getLatinTitleClass(i18n.language))}
              >
                {formData.name
                  ? formData.name
                  : t('tournaments.form.tournamentRegistration')}
              </h2>
              <p className='mt-2 text-gray-600'>
                {formData.location
                  ? `${t('tournaments.form.location')} ${formData.location}`
                  : t('tournaments.form.fillOutForm')}
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
                {t('tournaments.deleteTournament')}
              </ActionButton>
            ) : null}
          </div>
        </div>
      ) : null}

      <Form ref={formRef} method='post' className='space-y-8' noValidate>
        {/* Hidden fields */}
        {intent ? <input type='hidden' name='intent' value={intent} /> : null}

        {/* Hidden fields for arrays */}
        {selectedDivisions.map((division, index) => (
          <input
            key={`division-${index}`}
            type='hidden'
            name='divisions'
            value={division}
          />
        ))}

        {selectedCategories.map((category, index) => (
          <input
            key={`category-${index}`}
            type='hidden'
            name='categories'
            value={category}
          />
        ))}

        {/* Step 1: Basic Information */}
        <div className='relative'>
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6 lg:rtl:left-auto'>
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
                {t('tournaments.form.basicInformation')}
              </h2>
              <p className='text-sm text-red-600'>
                {t('tournaments.form.enterBasicDetails')}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Tournament Name */}
              <TextInputField
                ref={nameRef}
                name='name'
                label={t('tournaments.form.name')}
                value={formData.name || ''}
                error={errors.name}
                required
                className={getLatinTextClass(i18n.language)}
              />

              {/* Location */}
              <TextInputField
                name='location'
                label={t('tournaments.form.location')}
                value={formData.location || ''}
                error={errors.location}
                required
                className={getLatinTextClass(i18n.language)}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Dates */}
        <div className='relative'>
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6 lg:rtl:left-auto'>
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
                {t('tournaments.form.dates')}
              </h2>
              <p className='text-sm text-blue-600'>
                {t('tournaments.form.selectDates')}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Start Date */}
              <DateInputField
                name='startDate'
                label={t('tournaments.form.startDate')}
                defaultValue={formData.startDate}
                error={errors.startDate}
                required
                className={getLatinTextClass(i18n.language)}
              />

              {/* End Date */}
              <DateInputField
                name='endDate'
                label={t('tournaments.form.endDate')}
                defaultValue={formData.endDate}
                error={errors.endDate}
                className={getLatinTextClass(i18n.language)}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Divisions */}
        <div className='relative'>
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6 lg:rtl:left-auto'>
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
                {t('tournaments.form.divisions')}
              </h2>
              <p className='text-sm text-green-600'>
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
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                  )}
                >
                  <input
                    type='checkbox'
                    checked={selectedDivisions.includes(division)}
                    onChange={() => handleDivisionToggle(division)}
                    className='sr-only'
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      getLatinTextClass(i18n.language)
                    )}
                  >
                    {getDivisionLabelByValue(
                      division as DivisionValue,
                      i18n.language as 'en' | 'nl' | 'ar' | 'tr'
                    )}
                  </span>
                </label>
              ))}
            </div>
            {errors.divisions ? (
              <p className='mt-2 text-sm text-red-600'>{errors.divisions}</p>
            ) : null}
          </div>
        </div>

        {/* Step 4: Categories */}
        <div className='relative'>
          <div className='absolute top-8 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6 lg:rtl:left-auto'>
            4
          </div>

          <div className='rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-violet-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-xl lg:p-8'>
            <div className='mb-6'>
              <h2
                className={cn(
                  'mb-2 text-xl font-bold text-purple-800',
                  getLatinTitleClass(i18n.language)
                )}
              >
                {t('tournaments.form.categories')}
              </h2>
              <p className='text-sm text-purple-600'>
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
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                  )}
                >
                  <input
                    type='checkbox'
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className='sr-only'
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      getLatinTextClass(i18n.language)
                    )}
                  >
                    {category}
                  </span>
                </label>
              ))}
            </div>
            {errors.categories ? (
              <p className='mt-2 text-sm text-red-600'>{errors.categories}</p>
            ) : null}
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end gap-4'>
          {onCancel ? (
            <ActionButton
              type='button'
              onClick={onCancel}
              variant='outline'
              color='gray'
              className='min-w-32'
            >
              {t('common.cancel')}
            </ActionButton>
          ) : null}

          <ActionButton type='submit' variant='solid' color='red' icon='check_circle'>
            {submitButtonText || t('tournaments.form.saveTournament')}
          </ActionButton>
        </div>
      </Form>
    </div>
  )
}
