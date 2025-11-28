import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '~/components/buttons/ActionButton'
import { TextInputField } from '~/components/inputs/TextInputField'
import { validateEmail } from '~/lib/validation'
import { cn } from '~/utils/misc'

import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'
import {
	firebaseAuthFormVariants,
	firebaseAuthLabelVariants,
} from './firebaseAuth.variants'

export type FirebaseEmailSignInProps = {
	mode: 'signin' | 'signup'
	redirectTo?: string
	className?: string
	size?: 'sm' | 'md' | 'lg'
}

export function FirebaseEmailSignIn({
	mode,
	redirectTo,
	className,
	size = 'md',
}: FirebaseEmailSignInProps): JSX.Element {
	const { t } = useTranslation()
	const { signInWithEmail, signUpWithEmail, loading, error, clearError } =
		useFirebaseAuth()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [validationError, setValidationError] = useState<string | null>(null)

	const validatePassword = (passwordValue: string): string | null => {
		if (passwordValue.length < 8) {
			return t('auth.validation.passwordTooShort')
		}
		if (mode === 'signup' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordValue)) {
			return t('auth.validation.passwordWeak')
		}
		return null
	}

	const handleSubmit = async (event: React.FormEvent): Promise<void> => {
		event.preventDefault()
		clearError()
		setValidationError(null)

		// Client-side validation with user feedback
		if (!validateEmail(email)) {
			setValidationError(t('auth.validation.emailInvalid'))
			return
		}

		const passwordError = validatePassword(password)
		if (passwordError) {
			setValidationError(passwordError)
			return
		}

		if (mode === 'signup' && password !== confirmPassword) {
			setValidationError(t('auth.validation.passwordMismatch'))
			return
		}

		// Use the hook methods which handle loading, errors, and navigation
		if (mode === 'signin') {
			await signInWithEmail(email, password, redirectTo) // No default, let server decide based on role
		} else {
			await signUpWithEmail(email, password, redirectTo || '/') // Default to homepage for new users
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className={cn(firebaseAuthFormVariants({ size }), className)}
		>
			<TextInputField
				name='email'
				label={t('auth.labels.email')}
				type='email'
				value={email}
				onChange={(value) => {
					setEmail(value)
					setValidationError(null)
				}}
				placeholder={t('auth.placeholders.email')}
				error={
					(error || validationError) && !validateEmail(email)
						? t('auth.validation.emailInvalid')
						: undefined
				}
				required
				disabled={loading}
				color='teal'
				labelClassName={firebaseAuthLabelVariants()}
			/>

			<div>
				<TextInputField
					name='password'
					label={t('auth.labels.password')}
					type='password'
					value={password}
					onChange={(value) => {
						setPassword(value)
						setValidationError(null)
					}}
					placeholder={t('auth.placeholders.password')}
					error={
						(error || validationError) && validatePassword(password)
							? validatePassword(password) || undefined
							: undefined
					}
					required
					disabled={loading}
					color='teal'
					labelClassName={firebaseAuthLabelVariants()}
				/>
				{mode === 'signup' ? (
					<p className='mt-1 text-muted-foreground text-xs opacity-60'>
						{t('auth.validation.passwordRequirements')}
					</p>
				) : null}
			</div>

			{mode === 'signup' ? (
				<TextInputField
					name='confirmPassword'
					label={t('auth.labels.confirmPassword')}
					type='password'
					value={confirmPassword}
					onChange={(value) => {
						setConfirmPassword(value)
						setValidationError(null)
					}}
					placeholder={t('auth.placeholders.confirmPassword')}
					error={
						(error || validationError) && password !== confirmPassword
							? t('auth.validation.passwordMismatch')
							: undefined
					}
					required
					disabled={loading}
					color='teal'
					labelClassName={firebaseAuthLabelVariants()}
				/>
			) : null}

			{error && !validationError ? (
				<div className='rounded-md bg-destructive/10 p-3 text-destructive text-sm'>
					{error}
				</div>
			) : null}

			<ActionButton
				type='submit'
				disabled={loading}
				variant='primary'
				color='teal'
				size='md'
				className='w-full hover:scale-100 md:w-fit md:self-center md:hover:scale-105'
			>
				{loading ? (
					<div className='flex items-center justify-center gap-2'>
						<div
							data-testid='loading-spinner'
							className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'
						/>
						{t('common.auth.signingIn')}
					</div>
				) : (
					t(mode === 'signin' ? 'common.auth.signIn' : 'common.auth.signUp')
				)}
			</ActionButton>
		</form>
	)
}
