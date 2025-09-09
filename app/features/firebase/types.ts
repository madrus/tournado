import type { Session } from 'react-router'

import type { User } from '~/models/user.server'

/**
 * @fileoverview Firebase-specific type definitions
 *
 * This file contains all type definitions related to Firebase authentication
 * and session management for the Tournado application.
 */

// ============================================================================
// Firebase Configuration Types
// ============================================================================

export type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export type FirebaseUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

// ============================================================================
// Firebase Session Bridge Types
// ============================================================================

export type FirebaseSessionData = {
  firebaseUid: string
  userId: string
  email: string
  displayName?: string | null
}

export type SessionBridgeResult = {
  user: User
  session: Session
  isNewUser: boolean
}

export type CreateUserSessionProps = {
  request: Request
  userId: string
  remember?: boolean
  redirectTo?: string
}
