import type { Role } from '@prisma/client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loader } from '~/routes/api.teams'

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

// Mock team model
vi.mock('~/models/team.server', () => ({
  getAllTeams: vi.fn(() => [
    {
      id: '1',
      name: 'Team A',
      clubName: 'Club X',
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

describe('Resource Route: /api/teams', () => {
  // Test roles with teams:read permission
  const rolesWithAccess: Role[] = [
    'PUBLIC',
    'REFEREE',
    'EDITOR',
    'BILLING',
    'MANAGER',
    'ADMIN',
  ]

  rolesWithAccess.forEach(role => {
    it(`${role} users should access (has teams:read permission)`, async () => {
      const { getUser } = await import('~/utils/session.server')
      const mockUser = createMockUser(role)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const request = new Request('http://localhost/api/teams')

      const response = await loader({ request, params: {}, context: {} })
      const json = await response.json()

      expect(json).toHaveProperty('teams')
      expect(Array.isArray(json.teams)).toBe(true)
    })
  })

  it('should redirect unauthenticated users to signin', async () => {
    const { getUser } = await import('~/utils/session.server')
    vi.mocked(getUser).mockResolvedValue(null)

    const request = new Request('http://localhost/api/teams')
    await expect(loader({ request, params: {}, context: {} })).rejects.toThrow()
  })

  it('should return team list items', async () => {
    const { getUser } = await import('~/utils/session.server')
    const mockUser = createMockUser('MANAGER')
    vi.mocked(getUser).mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/teams')

    const response = await loader({ request, params: {}, context: {} })
    const json = await response.json()

    expect(json.teams).toHaveLength(1)
    expect(json.teams[0]).toHaveProperty('id', '1')
    expect(json.teams[0]).toHaveProperty('name', 'Team A')
    expect(json.teams[0]).toHaveProperty('clubName', 'Club X')
  })
})
