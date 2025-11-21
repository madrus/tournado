import type { User as FirebaseAuthUser, UserCredential } from 'firebase/auth'
import { useEffect, useState } from 'react'

import {
	getAuthAndProvider,
	getEmailAuthFns,
	getOnAuthStateChanged,
	getSignInWithPopup,
	getSignOut,
} from '~/features/firebase/adapters/clientAuth'
import type { FirebaseUser } from '~/features/firebase/types'
import { debug } from '~/features/firebase/utils/env'
import { buildFriendlyMessage } from '~/features/firebase/utils/errors'

import { postSignOut, submitAuthCallback } from '../adapters/redirect'

export type UseFirebaseAuthReturn = {
	signInWithGoogle: (redirectTo?: string) => Promise<void>
	signInWithEmail: (email: string, password: string, redirectTo?: string) => Promise<void>
	signUpWithEmail: (email: string, password: string, redirectTo?: string) => Promise<void>
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

	// Debug logging for E2E tests - only log errors
	if (error) {
		debug('useFirebaseAuth error:', error)
	}

	useEffect(() => {
		const { auth } = getAuthAndProvider()
		if (!auth) {
			// Firebase is not configured - set loading to false
			setLoading(false)
			return
		}

		// Use mock-aware or real onAuthStateChanged
		const onAuthStateChanged = getOnAuthStateChanged()
		const handleAuthStateChanged = (firebaseUser: FirebaseAuthUser | null) => {
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
		}

		const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged)

		return () => unsubscribe()
	}, [])

	const signInWithGoogle = async (redirectTo?: string): Promise<void> => {
		try {
			setLoading(true)
			setError(null)

			const { auth, provider } = getAuthAndProvider()
			if (!auth || !provider) {
				throw new Error('Firebase is not properly configured')
			}

			const signInWithPopup = getSignInWithPopup()
			const result: UserCredential = await signInWithPopup(auth, provider)
			const idToken = await result.user.getIdToken(true)

			await submitAuthCallback(idToken, redirectTo)
		} catch (signInError) {
			// Firebase sign-in error
			type FirebaseErrorLike = { code?: string }
			const code = (signInError as FirebaseErrorLike)?.code
			const messages = {
				'auth/unauthorized-domain':
					'Unauthorized domain. Add localhost to Firebase Authorized domains.',
				'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups and try again.',
				'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
				'auth/network-request-failed': 'Network error during sign-in. Check your connection.',
			} as const
			setError(buildFriendlyMessage(code, signInError, messages, 'Sign-in failed'))
			setLoading(false)
		}
	}

	const signOut = async (): Promise<void> => {
		try {
			setLoading(true)
			setError(null)

			const { auth } = getAuthAndProvider()
			if (!auth) {
				throw new Error('Firebase is not properly configured')
			}

			const signOutAction = getSignOut()
			await signOutAction(auth)
			await postSignOut()
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
		redirectTo?: string,
	): Promise<void> => {
		try {
			setLoading(true)
			setError(null)

			const { auth } = getAuthAndProvider()
			if (!auth) {
				throw new Error('Firebase is not properly configured')
			}

			const { signIn } = getEmailAuthFns()
			const result: UserCredential = await signIn(auth, email, password)
			const idToken = await result.user.getIdToken(true)

			// Email sign-in successful, ID token obtained

			await submitAuthCallback(idToken, redirectTo)
		} catch (emailSignInError) {
			// Firebase sign-in error
			type FirebaseErrorLike = { code?: string }
			const code = (emailSignInError as FirebaseErrorLike)?.code
			// Normalize security-sensitive errors to prevent user enumeration
			const normalizedCode =
				code && ['auth/wrong-password', 'auth/user-not-found'].includes(code)
					? 'auth/invalid-credential'
					: code

			const messages = {
				'auth/invalid-credential': 'Invalid email or password.',
				'auth/too-many-requests': 'Too many attempts. Please try again later.',
				'auth/operation-not-allowed': 'Email/password auth is disabled in Firebase.',
			} as const
			setError(buildFriendlyMessage(normalizedCode, emailSignInError, messages, 'Sign-in failed'))
			setLoading(false)
		}
	}

	const signUpWithEmail = async (
		email: string,
		password: string,
		redirectTo = '/',
	): Promise<void> => {
		try {
			setLoading(true)
			setError(null)

			const { auth } = getAuthAndProvider()
			if (!auth) {
				throw new Error('Firebase is not properly configured')
			}

			const { signUp } = getEmailAuthFns()
			const result: UserCredential = await signUp(auth, email, password)
			const idToken = await result.user.getIdToken(true)

			await submitAuthCallback(idToken, redirectTo)
		} catch (signUpError) {
			// Firebase sign-up error
			type FirebaseErrorLike = { code?: string }
			const code = (signUpError as FirebaseErrorLike)?.code
			const messages = {
				'auth/email-already-in-use': 'An account already exists for this email.',
				'auth/weak-password': 'Password is too weak.',
				'auth/operation-not-allowed': 'Email/password auth is disabled in Firebase.',
			} as const
			setError(buildFriendlyMessage(code, signUpError, messages, 'Sign-up failed'))
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
