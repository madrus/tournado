import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { signInWithPopup } from 'firebase/auth'

import { ActionButton } from '~/components/buttons/ActionButton'
import { GoogleIcon } from '~/components/icons/GoogleIcon'
import { submitAuthCallback } from '~/features/firebase/adapters/redirect'
import { auth, googleProvider } from '~/features/firebase/client'

export type FirebaseSignInProps = {
  redirectTo?: string | null
  className?: string
}

export function FirebaseSignIn({
  redirectTo = '/',
  className,
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

      // Submit to auth callback using adapter (handles test/E2E/production scenarios)
      await submitAuthCallback(idToken, redirectTo || '/')
    } catch (authError) {
      // Firebase sign-in error
      setError(authError instanceof Error ? authError.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center space-y-4'>
      <ActionButton
        type='button'
        onClick={handleGoogleSignIn}
        disabled={loading}
        variant='primary'
        color='teal'
        className={className}
      >
        <span className='flex items-center justify-center gap-2 normal-case'>
          {loading ? (
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent' />
          ) : (
            <GoogleIcon size={20} aria-label='' />
          )}
          {loading ? t('common.auth.signingIn') : t('auth.firebase.continueWithGoogle')}
        </span>
      </ActionButton>
      {error ? (
        <div className='text-sm text-red-600 dark:text-red-400'>{error}</div>
      ) : null}
    </div>
  )
}
