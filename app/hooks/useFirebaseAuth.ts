import { useEffect, useState } from 'react'

import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth'

import { auth, googleProvider } from '~/features/firebase/client'
import type { FirebaseUser } from '~/features/firebase/types'

export type UseFirebaseAuthReturn = {
  signInWithGoogle: (redirectTo?: string) => Promise<void>
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
      const idToken = await result.user.getIdToken()

      // Create form data to submit to auth callback
      const formData = new FormData()
      formData.append('idToken', idToken)
      formData.append('redirectTo', redirectTo)

      // Submit to auth callback route
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
    } catch (authError) {
      // Firebase sign-in error
      setError(authError instanceof Error ? authError.message : 'Sign-in failed')
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
      await fetch('/auth/signout', {
        method: 'POST',
      })

      window.location.href = '/auth/signin'
    } catch (signOutError) {
      // Firebase sign-out error
      setError(signOutError instanceof Error ? signOutError.message : 'Sign-out failed')
    } finally {
      setLoading(false)
    }
  }

  const clearError = (): void => {
    setError(null)
  }

  return {
    signInWithGoogle,
    signOut,
    user,
    loading,
    error,
    clearError,
  }
}
