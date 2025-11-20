import type { Session } from 'react-router'

import type { User } from '~/models/user.server'
import { getUserByFirebaseUid } from '~/models/user.server'
import { getSession } from '~/utils/session.server'

import type { DecodedIdToken } from './server'
import { createOrUpdateUser } from './server'
import { verifyIdTokenWithEnv } from './server/tokenVerifier'
import type { FirebaseSessionData, SessionBridgeResult } from './types'

const FIREBASE_SESSION_KEY = 'firebaseSession'

/**
 * Error constant for deactivated account attempts.
 * Used by mutation functions to signal exceptional state.
 */
export const ACCOUNT_DEACTIVATED_ERROR = 'ACCOUNT_DEACTIVATED'

type CreateSessionFromFirebaseTokenProps = {
	idToken: string
	request: Request
}

export const createSessionFromFirebaseToken = async (
	props: Readonly<CreateSessionFromFirebaseTokenProps>,
): Promise<SessionBridgeResult | null> => {
	const { idToken, request } = props

	try {
		const decodedToken = await verifyIdTokenWithEnv(idToken, request)
		const { user, isNewUser } = await syncFirebaseUserToDatabase({
			firebaseUser: decodedToken,
		})

		const session = await getSession(request)

		// Set both legacy userId and Firebase session data for backward compatibility
		session.set('userId', user.id)
		session.set(FIREBASE_SESSION_KEY, {
			firebaseUid: decodedToken.uid,
			userId: user.id,
			email: decodedToken.email || user.email,
			displayName: decodedToken.name || `${user.firstName} ${user.lastName}`.trim(),
		})

		return {
			user,
			session,
			isNewUser,
		}
	} catch (_error) {
		if (_error instanceof Error && _error.message === ACCOUNT_DEACTIVATED_ERROR) {
			throw _error
		}
		if (process.env.NODE_ENV !== 'test') {
		}
		return null
	}
}

type SyncFirebaseUserToDatabaseProps = {
	firebaseUser: DecodedIdToken
}

export const syncFirebaseUserToDatabase = async (
	props: Readonly<SyncFirebaseUserToDatabaseProps>,
): Promise<{ user: User; isNewUser: boolean }> => {
	const { firebaseUser } = props
	if (!firebaseUser.email) {
		throw new Error('Firebase user must have an email address')
	}

	// Check if user already exists by Firebase UID
	const existingUser = await getUserByFirebaseUid(firebaseUser.uid)
	const isNewUser = !existingUser

	// Check if existing user is deactivated
	// NOTE: This throws an error (exceptional state for mutation function)
	// while validateFirebaseSession returns null (invalid state for validation function)
	// Both approaches are semantically appropriate for their use cases
	if (existingUser && !existingUser.active) {
		throw new Error(ACCOUNT_DEACTIVATED_ERROR)
	}

	// Use our new createOrUpdateUser function with role assignment
	const user = await createOrUpdateUser({
		firebaseUser: {
			uid: firebaseUser.uid,
			email: firebaseUser.email,
			displayName: firebaseUser.name,
			photoURL: null, // DecodedIdToken doesn't include photoURL
		},
	})

	return { user, isNewUser }
}

type ValidateFirebaseSessionProps = {
	request: Request
}

export const validateFirebaseSession = async (
	props: Readonly<ValidateFirebaseSessionProps>,
): Promise<{ user: User; session: Session } | null> => {
	const { request } = props
	try {
		const session = await getSession(request)
		const firebaseSessionData = session.get(FIREBASE_SESSION_KEY)

		if (!firebaseSessionData || !firebaseSessionData.userId) {
			return null
		}

		// For validation, we rely on the existing userId session key
		// The Firebase session data is supplementary
		const userId = session.get('userId')
		if (!userId || userId !== firebaseSessionData.userId) {
			return null
		}

		// Get user from database to ensure they still exist
		const user = await getUserByFirebaseUid(firebaseSessionData.firebaseUid)
		if (!user || user.id !== userId) {
			return null
		}

		// Check if user is deactivated
		// NOTE: This returns null (invalid state for validation function)
		// while syncFirebaseUserToDatabase throws (exceptional state for mutation function)
		// Both approaches are semantically appropriate for their use cases
		if (!user.active) {
			return null
		}

		return { user, session }
	} catch (_error) {
		return null
	}
}

export const getFirebaseSessionData = async (
	request: Request,
): Promise<FirebaseSessionData | null> => {
	const session = await getSession(request)
	return session.get(FIREBASE_SESSION_KEY) || null
}

export const clearFirebaseSession = (session: Session): void => {
	session.unset(FIREBASE_SESSION_KEY)
}
