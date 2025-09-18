import type { User } from '@prisma/client'

import { sessionStorage } from '~/utils/session.server'

import { createUser } from './database'

/**
 * Available user roles for testing
 * Now includes EDITOR and BILLING roles (read-only for now)
 */
export type UserRole = 'ADMIN' | 'MANAGER' | 'EDITOR' | 'BILLING' | 'REFEREE' | 'PUBLIC'

/**
 * Create a test session that bypasses Firebase completely
 * This allows fast, reliable authentication for business logic tests
 */
export async function createTestSession(userRole: UserRole): Promise<{
  user: User
  cookie: string
}> {
  // Create user in database with the specified role
  const user = await createUser({
    firstName: 'Test',
    lastName: getLastNameForRole(userRole),
    email: `test-${userRole.toLowerCase()}@test.com`,
    role: userRole,
    firebaseUid: `test-${userRole.toLowerCase()}-uid`,
  })

  // Create session directly (bypass Firebase)
  const session = await sessionStorage.getSession()
  session.set('userId', user.id)
  session.set('firebaseSessionKey', {
    firebaseUid: user.firebaseUid,
    userId: user.id,
    email: user.email,
    displayName: `${user.firstName} ${user.lastName}`,
  })

  const cookie = await sessionStorage.commitSession(session)

  return { user, cookie }
}

/**
 * Get appropriate last name for the role for easy identification in tests
 */
function getLastNameForRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator'
    case 'MANAGER':
      return 'Manager'
    case 'EDITOR':
      return 'Editor'
    case 'BILLING':
      return 'Billing'
    case 'REFEREE':
      return 'Referee'
    case 'PUBLIC':
      return 'User'
    default:
      return 'User'
  }
}

/**
 * Create a session cookie that can be used in Playwright context
 */
export function createSessionCookie(cookieValue: string) {
  return {
    name: 'session',
    value: cookieValue,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
  }
}

/**
 * Quick helper to create test users for different scenarios
 */
export const TestUsers = {
  admin: () => createTestSession('ADMIN'),
  manager: () => createTestSession('MANAGER'),
  editor: () => createTestSession('EDITOR'),
  billing: () => createTestSession('BILLING'),
  referee: () => createTestSession('REFEREE'),
  public: () => createTestSession('PUBLIC'),
} as const
