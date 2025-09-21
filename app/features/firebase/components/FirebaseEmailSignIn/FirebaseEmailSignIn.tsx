import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '~/components/buttons/ActionButton'
import { cn } from '~/utils/misc'

import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'
import {
  firebaseEmailSignInVariants,
  inputVariants,
} from './firebaseEmailSignIn.variants'

export type FirebaseEmailSignInProps = {
  mode: 'signin' | 'signup'
  redirectTo?: string
  className?: string
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const FirebaseEmailSignIn = ({
  mode,
  redirectTo,
  className,
  variant = 'default',
  size = 'md',
}: FirebaseEmailSignInProps): JSX.Element => {
  const { t } = useTranslation()
  const { signInWithEmail, signUpWithEmail, loading, error, clearError } =
    useFirebaseAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue)
  }

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

    // Validation - since we're not using local state for errors,
    // we'll let the hook handle the error state
    if (!validateEmail(email)) {
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
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
      className={cn(firebaseEmailSignInVariants({ variant, size }), className)}
    >
      <div className='space-y-2'>
        <label htmlFor='email' className='text-sm font-medium'>
          {t('auth.labels.email')}
        </label>
        <input
          id='email'
          type='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
          className={cn(
            inputVariants({
              variant: error && !validateEmail(email) ? 'error' : 'default',
            })
          )}
          placeholder={t('auth.placeholders.email')}
          required
          disabled={loading}
        />
      </div>

      <div className='space-y-2'>
        <label htmlFor='password' className='text-sm font-medium'>
          {t('auth.labels.password')}
        </label>
        <input
          id='password'
          type='password'
          value={password}
          onChange={event => setPassword(event.target.value)}
          className={cn(
            inputVariants({
              variant: error && validatePassword(password) ? 'error' : 'default',
            })
          )}
          placeholder={t('auth.placeholders.password')}
          required
          disabled={loading}
        />
        {mode === 'signup' ? (
          <p className='text-muted-foreground text-xs'>
            {t('auth.validation.passwordRequirements')}
          </p>
        ) : null}
      </div>

      {mode === 'signup' ? (
        <div className='space-y-2'>
          <label htmlFor='confirmPassword' className='text-sm font-medium'>
            {t('auth.labels.confirmPassword')}
          </label>
          <input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
            className={cn(
              inputVariants({
                variant: error && password !== confirmPassword ? 'error' : 'default',
              })
            )}
            placeholder={t('auth.placeholders.confirmPassword')}
            required
            disabled={loading}
          />
        </div>
      ) : null}

      {error ? (
        <div className='text-destructive bg-destructive/10 rounded-md p-3 text-sm'>
          {error}
        </div>
      ) : null}

      <ActionButton
        type='submit'
        disabled={loading}
        variant='primary'
        color='brand'
        size='md'
      >
        {loading ? (
          <div className='flex items-center justify-center gap-2'>
            <div
              data-testid='loading-spinner'
              className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'
            />
            {t('auth.buttons.signingIn')}
          </div>
        ) : (
          t(mode === 'signin' ? 'common.auth.signIn' : 'common.auth.signUp')
        )}
      </ActionButton>
    </form>
  )
}
