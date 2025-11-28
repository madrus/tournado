import { Role, type User } from '@prisma/client'

import admin from 'firebase-admin'
import { type App, getApps, initializeApp } from 'firebase-admin/app'
import { type Auth, type DecodedIdToken, getAuth } from 'firebase-admin/auth'

import { prisma } from '~/db.server'

import type { FirebaseUser } from './types'

let adminApp: App | null = null
let adminAuth: Auth | null = null

function getServiceAccount() {
	const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
	const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
	const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

	if (!projectId || !clientEmail || !privateKey) {
		return null
	}

	return { projectId, clientEmail, privateKey }
}

function initializeFirebaseAdmin(): void {
	// Use existing Firebase app if available
	if (getApps().length > 0) {
		adminApp = getApps()[0]
		adminAuth = getAuth(adminApp)
		return
	}

	// Initialize Firebase Admin SDK
	try {
		const serviceAccount = getServiceAccount()

		// Validate that all required environment variables are present
		if (!serviceAccount) {
			// Missing required environment variables - adminAuth will remain null
			if (process.env.NODE_ENV !== 'test') {
			}
			return
		}

		adminApp = initializeApp({
			credential: admin.credential.cert({
				projectId: serviceAccount.projectId,
				clientEmail: serviceAccount.clientEmail,
				privateKey: serviceAccount.privateKey,
			}),
			projectId: serviceAccount.projectId,
		})

		adminAuth = getAuth(adminApp)
	} catch (_error) {
		// Firebase Admin SDK initialization failed - adminAuth will remain null
		if (process.env.NODE_ENV !== 'test') {
		}
	}
}

// Initialize Firebase Admin on module load
initializeFirebaseAdmin()

type AssignUserRoleProps = {
	email: string
	currentRole?: Role
}

/**
 * Assigns a role to a user based on their email address and super admin configuration
 * Handles both promotion to ADMIN and demotion from ADMIN to MANAGER
 * @param props - The user identification props (email and optional currentRole)
 * @returns Promise<Role> - The assigned role
 */
export const assignUserRole = async (
	props: Readonly<AssignUserRoleProps>,
): Promise<Role> => {
	const { email, currentRole } = props
	const superAdminEmails =
		process.env.SUPER_ADMIN_EMAILS?.split(',').map((emailItem) => emailItem.trim()) ||
		[]

	// Promote to ADMIN if in super admin list
	if (superAdminEmails.includes(email)) {
		return Role.ADMIN
	}

	// Demote from ADMIN to MANAGER if removed from super admin list
	if (currentRole === Role.ADMIN) {
		return Role.MANAGER
	}

	// For tests, assign roles based on email patterns
	if (process.env.NODE_ENV === 'test') {
		if (email.includes('admin')) {
			return Role.ADMIN
		}
		if (email.includes('manager')) {
			return Role.MANAGER
		}
		if (email.includes('referee')) {
			return Role.REFEREE
		}
	}

	// Preserve existing role for non-admin users, or default to PUBLIC for new users
	return currentRole || Role.PUBLIC
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
	props: Readonly<CreateOrUpdateUserProps>,
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
		// Re-check role assignment on every login based on current SUPER_ADMIN_EMAILS
		const assignedRole = await assignUserRole({
			email: firebaseUser.email,
			currentRole: existingUser.role,
		})

		// Prepare update data
		const updateData: {
			email: string
			firstName: string
			lastName: string
			role?: Role
		} = {
			email: firebaseUser.email,
			firstName:
				firebaseUser.displayName?.split(' ')[0] || firebaseUser.email.split('@')[0],
			lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User',
		}

		// Only update role if it has changed
		if (existingUser.role !== assignedRole) {
			updateData.role = assignedRole
		}

		return await prisma.user.update({
			where: { firebaseUid: firebaseUser.uid },
			data: updateData,
		})
	}

	// If not found by Firebase UID, attempt to link existing user by email
	const existingByEmail = await prisma.user.findUnique({
		where: { email: firebaseUser.email },
	})

	if (existingByEmail) {
		// Link firebaseUid to existing user and update profile fields
		// Re-check role assignment based on current SUPER_ADMIN_EMAILS
		const assignedRole = await assignUserRole({
			email: existingByEmail.email,
			currentRole: existingByEmail.role,
		})

		// Prepare update data
		const updateData: {
			firebaseUid: string
			email: string
			firstName: string
			lastName: string
			role?: Role
		} = {
			firebaseUid: firebaseUser.uid,
			email: firebaseUser.email,
			firstName:
				firebaseUser.displayName?.split(' ')[0] || firebaseUser.email.split('@')[0],
			lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User',
		}

		// Only update role if it has changed
		if (existingByEmail.role !== assignedRole) {
			updateData.role = assignedRole
		}
		return await prisma.user.update({
			where: { id: existingByEmail.id },
			data: updateData,
		})
	}

	// Create new user with role assignment
	const assignedRole = await assignUserRole({
		email: firebaseUser.email,
	})

	return await prisma.user.create({
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
		}
		throw new Error(`Invalid Firebase ID token: ${message}`)
	}
}

