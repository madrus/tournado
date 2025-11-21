import { type FormEvent, type JSX, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, useNavigation, useSubmit } from 'react-router'

import { ActionButton } from '~/components/buttons'
import { CheckIcon, RestorePageIcon } from '~/components/icons'
import { CustomDatePicker } from '~/components/inputs/CustomDatePicker'
import { TextInputField } from '~/components/inputs/TextInputField'
import { Panel } from '~/components/Panel'
import { FieldStatusIcon } from '~/components/shared/FieldStatusIcon'
import { ToggleChipsField } from '~/components/ToggleChip'
import {
	useTournamentFormStore,
	useTournamentFormStoreHydration,
} from '~/features/tournaments/stores/useTournamentFormStore'
import type { TournamentFormProps } from '~/features/tournaments/types'
import { getFieldStatus } from '~/lib/lib.helpers'
import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'
import { toast } from '~/utils/toastUtils'

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
	className = '',
	intent,
}: Readonly<TournamentFormProps>): JSX.Element {
	const { t } = useTranslation()
	const formRef = useRef<HTMLFormElement>(null)
	const nameRef = useRef<HTMLInputElement>(null)
	const navigation = useNavigation()
	const submit = useSubmit()
	// Refs to track scroll listener and timeout for cleanup on unmount
	const scrollListenerRef = useRef<((this: Window, ev: Event) => void) | null>(null)
	const scrollTimeoutRef = useRef<number | undefined>(undefined)
	// Re-entrancy guard for submit during scroll-to-top
	const isSubmittingRef = useRef(false)
	const isPublicSuccess = isSuccess && variant === 'public'
	// Panel color constants - single source of truth
	const PANEL_COLORS = {
		header: 'sky' as const,
		step1: 'red' as const,
		step2: 'amber' as const,
		step3: 'indigo' as const,
		step4: 'fuchsia' as const,
	}
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
		oldFormFields,
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

	// Ensure the tournament form store is properly hydrated
	useTournamentFormStoreHydration()

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
			const shouldShowError = blurredFields[fieldName] || forceShowAllErrors || submitAttempted

			if (!shouldShowError) return undefined

			const errorKey = displayErrors[fieldName]
			if (!errorKey) return undefined

			// If the error is already a plain message (from server), return as-is
			if (!errorKey.includes('.')) return errorKey

			// Otherwise, translate the key
			return t(errorKey)
		},
		[blurredFields, forceShowAllErrors, submitAttempted, displayErrors, t, errors],
	)

	const handleReset = useCallback(() => {
		// Restore to original cached state
		setFormData(oldFormFields)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}, [setFormData, oldFormFields])

	const handleDivisionToggle = (division: string) => {
		const newDivisions = selectedDivisions.includes(division)
			? selectedDivisions.filter((d) => d !== division)
			: [...selectedDivisions, division]
		setFormField('divisions', newDivisions)
	}

	const handleCategoryToggle = (category: string) => {
		const newCategories = selectedCategories.includes(category)
			? selectedCategories.filter((c) => c !== category)
			: [...selectedCategories, category]
		setFormField('categories', newCategories)
	}

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
				endDate: formData.endDate || formData.startDate || '',
				divisions: formData.divisions || [],
				categories: formData.categories || [],
			})
		}
	}, [formData, formMode, setFormData])

	// Initialize available options in store
	useEffect(() => {
		setAvailableOptionsField('divisions', divisions)
		setAvailableOptionsField('categories', categories)
	}, [divisions, categories, setAvailableOptionsField])

	// Focus management
	useEffect(() => {
		if (errors.name) {
			nameRef.current?.focus()
		} else if (isSuccess && variant === 'public') {
			// Reset form on successful submission for public variant
			formRef.current?.reset()
		}
	}, [errors, isSuccess, variant])
	const handleSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
		const isValid = validateForm()

		if (!isValid) {
			formEvent.preventDefault()
			return
		}

		// Smooth-scroll to top first, then submit to allow UX to finish before redirect
		formEvent.preventDefault()
		if (isSubmittingRef.current) {
			return
		}
		isSubmittingRef.current = true

		const waitForTop = (): Promise<void> =>
			new Promise((resolve) => {
				// If already near the top, resolve immediately
				if (window.scrollY <= 4) {
					resolve()
					return
				}

				let resolved = false
				let timeoutId: number | undefined
				const onResolve = () => {
					if (resolved) return
					resolved = true
					window.removeEventListener('scroll', onScroll)
					scrollListenerRef.current = null
					if (timeoutId !== undefined) {
						window.clearTimeout(timeoutId)
					}
					if (scrollTimeoutRef.current !== undefined) {
						window.clearTimeout(scrollTimeoutRef.current)
					}
					scrollTimeoutRef.current = undefined
					resolve()
				}

				const onScroll = () => {
					if (window.scrollY <= 4) onResolve()
				}

				timeoutId = window.setTimeout(onResolve, 800)
				scrollTimeoutRef.current = timeoutId
				scrollListenerRef.current = onScroll
				window.addEventListener('scroll', onScroll, { passive: true })
				window.scrollTo({ top: 0, behavior: 'smooth' })
			})

		try {
			await waitForTop()
			// Fallback to the event target form if ref is not available
			const formEl = formRef.current ?? (formEvent.currentTarget as HTMLFormElement)
			submit(formEl)
		} finally {
			// no-op; guard reset happens when navigation becomes idle
		}
	}

	// Memoized toast callbacks for performance optimization
	const showSuccessToast = useCallback(() => {
		const isCreating = formMode === 'create'

		if (isCreating) {
			toast.success(t('messages.tournament.registrationSuccess'), {
				description: t('messages.tournament.registrationSuccessDesc'),
			})
		} else {
			toast.success(t('messages.tournament.updateSuccess'), {
				description: t('messages.tournament.updateSuccessDesc'),
			})
		}
	}, [formMode, t])

	// Scroll to top on successful server-side submission and show toast
	useEffect(() => {
		if (isSuccess) {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			showSuccessToast()
		}
	}, [isSuccess, showSuccessToast])

	// Memoized error toast callback for performance optimization
	const showErrorToast = useCallback(() => {
		const isCreating = formMode === 'create'

		if (isCreating) {
			toast.error(t('messages.tournament.registrationError'), {
				description: t('messages.tournament.registrationErrorDesc'),
			})
		} else {
			toast.error(t('messages.tournament.updateError'), {
				description: t('messages.tournament.updateErrorDesc'),
			})
		}
	}, [formMode, t])

	// Show error toast on form submission failure
	useEffect(() => {
		if (navigation.state === 'idle' && errors && Object.keys(errors).length > 0) {
			showErrorToast()
		}
	}, [navigation.state, errors, showErrorToast])

	// Reset duplicate-submission guard only after navigation completes
	useEffect(() => {
		if (navigation.state === 'idle') {
			isSubmittingRef.current = false
		}
	}, [navigation.state])

	// Cleanup any lingering scroll listeners/timeouts on unmount to avoid leaks
	useEffect(
		() => () => {
			if (scrollListenerRef.current) {
				window.removeEventListener('scroll', scrollListenerRef.current)
				scrollListenerRef.current = null
			}
			if (scrollTimeoutRef.current !== undefined) {
				window.clearTimeout(scrollTimeoutRef.current)
				scrollTimeoutRef.current = undefined
			}
		},
		[],
	)

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
					<p className='font-semibold text-foreground-darker text-sm'>{successMessage}</p>
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
				{selectedDivisions.map((division) => (
					<input
						key={`hidden-division-${division}`}
						type='hidden'
						name='divisions'
						value={division}
					/>
				))}
				{selectedCategories.map((category) => (
					<input
						key={`hidden-category-${category}`}
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
							onChange={(value) => setFormField('name', value)}
							onBlur={() => validateFieldOnBlur('name')}
							error={getTranslatedError('name')}
							required
							className={getLatinTextClass()}
							color={PANEL_COLORS.step1}
							disabled={isPublicSuccess}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										name,
										Boolean(getTranslatedError('name', isPublicSuccess)),
										true /* required */,
										isPublicSuccess,
									)}
								/>
							}
						/>

						{/* Location */}
						<TextInputField
							name='location'
							label={t('tournaments.form.location')}
							value={location}
							onChange={(value) => setFormField('location', value)}
							onBlur={() => validateFieldOnBlur('location')}
							error={getTranslatedError('location')}
							required
							className={getLatinTextClass()}
							color={PANEL_COLORS.step1}
							disabled={isPublicSuccess}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										location,
										Boolean(getTranslatedError('location', isPublicSuccess)),
										true /* required */,
										isPublicSuccess,
									)}
								/>
							}
						/>
					</div>
				</Panel>

				{/* Step 2: Dates */}
				<Panel
					variant='form-panel'
					color={formMode === 'edit' || isPanelEnabled(2) ? PANEL_COLORS.step2 : 'slate'}
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
							onChange={(event) => setFormField('startDate', event.target.value)}
							onBlur={() => {
								validateFieldOnBlur('startDate')
								// Auto-fill endDate if empty
								if (startDate && !endDate) {
									setFormField('endDate', startDate)
								}
							}}
							error={getTranslatedError(
								'startDate',
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2)),
							)}
							required
							className={getLatinTextClass()}
							color={PANEL_COLORS.step2}
							readOnly={isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										startDate,
										Boolean(
											getTranslatedError(
												'startDate',
												isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2)),
											),
										),
										true /* required */,
										isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2)),
									)}
								/>
							}
						/>

						{/* End Date */}
						<CustomDatePicker
							name='endDate'
							label={t('tournaments.form.endDate')}
							value={endDate}
							onChange={(event) => setFormField('endDate', event.target.value)}
							onBlur={() => validateFieldOnBlur('endDate')}
							error={getTranslatedError(
								'endDate',
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2)),
							)}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step2}
							readOnly={isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										endDate,
										Boolean(
											getTranslatedError(
												'endDate',
												isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2)),
											),
										),
										false /* not required */,
										isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2)),
									)}
								/>
							}
						/>
					</div>
				</Panel>

				{/* Step 3: Divisions */}
				<Panel
					variant='form-panel'
					color={formMode === 'edit' || isPanelEnabled(3) ? PANEL_COLORS.step3 : 'slate'}
					panelNumber={3}
					disabled={formMode === 'create' ? !isPanelEnabled(3) : undefined}
					title={t('tournaments.form.divisions')}
				>
					<ToggleChipsField
						items={divisions}
						type='divisions'
						selectedValues={selectedDivisions}
						onToggle={handleDivisionToggle}
						label={`${t('tournaments.form.selectDivisions')} (${selectedDivisions.length} ${t('tournaments.form.selected')})`}
						error={getTranslatedError(
							'divisions',
							isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3)),
						)}
						required
						disabled={(formMode === 'create' && !isPanelEnabled(3)) || isPublicSuccess}
						color={PANEL_COLORS.step3}
					/>
				</Panel>

				{/* Step 4: Categories */}
				<Panel
					variant='form-panel'
					color={formMode === 'edit' || isPanelEnabled(4) ? PANEL_COLORS.step4 : 'slate'}
					panelNumber={4}
					disabled={formMode === 'create' ? !isPanelEnabled(4) : undefined}
					title={t('tournaments.form.categories')}
				>
					<ToggleChipsField
						items={categories}
						type='categories'
						selectedValues={selectedCategories}
						onToggle={handleCategoryToggle}
						label={`${t('tournaments.form.selectCategories')} (${selectedCategories.length} ${t('tournaments.form.selected')})`}
						error={getTranslatedError(
							'categories',
							isPublicSuccess || (formMode === 'create' && !isPanelEnabled(4)),
						)}
						required
						disabled={(formMode === 'create' && !isPanelEnabled(4)) || isPublicSuccess}
						color={PANEL_COLORS.step4}
					/>
				</Panel>

				{/* Submit Button */}
				<div className='flex flex-col gap-4 md:flex-row md:justify-end rtl:md:justify-start'>
					<ActionButton
						type='button'
						onClick={() => handleReset()}
						variant='secondary'
						color='brand'
						className='w-full hover:scale-100 md:w-fit md:hover:scale-105'
						permission={formMode === 'edit' ? 'tournaments:update' : 'tournaments:create'}
					>
						<RestorePageIcon className='mr-2 h-6 w-6' size={24} />
						{t('common.actions.cancel')}
					</ActionButton>

					<ActionButton
						type='submit'
						variant='primary'
						color='brand'
						icon='check_circle'
						className='w-full hover:scale-100 md:w-fit md:hover:scale-105'
						aria-label={t('common.actions.save')}
						permission={formMode === 'edit' ? 'tournaments:update' : 'tournaments:create'}
						disabled={
							isPublicSuccess || !isFormReadyForSubmission() || (mode === 'edit' && !isDirty())
						}
					>
						{submitButtonText || t('common.actions.save')}
					</ActionButton>
				</div>
			</Form>
		</div>
	)
}
