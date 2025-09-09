import { redirect } from 'react-router'

import type { User } from '~/models/user.server'
import { getUser } from '~/utils/session.server'

import { validateFirebaseSession } from './session.server'

/**
 * Authenticate user from either Firebase session or legacy session
 * This function provides unified authentication that works with both systems
 */
export async function authenticateFirebaseUser(request: Request): Promise<User | null> {
  // First, try to validate Firebase session
  const firebaseResult = await validateFirebaseSession({ request })
  if (firebaseResult) {
    return firebaseResult.user
  }

  // Fall back to legacy session authentication
  return await getUser(request)
}

/**
 * Require Firebase authentication with redirect on failure
 * This function ensures the user is authenticated via Firebase or legacy session
 */
export async function requireFirebaseAuth(
  request: Request,
  redirectTo?: string
): Promise<User> {
  const user = await authenticateFirebaseUser(request)

  if (!user) {
    const url = new URL(request.url)
    const currentPath = `${url.pathname}${url.search}`
    const searchParams = new URLSearchParams([
      ['redirectTo', redirectTo || currentPath],
    ])
    throw redirect(`/auth/signin?${searchParams}`)
  }

  return user
}

/**
 * Get Firebase user without requiring authentication
 * Returns null if not authenticated
 */
export const getFirebaseUser = async (request: Request): Promise<User | null> =>
  await authenticateFirebaseUser(request)
