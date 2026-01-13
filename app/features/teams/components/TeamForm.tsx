import { type FormEvent, type JSX, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, useNavigation, useSubmit } from 'react-router'

import { ActionButton } from '~/components/buttons/ActionButton'
import { RestorePageIcon } from '~/components/icons'
import { CheckboxAgreementField } from '~/components/inputs/CheckboxAgreementField'
import { ComboField } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { Panel } from '~/components/Panel'
import { FieldStatusIcon } from '~/components/shared/FieldStatusIcon'
import type { Division } from '~/db.server'
import {
	useTeamFormActions,
	useTeamFormAvailableOptions,
	useTeamFormFields,
	useTeamFormMode,
	useTeamFormStatus,
	useTeamFormStoreHydration,
	useTeamFormValidationState,
	useTeamOldFormFields,
} from '~/features/teams/stores/useTeamFormStore'
import type { TeamFormProps } from '~/features/teams/types'
import { getDivisionLabel } from '~/lib/lib.helpers'
import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'
import { toast } from '~/utils/toastUtils'
import { useGuardedStoreInitialization } from '~/hooks/useGuardedStoreInitialization'

const buildTeamFormPayload = (
	formData?: TeamFormProps['formData'],
	formMode?: 'create' | 'edit',
	hasTournaments?: boolean,
) => {
	if (!formData) {
		return null
	}

	if (formMode !== 'edit' && !hasTournaments) {
		return null
	}

	return {
		tournamentId: formData.tournamentId || '',
		clubName: formData.clubName || '',
		name: formData.name || '',
		division: formData.division || '',
		category: formData.category || '',
		teamLeaderName: formData.teamLeaderName || '',
		teamLeaderPhone: formData.teamLeaderPhone || '',
		teamLeaderEmail: formData.teamLeaderEmail || '',
		privacyAgreement: formData.privacyAgreement || false,
	}
}