/**
 * Disables a Firebase user account
 *
 * Note: This is a best-effort operation. If Firebase Admin SDK is not initialized,
 * the function will log a warning and return without throwing, allowing the application
 * to proceed with database-level deactivation. This differs from critical operations
 * like token verification which must throw if unavailable.
 *
 * @param firebaseUid - The Firebase UID of the user to disable
 * @throws Error if disabling fails (but not if Admin SDK is unavailable)
 */
export async function disableFirebaseUser(firebaseUid: string): Promise<void> {
	if (!firebaseUid?.trim()) {
		throw new Error('firebaseUid must be a non-empty string')
	}

	initializeFirebaseAdmin()
	if (!adminAuth) {
		const serviceAccount = getServiceAccount()
		if (!serviceAccount) {
			console.warn('[firebase-admin] Cannot disable user - Admin SDK not initialized')
			return
		}
		adminApp =
			adminApp ??
			initializeApp({
				credential: admin.credential.cert(serviceAccount),
				projectId: serviceAccount.projectId,
			})
		adminAuth = getAuth(adminApp)
	}
	if (!adminAuth) {
		console.warn('[firebase-admin] Cannot disable user - Admin SDK not initialized')
		return
	}

	try {
		await adminAuth.updateUser(firebaseUid, {
			disabled: true,
		})
		console.log(`[firebase-admin] Successfully disabled Firebase user: ${firebaseUid}`)
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Unknown error during disableFirebaseUser'
		console.error('[firebase-admin] disableFirebaseUser error:', message)
		throw new Error(`Failed to disable Firebase user: ${message}`)
	}
}

/**
 * Enables a Firebase user account
 *
 * Note: This is a best-effort operation. If Firebase Admin SDK is not initialized,
 * the function will log a warning and return without throwing, allowing the application
 * to proceed with database-level activation. This differs from critical operations
 * like token verification which must throw if unavailable.
 *
 * @param firebaseUid - The Firebase UID of the user to enable
 * @throws Error if enabling fails (but not if Admin SDK is unavailable)
 */
export async function enableFirebaseUser(firebaseUid: string): Promise<void> {
	if (!firebaseUid?.trim()) {
		throw new Error('firebaseUid must be a non-empty string')
	}

	initializeFirebaseAdmin()
	if (!adminAuth) {
		const serviceAccount = getServiceAccount()
		if (!serviceAccount) {
			console.warn('[firebase-admin] Cannot enable user - Admin SDK not initialized')
			return
		}
		adminApp =
			adminApp ??
			initializeApp({
				credential: admin.credential.cert(serviceAccount),
				projectId: serviceAccount.projectId,
			})
		adminAuth = getAuth(adminApp)
	}
	if (!adminAuth) {
		console.warn('[firebase-admin] Cannot enable user - Admin SDK not initialized')
		return
	}

	try {
		await adminAuth.updateUser(firebaseUid, {
			disabled: false,
		})
		console.log(`[firebase-admin] Successfully enabled Firebase user: ${firebaseUid}`)
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Unknown error during enableFirebaseUser'
		console.error('[firebase-admin] enableFirebaseUser error:', message)
		throw new Error(`Failed to enable Firebase user: ${message}`)
	}
}

/**
 * Revokes all refresh tokens for a Firebase user, effectively logging them out from all devices
 *
 * Note: This is a best-effort operation. If Firebase Admin SDK is not initialized,
 * the function will log a warning and return without throwing, allowing the application
 * to proceed with database-level operations. This differs from critical operations
 * like token verification which must throw if unavailable.
 *
 * @param firebaseUid - The Firebase UID of the user to revoke tokens for
 * @throws Error if revoking fails (but not if Admin SDK is unavailable)
 */
export async function revokeRefreshTokens(firebaseUid: string): Promise<void> {
	if (!firebaseUid?.trim()) {
		throw new Error('firebaseUid must be a non-empty string')
	}

	initializeFirebaseAdmin()
	if (!adminAuth) {
		const serviceAccount = getServiceAccount()
		if (!serviceAccount) {
			console.warn('[firebase-admin] Cannot revoke tokens - Admin SDK not initialized')
			return
		}
		adminApp =
			adminApp ??
			initializeApp({
				credential: admin.credential.cert(serviceAccount),
				projectId: serviceAccount.projectId,
			})
		adminAuth = getAuth(adminApp)
	}
	if (!adminAuth) {
		console.warn('[firebase-admin] Cannot revoke tokens - Admin SDK not initialized')
		return
	}

	try {
		await adminAuth.revokeRefreshTokens(firebaseUid)
		console.log(
			`[firebase-admin] Successfully revoked refresh tokens for user: ${firebaseUid}`,
		)
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Unknown error during revokeRefreshTokens'
		console.error('[firebase-admin] revokeRefreshTokens error:', message)
		throw new Error(`Failed to revoke refresh tokens: ${message}`)
	}
}

export { adminApp, adminAuth }
export type { App, Auth, DecodedIdToken }
