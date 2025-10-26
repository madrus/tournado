import type { Role } from '@prisma/client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loader } from '~/routes/api.tournaments'

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

// Mock tournament model
vi.mock('~/models/tournament.server', () => ({
  getAllTournaments: vi.fn(() => [
    {
      id: '1',
      name: 'Test Tournament',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
    },
  ]),
}))

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

describe('Resource Route: /api/tournaments', () => {
  // Test roles with tournaments:read permission
  const rolesWithAccess: Role[] = [
    'PUBLIC',
    'REFEREE',
    'EDITOR',
    'BILLING',
    'MANAGER',
    'ADMIN',
  ]

  rolesWithAccess.forEach(role => {
    it(`${role} users should access (has tournaments:read permission)`, async () => {
      const { getUser } = await import('~/utils/session.server')
      const mockUser = createMockUser(role)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const request = new Request('http://localhost/api/tournaments')

      const response = await loader({ request, params: {}, context: {} })
      const json = await response.json()

      expect(json).toHaveProperty('tournaments')
      expect(Array.isArray(json.tournaments)).toBe(true)
    })
  })

  it('should redirect unauthenticated users to signin', async () => {
    const { getUser } = await import('~/utils/session.server')
    vi.mocked(getUser).mockResolvedValue(null)

    const request = new Request('http://localhost/api/tournaments')
    await expect(loader({ request, params: {}, context: {} })).rejects.toThrow()
  })

  it('should serialize dates to ISO strings', async () => {
    const { getUser } = await import('~/utils/session.server')
    const mockUser = createMockUser('MANAGER')
    vi.mocked(getUser).mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/tournaments')

    const response = await loader({ request, params: {}, context: {} })
    const json = await response.json()

    expect(json.tournaments[0].startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(json.tournaments[0].endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
