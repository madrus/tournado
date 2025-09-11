import { useEffect, useState } from 'react'

import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth'

import {
  auth,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithEmailAndPassword,
} from '~/features/firebase/client'
import type { FirebaseUser } from '~/features/firebase/types'

export type UseFirebaseAuthReturn = {
  signInWithGoogle: (redirectTo?: string) => Promise<void>
  signInWithEmail: (
    email: string,
    password: string,
    redirectTo?: string
  ) => Promise<void>
  signUpWithEmail: (
    email: string,
    password: string,
    redirectTo?: string
  ) => Promise<void>
  signOut: () => Promise<void>
  user: FirebaseUser | null
  loading: boolean
  error: string | null
  clearError: () => void
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async (
    redirectTo = '/a7k9m2x5p8w1n4q6r3y8b5t1'
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (!auth || !googleProvider) {
        throw new Error('Firebase is not properly configured')
      }

      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken(true)

      if (process.env.NODE_ENV === 'test') {
        // In tests, use fetch to make assertions easier
        const formData = new FormData()
        formData.append('idToken', idToken)
        formData.append('redirectTo', redirectTo)
        const response = await fetch('/auth/callback', {
          method: 'POST',
          body: formData,
        })
        if (response.ok) {
          const redirectUrl = response.headers.get('Location') || redirectTo
          window.location.href = redirectUrl
        } else {
          throw new Error('Authentication failed')
        }
      } else {
        // Prefer classic form submit to ensure Set-Cookie + redirect work consistently
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
      }
    } catch (authError) {
      // Firebase sign-in error
      // Provide nicer error messages for common auth codes if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (authError as any)?.code as string | undefined
      const friendly =
        code === 'auth/unauthorized-domain'
          ? 'Unauthorized domain. Add localhost to Firebase Authorized domains.'
          : code === 'auth/popup-blocked'
            ? 'Sign-in popup was blocked. Please allow popups and try again.'
            : code === 'auth/popup-closed-by-user'
              ? 'Sign-in was cancelled. Please try again.'
              : code === 'auth/network-request-failed'
                ? 'Network error during sign-in. Check your connection.'
                : authError instanceof Error
                  ? authError.message
                  : 'Sign-in failed'
      setError(friendly)
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (!auth) {
        throw new Error('Firebase is not properly configured')
      }

      await firebaseSignOut(auth)

      // Also sign out from server session
      const signoutOptions: RequestInit = { method: 'POST' }
      if (process.env.NODE_ENV !== 'test') {
        signoutOptions.credentials = 'same-origin'
      }
      await fetch('/auth/signout', signoutOptions)

      window.location.href = '/auth/signin'
    } catch (signOutError) {
      // Firebase sign-out error
      setError(signOutError instanceof Error ? signOutError.message : 'Sign-out failed')
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (
    email: string,
    password: string,
    redirectTo = '/a7k9m2x5p8w1n4q6r3y8b5t1'
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (!auth) {
        throw new Error('Firebase is not properly configured')
      }

      const result = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await result.user.getIdToken(true)

      if (process.env.NODE_ENV === 'test') {
        const formData = new FormData()
        formData.append('idToken', idToken)
        formData.append('redirectTo', redirectTo)
        const response = await fetch('/auth/callback', {
          method: 'POST',
          body: formData,
        })
        if (response.ok) {
          const redirectUrl = response.headers.get('Location') || redirectTo
          window.location.href = redirectUrl
        } else {
          throw new Error('Authentication failed')
        }
      } else {
        // Submit via classic form for reliable cookie + redirect semantics
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
      }
    } catch (authError) {
      // Firebase sign-in error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (authError as any)?.code as string | undefined
      const friendly =
        code === 'auth/invalid-credential' || code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : code === 'auth/user-not-found'
            ? 'No account found for this email.'
            : code === 'auth/too-many-requests'
              ? 'Too many attempts. Please try again later.'
              : code === 'auth/operation-not-allowed'
                ? 'Email/password auth is disabled in Firebase.'
                : authError instanceof Error
                  ? authError.message
                  : 'Sign-in failed'
      setError(friendly)
      setLoading(false)
    }
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    redirectTo = '/a7k9m2x5p8w1n4q6r3y8b5t1'
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (!auth) {
        throw new Error('Firebase is not properly configured')
      }

      const result = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await result.user.getIdToken(true)

      if (process.env.NODE_ENV === 'test') {
        const formData = new FormData()
        formData.append('idToken', idToken)
        formData.append('redirectTo', redirectTo)
        const response = await fetch('/auth/callback', {
          method: 'POST',
          body: formData,
        })
        if (response.ok) {
          const redirectUrl = response.headers.get('Location') || redirectTo
          window.location.href = redirectUrl
        } else {
          throw new Error('Authentication failed')
        }
      } else {
        // Submit via classic form for reliable cookie + redirect semantics
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
      }
    } catch (authError) {
      // Firebase sign-up error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (authError as any)?.code as string | undefined
      const friendly =
        code === 'auth/email-already-in-use'
          ? 'An account already exists for this email.'
          : code === 'auth/weak-password'
            ? 'Password is too weak.'
            : code === 'auth/operation-not-allowed'
              ? 'Email/password auth is disabled in Firebase.'
              : authError instanceof Error
                ? authError.message
                : 'Sign-up failed'
      setError(friendly)
      setLoading(false)
    }
  }

  const clearError = (): void => {
    setError(null)
  }

  return {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    user,
    loading,
    error,
    clearError,
  }
}