export function TeamForm({
	mode: formMode = 'create',
	variant,
	isSuccess = false,
	className = '',
	intent,
	formData,
	submitButtonText,
	errors = {},
}: Omit<
	TeamFormProps,
	'availableDivisions' | 'availableCategories' | 'tournamentId'
>): JSX.Element {
	const { t, i18n } = useTranslation()
	const formRef = useRef<HTMLFormElement>(null)
	const navigation = useNavigation()
	const submit = useSubmit()
	// Refs to track scroll listener and timeout for cleanup on unmount
	const scrollListenerRef = useRef<((this: Window, ev: Event) => void) | null>(null)
	const scrollTimeoutRef = useRef<number | undefined>(undefined)
	const isSubmittingRef = useRef(false)
	const isSubmitting = navigation.state === 'submitting'
	const isPublicSuccess = isSuccess && variant === 'public'

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
		tournamentId,
		division,
		category,
		clubName,
		name,
		teamLeaderName,
		teamLeaderPhone,
		teamLeaderEmail,
		privacyAgreement,
	} = useTeamFormFields()
	const { displayErrors, blurredFields, forceShowAllErrors, submitAttempted } =
		useTeamFormValidationState()
	const {
		tournaments: availableTournaments,
		divisions: availableDivisions,
		categories: availableCategories,
	} = useTeamFormAvailableOptions()
	const mode = useTeamFormMode()
	const oldFormFields = useTeamOldFormFields()
	const { isFormDirty, isFormReadyForSubmission } = useTeamFormStatus()
	const {
		isPanelEnabled,
		setFormData,
		setFormField,
		setFormMetaField,
		updateAvailableOptions,
		validateFieldOnBlur,
		validateForm,
	} = useTeamFormActions()

	// Handle client-side form submission and validation
	const handleSubmit = useCallback(
		async (formEvent: FormEvent<HTMLFormElement>) => {
			const isValid = validateForm()

			if (!isValid) {
				formEvent.preventDefault()
				return
			}

			// Smooth-scroll to top first, then submit to allow UX to finish before redirect
			formEvent.preventDefault()

			// Guard against re-entrant submissions
			if (isSubmittingRef.current) {
				// Always prevent default on any subsequent submit events
				formEvent.preventDefault()
				return
			}
			isSubmittingRef.current = true

			try {
				// In test environment, bypass scroll/wait logic entirely
				if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
					const formEl = formRef.current ?? (formEvent.currentTarget as HTMLFormElement)
					submit(formEl)
					return
				}
				const waitForTop = (): Promise<void> =>
					new Promise((resolve) => {
						if (window.scrollY <= 4) {
							resolve()
							return
						}
						let timeoutId: number | undefined
						const onScroll = () => {
							if (window.scrollY <= 4) {
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
						}
						scrollListenerRef.current = onScroll
						window.addEventListener('scroll', onScroll, { passive: true })
						// fail-safe timeout in case scroll event is throttled or interrupted
						timeoutId = window.setTimeout(() => {
							window.removeEventListener('scroll', onScroll)
							scrollListenerRef.current = null
							scrollTimeoutRef.current = undefined
							resolve()
						}, 800)
						scrollTimeoutRef.current = timeoutId
						window.scrollTo({ top: 0, behavior: 'smooth' })
					})

				await waitForTop()
				const formEl = formRef.current ?? (formEvent.currentTarget as HTMLFormElement)
				submit(formEl)
			} finally {
				// no-op; guard reset happens when navigation becomes idle
			}
		},
		[validateForm, submit],
	)

	const handleReset = useCallback(() => {
		// Restore to original cached state
		setFormData(oldFormFields)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}, [setFormData, oldFormFields])

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
		[blurredFields, forceShowAllErrors, submitAttempted, displayErrors, t],
	)

	// Helper function to get field status (success/error/neutral)
	const getFieldStatus = useCallback(
		(
			fieldName: string,
			fieldValue: string | boolean,
			isDisabled = false,
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
		[getTranslatedError],
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
			setFormField('name', '')
			setFormField('privacyAgreement', false)
		}
	}, [formMode, setFormField])

	useGuardedStoreInitialization(
		() => buildTeamFormPayload(formData, formMode, availableTournaments.length > 0),
		setFormData,
		[formData, formMode, availableTournaments.length, isFormDirty],
		{ skipWhen: () => isFormDirty },
	)

	// When the list of available tournaments changes (i.e., is loaded from root),
	// check if a tournament is already selected (e.g., from persisted state).
	// If so, update the dependent dropdowns (divisions, categories).
	useEffect(() => {
		if (availableTournaments.length > 0 && tournamentId) {
			updateAvailableOptions()
		}
	}, [availableTournaments, tournamentId, updateAvailableOptions])

	// Memoized toast callbacks for performance optimization
	const showSuccessToast = useCallback(() => {
		const isCreating = formMode === 'create'

		if (isCreating) {
			toast.success(t('messages.team.registrationSuccess'), {
				description: t('messages.team.registrationSuccessDesc'),
			})
		} else {
			toast.success(t('messages.team.updateSuccess'), {
				description: t('messages.team.updateSuccessDesc'),
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
			toast.error(t('messages.team.registrationError'), {
				description: t('messages.team.registrationErrorDesc'),
			})
		} else {
			toast.error(t('messages.team.updateError'), {
				description: t('messages.team.updateErrorDesc'),
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
				<Panel
					variant='form-panel'
					color={PANEL_COLORS.step1}
					panelNumber={1}
					className='pb-4 lg:p-8'
					title={t('teams.form.tournamentDetails')}
					subtitle={t('teams.form.selectTournamentDetails')}
				>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{/* Tournament Selection */}
						<ComboField
							name='tournamentId'
							label={t('teams.form.tournament')}
							value={tournamentId}
							onChange={(value) => {
								setFormField('tournamentId', value)
								// Only clear dependent fields in create mode
								// In edit mode, preserve existing values
								if (formMode === 'create') {
									setFormField('division', '')
									setFormField('category', '')
								}
							}}
							options={availableTournaments.map((tournament) => ({
								value: tournament.id,
								label: `${tournament.name} - ${tournament.location}`,
							}))}
							placeholder={t('teams.form.selectTournament')}
							error={getTranslatedError('tournamentId', isPublicSuccess)}
							required
							disabled={isPublicSuccess}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step1}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus('tournamentId', tournamentId, isPublicSuccess)}
								/>
							}
							onBlur={() => validateFieldOnBlur('tournamentId')}
						/>

						{/* Division Selection */}
						<ComboField
							name='division'
							label={t('teams.form.division')}
							value={division}
							onChange={(value) => {
								setFormField('division', value)
								// Only clear dependent fields in create mode
								// In edit mode, preserve existing values
								if (formMode === 'create') {
									setFormField('category', '')
								}
							}}
							options={availableDivisions.map((d) => ({
								value: d,
								label: getDivisionLabel(d as Division, i18n.language),
							}))}
							placeholder={t('teams.form.selectDivision')}
							error={getTranslatedError('division', !tournamentId || isPublicSuccess)}
							required
							disabled={!tournamentId || isPublicSuccess}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step1}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										'division',
										division,
										!tournamentId || isPublicSuccess,
									)}
								/>
							}
							onBlur={() => validateFieldOnBlur('division')}
						/>

						{/* Category Selection */}
						<ComboField
							name='category'
							label={t('teams.form.category')}
							value={category}
							onChange={(value) => setFormField('category', value)}
							options={availableCategories.map((c) => ({
								value: c,
								label: c,
							}))}
							placeholder={t('teams.form.selectCategory')}
							error={getTranslatedError(
								'category',
								!tournamentId || !division || isPublicSuccess,
							)}
							required
							disabled={!tournamentId || !division || isPublicSuccess}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step1}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										'category',
										category,
										!tournamentId || !division || isPublicSuccess,
									)}
								/>
							}
							onBlur={() => validateFieldOnBlur('category')}
						/>
					</div>
				</Panel>

				{/* Step 2: Team Information */}
				<Panel
					variant='form-panel'
					color={
						formMode === 'edit' || isPanelEnabled(2) ? PANEL_COLORS.step2 : 'slate'
					}
					panelNumber={2}
					disabled={formMode === 'create' ? !isPanelEnabled(2) : undefined}
					className='lg:p-8'
					title={t('teams.form.teamInfo')}
					subtitle={t('teams.form.enterTeamDetails')}
				>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
						{/* Club Name */}
						<TextInputField
							name='clubName'
							label={t('teams.form.clubName')}
							value={clubName || ''}
							onChange={(value) => setFormField('clubName', value)}
							placeholder={t('teams.form.placeholders.clubName')}
							error={getTranslatedError(
								'clubName',
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2)),
							)}
							required
							disabled={
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
							}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step2}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										'clubName',
										clubName || '',
										formMode === 'create' && !isPanelEnabled(2),
									)}
								/>
							}
							onBlur={() => validateFieldOnBlur('clubName')}
						/>

						{/* Team Name */}
						<TextInputField
							name='name'
							label={t('teams.form.name')}
							value={name || ''}
							onChange={(value) => setFormField('name', value)}
							placeholder={t('teams.form.placeholders.name')}
							error={getTranslatedError(
								'name',
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2)),
							)}
							required
							disabled={
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(2))
							}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step2}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										'name',
										name || '',
										formMode === 'create' && !isPanelEnabled(2),
									)}
								/>
							}
							onBlur={() => validateFieldOnBlur('name')}
						/>
					</div>
				</Panel>

				{/* Step 3: Team Leader Information */}
				<Panel
					variant='form-panel'
					color={
						formMode === 'edit' || isPanelEnabled(3) ? PANEL_COLORS.step3 : 'slate'
					}
					panelNumber={3}
					disabled={formMode === 'create' ? !isPanelEnabled(3) : undefined}
					className='lg:p-8'
					title={t('teams.form.teamLeaderInfo')}
					subtitle={t('teams.form.enterContactDetails')}
				>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
						{/* Team Leader Name */}
						<TextInputField
							name='teamLeaderName'
							label={t('teams.form.teamLeaderName')}
							value={teamLeaderName || ''}
							onChange={(value) => setFormField('teamLeaderName', value)}
							placeholder={t('teams.form.placeholders.teamLeaderName')}
							error={getTranslatedError(
								'teamLeaderName',
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3)),
							)}
							required
							disabled={
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
							}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step3}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										'teamLeaderName',
										teamLeaderName || '',
										isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3)),
									)}
								/>
							}
							onBlur={() => validateFieldOnBlur('teamLeaderName')}
						/>

						{/* Team Leader Phone */}
						<TextInputField
							name='teamLeaderPhone'
							label={t('teams.form.teamLeaderPhone')}
							value={teamLeaderPhone || ''}
							onChange={(value) => setFormField('teamLeaderPhone', value)}
							placeholder={t('teams.form.placeholders.teamLeaderPhone')}
							error={getTranslatedError(
								'teamLeaderPhone',
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3)),
							)}
							required
							type='tel'
							disabled={
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
							}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step3}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										'teamLeaderPhone',
										teamLeaderPhone || '',
										isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3)),
									)}
								/>
							}
							onBlur={() => validateFieldOnBlur('teamLeaderPhone')}
						/>

						{/* Team Leader Email */}
						<TextInputField
							name='teamLeaderEmail'
							label={t('teams.form.teamLeaderEmail')}
							value={teamLeaderEmail || ''}
							onChange={(value) => setFormField('teamLeaderEmail', value)}
							placeholder={t('teams.form.placeholders.teamLeaderEmail')}
							error={getTranslatedError(
								'teamLeaderEmail',
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3)),
							)}
							required
							type='email'
							disabled={
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3))
							}
							className={getLatinTextClass()}
							color={PANEL_COLORS.step3}
							statusIcon={
								<FieldStatusIcon
									status={getFieldStatus(
										'teamLeaderEmail',
										teamLeaderEmail || '',
										isPublicSuccess || (formMode === 'create' && !isPanelEnabled(3)),
									)}
								/>
							}
							onBlur={() => validateFieldOnBlur('teamLeaderEmail')}
						/>
					</div>
				</Panel>

				{/* Step 4: Privacy Agreement (Create Mode Only) */}
				{mode === 'create' ? (
					<Panel
						variant='form-panel'
						color={
							formMode === 'edit' || isPanelEnabled(4) ? PANEL_COLORS.step4 : 'slate'
						}
						panelNumber={4}
						disabled={formMode === 'create' ? !isPanelEnabled(4) : undefined}
						className='lg:p-8'
					>
						<div className='mb-6'>
							<h2
								className={cn(
									'mb-4 font-bold text-title text-xl',
									formMode === 'create' && !isPanelEnabled(4)
										? 'text-foreground-lighter'
										: '',
								)}
							>
								{t('teams.form.privacyPolicy')}
							</h2>
						</div>

						<CheckboxAgreementField
							name='privacyAgreement'
							checked={privacyAgreement}
							label={t('teams.form.agreeToPrivacyPolicy')}
							description={t('teams.form.readAndAccept')}
							error={getTranslatedError(
								'privacyAgreement',
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(4)),
							)}
							required
							disabled={
								isPublicSuccess || (formMode === 'create' && !isPanelEnabled(4))
							}
							onChange={(checked: boolean) => setFormField('privacyAgreement', checked)}
							onBlur={() => validateFieldOnBlur('privacyAgreement')}
							color={PANEL_COLORS.step4}
						/>
					</Panel>
				) : null}

				{/* Submit and Action Buttons */}
				<div className='flex flex-col gap-2 md:flex-row items-center'>
					{isFormDirty ? (
						<span
							className='text-sm text-warning-600 dark:text-warning-400'
							data-testid='team-unsaved-warning'
						>
							{t('competition.groupAssignment.unsavedChanges')}
						</span>
					) : null}

					<div className='ms-auto flex items-center gap-3'>
						<ActionButton
							type='button'
							onClick={() => handleReset()}
							variant='secondary'
							color='brand'
						>
							<span className='flex items-center gap-2 rtl:flex-row-reverse'>
								<RestorePageIcon className='h-6 w-6 order-1 rtl:order-2' size={24} />
								<span className='order-2 rtl:order-1'>
									{t('common.actions.cancel')}
								</span>
							</span>
						</ActionButton>

						<ActionButton
							type='submit'
							variant='primary'
							color='brand'
							icon='check_circle'
							aria-label={
								formMode === 'edit'
									? t('common.actions.update')
									: t('common.actions.save')
							}
							permission={formMode === 'edit' ? 'teams:update' : 'teams:create'}
							disabled={
								isSubmitting ||
								isPublicSuccess ||
								!isFormReadyForSubmission ||
								(formMode === 'edit' && !isFormDirty)
							}
						>
							{isSubmitting
								? t('common.actions.saving')
								: formMode === 'edit'
									? t('common.actions.update')
									: submitButtonText || t('common.actions.save')}
						</ActionButton>
					</div>
				</div>
			</Form>
		</div>
	)
}
