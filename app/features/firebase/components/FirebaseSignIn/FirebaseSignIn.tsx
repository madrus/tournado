import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { signInWithPopup } from 'firebase/auth'

import { auth, googleProvider } from '~/features/firebase/client'

import { firebaseSignInVariants } from './firebaseSignIn.variants'

export type FirebaseSignInProps = {
  redirectTo?: string | null
  className?: string
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function FirebaseSignIn({
  redirectTo = '/',
  className,
  variant = 'default',
  size = 'md',
}: FirebaseSignInProps): JSX.Element {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if Firebase is properly configured

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (!auth || !googleProvider) {
        throw new Error(
          'Firebase is not properly configured. Please check your environment variables.'
        )
      }

      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      // Create form data to submit to auth callback
      // Create a form and submit it traditionally to handle the redirect properly
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/auth/callback'

      const idTokenInput = document.createElement('input')
      idTokenInput.type = 'hidden'
      idTokenInput.name = 'idToken'
      idTokenInput.value = idToken
      form.appendChild(idTokenInput)

      const redirectToInput = document.createElement('input')
      redirectToInput.type = 'hidden'
      redirectToInput.name = 'redirectTo'
      redirectToInput.value = redirectTo || '/'
      form.appendChild(redirectToInput)

      document.body.appendChild(form)
      form.submit()
    } catch (authError) {
      // Firebase sign-in error
      setError(authError instanceof Error ? authError.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-4'>
      <button
        type='button'
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={firebaseSignInVariants({ variant, size, className })}
      >
        {loading ? (
          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
        ) : (
          <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
            <path
              fill='currentColor'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='currentColor'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='currentColor'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
              fill='currentColor'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
          </svg>
        )}
        {loading ? t('auth.firebase.signingIn') : t('auth.firebase.continueWithGoogle')}
      </button>
      {error ? (
        <div className='text-sm text-red-600 dark:text-red-400'>{error}</div>
      ) : null}
    </div>
  )
}
