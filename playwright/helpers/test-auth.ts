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
  // Add timestamp to ensure unique firebaseUid and email
  const timestamp = Date.now()
  const user = await createUser({
    firstName: 'Test',
    lastName: getLastNameForRole(userRole),
    email: `test-${userRole.toLowerCase()}-${timestamp}@test.com`,
    role: userRole,
    firebaseUid: `test-${userRole.toLowerCase()}-${timestamp}-uid`,
  })

  // Create session directly (bypass Firebase)
  const session = await sessionStorage.getSession()
  session.set('userId', user.id)

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
    expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    httpOnly: false,
    secure: false,
    sameSite: 'Lax' as const,
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
