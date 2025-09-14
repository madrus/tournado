import { Role, type User } from '@prisma/client'

import admin from 'firebase-admin'
import { type App, getApps, initializeApp } from 'firebase-admin/app'
import { type Auth, type DecodedIdToken, getAuth } from 'firebase-admin/auth'

import { prisma } from '~/db.server'

import type { FirebaseUser } from './types'

let adminApp: App | null = null
let adminAuth: Auth | null = null

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    // Validate that all required environment variables are present
    if (
      !serviceAccount.projectId ||
      !serviceAccount.clientEmail ||
      !serviceAccount.privateKey
    ) {
      // Missing required environment variables - adminAuth will remain null
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.warn(
          '[firebase-admin] Missing FIREBASE_ADMIN_* env vars; Admin SDK not initialized.'
        )
      }
    } else {
      adminApp = initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.projectId,
      })

      adminAuth = getAuth(adminApp)
    }
  } catch (_error) {
    // Firebase Admin SDK initialization failed - adminAuth will remain null
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error('[firebase-admin] Initialization failed:', _error)
    }
  }
} else {
  adminAuth = getAuth(getApps()[0])
}

type AssignUserRoleProps = {
  firebaseUid: string
  email: string
}

/**
 * Assigns a role to a user based on their email address
 * @param props - The Firebase user properties
 * @returns Promise<Role> - The assigned role
 */
export const assignUserRole = async (
  props: Readonly<AssignUserRoleProps>
): Promise<Role> => {
  const { email } = props
  const superAdminEmails =
    process.env.SUPER_ADMIN_EMAILS?.split(',').map(emailItem => emailItem.trim()) || []

  if (superAdminEmails.includes(email)) {
    return Role.ADMIN
  }

  return Role.PUBLIC // Default role for new users
}

type CreateOrUpdateUserProps = {
  firebaseUser: FirebaseUser
}

/**
 * Creates or updates a user in the database based on Firebase authentication
 * @param props - The Firebase user data
 * @returns Promise<User> - The created or updated user
 */
export const createOrUpdateUser = async (
  props: Readonly<CreateOrUpdateUserProps>
): Promise<User> => {
  const { firebaseUser } = props

  if (!firebaseUser.email) {
    throw new Error('Firebase user must have an email address')
  }

  // Check if user already exists by firebaseUid
  const existingUser = await prisma.user.findUnique({
    where: { firebaseUid: firebaseUser.uid },
  })

  if (existingUser) {
    // Update existing user
    return await prisma.user.update({
      where: { firebaseUid: firebaseUser.uid },
      // eslint-disable-next-line id-blacklist
      data: {
        email: firebaseUser.email,
        firstName:
          firebaseUser.displayName?.split(' ')[0] || firebaseUser.email.split('@')[0],
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User',
      },
    })
  }

  // If not found by Firebase UID, attempt to link existing user by email
  const existingByEmail = await prisma.user.findUnique({
    where: { email: firebaseUser.email },
  })

  if (existingByEmail) {
    // Link firebaseUid to existing user and update profile fields, preserve role
    return await prisma.user.update({
      where: { id: existingByEmail.id },
      // eslint-disable-next-line id-blacklist
      data: {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName:
          firebaseUser.displayName?.split(' ')[0] || firebaseUser.email.split('@')[0],
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User',
      },
    })
  }

  // Create new user with role assignment
  const assignedRole = await assignUserRole({
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
  })

  return await prisma.user.create({
    // eslint-disable-next-line id-blacklist
    data: {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      firstName:
        firebaseUser.displayName?.split(' ')[0] || firebaseUser.email.split('@')[0],
      lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User',
      role: assignedRole,
    },
  })
}

/**
 * Verifies a Firebase ID token and returns the decoded token
 * @param idToken - The Firebase ID token to verify
 * @returns Promise<DecodedIdToken> - The decoded token with user information
 * @throws Error if token is invalid or verification fails
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  // Handle mock tokens in test environment
  if (process.env.PLAYWRIGHT_TEST === 'true' && idToken.startsWith('mock-jwt-')) {
    const prefix = 'mock-jwt-header.payload.signature-'
    const email = idToken.startsWith(prefix)
      ? idToken.slice(prefix.length)
      : idToken.split('-').pop() || 'test@example.com'

    // Create a mock decoded token matching Firebase's DecodedIdToken format
    const mockDecodedToken: DecodedIdToken = {
      iss: 'https://securetoken.google.com/mock-project',
      aud: 'mock-project',
      auth_time: Math.floor(Date.now() / 1000),
      user_id: email.includes('admin') ? 'admin-user-id' : 'regular-user-id',
      sub: email.includes('admin') ? 'admin-user-id' : 'regular-user-id',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      email,
      email_verified: true,
      firebase: {
        identities: {
          'google.com': ['google-user-id'],
          email: [email],
        },
        sign_in_provider: 'google.com',
      },
      uid: email.includes('admin') ? 'admin-user-id' : 'regular-user-id',
      name: email.includes('admin') ? 'Test Admin' : 'Test Manager',
      picture: undefined,
    }

    return mockDecodedToken
  }

  if (!adminAuth) {
    throw new Error('Firebase Admin SDK not initialized')
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error during verifyIdToken'
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error('[firebase-admin] verifyIdToken error:', message)
    }
    throw new Error(`Invalid Firebase ID token: ${message}`)
  }
}

export { adminApp, adminAuth }
export type { App, Auth, DecodedIdToken }
