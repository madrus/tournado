import type {
	Auth,
	User as FirebaseAuthUser,
	GoogleAuthProvider,
	UserCredential,
} from 'firebase/auth'
import {
	createUserWithEmailAndPassword as createUserWithEmailAndPasswordSdk,
	onAuthStateChanged as onAuthStateChangedSdk,
	signInWithEmailAndPassword as signInWithEmailAndPasswordSdk,
	signInWithPopup as signInWithPopupSdk,
	signOut as signOutSdk,
} from 'firebase/auth'

import { auth as clientAuth, googleProvider as clientProvider } from '../client'
import { isE2EClient } from '../utils/env'

export function getOnAuthStateChanged(): (
	auth: Auth,
	next: (user: FirebaseAuthUser | null) => unknown,
) => () => void {
	if (isE2EClient() && window.mockFirebaseAuth?.onAuthStateChanged) {
		const mockFn = window.mockFirebaseAuth.onAuthStateChanged
		return (auth: Auth, next: (user: FirebaseAuthUser | null) => unknown) => {
			// Playwright mock can accept callback-only or (auth, callback)
			if (mockFn.length < 2) {
				return mockFn(next)
			}
			return mockFn(auth, next)
		}
	}
	return onAuthStateChangedSdk
}

export function getSignInWithPopup(): (
	auth: Auth,
	provider: GoogleAuthProvider,
) => Promise<UserCredential> {
	if (isE2EClient() && window.mockFirebaseAuth?.signInWithPopup) {
		return window.mockFirebaseAuth.signInWithPopup
	}
	return signInWithPopupSdk
}

export function getSignOut(): (auth: Auth) => Promise<void> {
	if (isE2EClient() && window.mockFirebaseAuth?.signOut) {
		return window.mockFirebaseAuth.signOut
	}
	return signOutSdk
}

export const getEmailAuthFns = (): {
	signIn: typeof signInWithEmailAndPasswordSdk
	signUp: typeof createUserWithEmailAndPasswordSdk
} => ({
	signIn:
		isE2EClient() && window.mockFirebaseAuth?.signInWithEmailAndPassword
			? window.mockFirebaseAuth.signInWithEmailAndPassword
			: signInWithEmailAndPasswordSdk,
	signUp:
		isE2EClient() && window.mockFirebaseAuth?.createUserWithEmailAndPassword
			? window.mockFirebaseAuth.createUserWithEmailAndPassword
			: createUserWithEmailAndPasswordSdk,
})

export function getAuthAndProvider(): {
	auth: Auth | null
	provider: GoogleAuthProvider | null
} {
	if (isE2EClient() && window.mockFirebaseAuth) {
		const auth = window.mockFirebaseAuth as unknown as Auth
		const provider = window.mockFirebaseModule?.GoogleAuthProvider
			? new window.mockFirebaseModule.GoogleAuthProvider()
			: null
		return { auth, provider }
	}
	return { auth: clientAuth, provider: clientProvider }
}
