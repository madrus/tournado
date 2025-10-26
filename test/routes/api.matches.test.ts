import type { Role } from '@prisma/client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loader } from '~/routes/api.matches'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

// Mock RBAC middleware to actually check permissions
vi.mock('~/utils/rbacMiddleware.server', async () => {
  const actual = await vi.importActual<typeof import('~/utils/rbacMiddleware.server')>(
    '~/utils/rbacMiddleware.server'
  )
  return {
    ...actual,
    requireUserWithPermission: vi.fn(actual.requireUserWithPermission),
  }
})

const createMockUser = (role: Role) => ({
  id: `test-${role}`,
  email: `test-${role.toLowerCase()}@example.com`,
  firstName: 'Test',
  lastName: role,
  role,
  firebaseUid: `test-${role.toLowerCase()}-uid`,
  displayName: null,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Resource Route: /api/matches (PLACEHOLDER)', () => {
  // Test roles with matches:read permission
  const rolesWithAccess: Role[] = [
    'PUBLIC',
    'REFEREE',
    'EDITOR',
    'BILLING',
    'MANAGER',
    'ADMIN',
  ]

  rolesWithAccess.forEach(role => {
    it(`${role} users should receive placeholder response (has matches:read permission)`, async () => {
      const { getUser } = await import('~/utils/session.server')
      const mockUser = createMockUser(role)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const request = new Request('http://localhost/api/matches')

      const response = await loader({ request, params: {}, context: {} })
      const json = await response.json()

      expect(response.status).toBe(501) // Not Implemented
      expect(json).toHaveProperty('error', 'Match API not yet implemented')
      expect(json).toHaveProperty('status', 'placeholder')
    })
  })

  it('should redirect unauthenticated users to signin', async () => {
    const { getUser } = await import('~/utils/session.server')
    vi.mocked(getUser).mockResolvedValue(null)

    const request = new Request('http://localhost/api/matches')
    await expect(loader({ request, params: {}, context: {} })).rejects.toThrow()
  })
})
