import admin from 'firebase-admin'
import { type App, getApps, initializeApp } from 'firebase-admin/app'
import { type Auth, type DecodedIdToken, getAuth } from 'firebase-admin/auth'

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
      // eslint-disable-next-line no-console
      console.warn('Firebase Admin SDK: Missing required environment variables')
    } else {
      adminApp = initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.projectId,
      })

      adminAuth = getAuth(adminApp)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Firebase Admin SDK initialization failed:', error)
  }
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
    throw new Error(
      `Invalid Firebase ID token: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export { adminApp, adminAuth }
export type { App, Auth, DecodedIdToken }
