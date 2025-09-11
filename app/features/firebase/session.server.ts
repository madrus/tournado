import type { Session } from 'react-router'

import type { User } from '~/models/user.server'
import { getUserByFirebaseUid } from '~/models/user.server'
import { getSession } from '~/utils/session.server'

import type { DecodedIdToken } from './server'
import { createOrUpdateUser, verifyIdToken } from './server'
import type { FirebaseSessionData, SessionBridgeResult } from './types'

const FIREBASE_SESSION_KEY = 'firebaseSession'

type CreateSessionFromFirebaseTokenProps = {
  idToken: string
  request: Request
}

export const createSessionFromFirebaseToken = async (
  props: Readonly<CreateSessionFromFirebaseTokenProps>
): Promise<SessionBridgeResult | null> => {
  const { idToken, request } = props

  try {
    const decodedToken = await verifyIdToken(idToken)
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
    return null
  }
}

type SyncFirebaseUserToDatabaseProps = {
  firebaseUser: DecodedIdToken
}

export const syncFirebaseUserToDatabase = async (
  props: Readonly<SyncFirebaseUserToDatabaseProps>
): Promise<{ user: User; isNewUser: boolean }> => {
  const { firebaseUser } = props
  if (!firebaseUser.email) {
    throw new Error('Firebase user must have an email address')
  }

  // Check if user already exists by Firebase UID
  const existingUser = await getUserByFirebaseUid(firebaseUser.uid)
  const isNewUser = !existingUser

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
  props: Readonly<ValidateFirebaseSessionProps>
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

    return { user, session }
  } catch (_error) {
    return null
  }
}

export const getFirebaseSessionData = async (
  request: Request
): Promise<FirebaseSessionData | null> => {
  const session = await getSession(request)
  return session.get(FIREBASE_SESSION_KEY) || null
}

export const clearFirebaseSession = (session: Session): void => {
  session.unset(FIREBASE_SESSION_KEY)
}
