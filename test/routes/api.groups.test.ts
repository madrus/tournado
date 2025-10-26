import type { Role } from '@prisma/client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loader } from '~/routes/api.groups'

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

// Mock group model
vi.mock('~/models/group.server', () => ({
  getTournamentGroupSets: vi.fn(() => [
    {
      id: '1',
      name: 'Group Set A',
      tournamentId: 'test-tournament-id',
      categories: ['U12', 'U14'],
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

describe('Resource Route: /api/groups', () => {
  // Test roles with groups:manage permission
  const rolesWithAccess: Role[] = ['REFEREE', 'MANAGER', 'ADMIN']

  rolesWithAccess.forEach(role => {
    it(`${role} users should access (has groups:manage permission)`, async () => {
      const { getUser } = await import('~/utils/session.server')
      const mockUser = createMockUser(role)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const request = new Request(
        'http://localhost/api/groups?tournament=test-tournament-id'
      )

      const response = await loader({ request, params: {}, context: {} })
      const json = await response.json()

      expect(json).toHaveProperty('groupSets')
      expect(Array.isArray(json.groupSets)).toBe(true)
    })
  })

  // Test roles WITHOUT groups:manage permission
  const rolesWithoutAccess: Role[] = ['PUBLIC', 'EDITOR', 'BILLING']

  rolesWithoutAccess.forEach(role => {
    it(`${role} users should be denied (no groups:manage permission)`, async () => {
      const { getUser } = await import('~/utils/session.server')
      const mockUser = createMockUser(role)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const request = new Request(
        'http://localhost/api/groups?tournament=test-tournament-id'
      )

      await expect(loader({ request, params: {}, context: {} })).rejects.toThrow()
    })
  })

  it('should redirect unauthenticated users to signin', async () => {
    const { getUser } = await import('~/utils/session.server')
    vi.mocked(getUser).mockResolvedValue(null)

    const request = new Request(
      'http://localhost/api/groups?tournament=test-tournament-id'
    )
    await expect(loader({ request, params: {}, context: {} })).rejects.toThrow()
  })

  it('should return 400 if tournament parameter is missing', async () => {
    const { getUser } = await import('~/utils/session.server')
    const mockUser = createMockUser('MANAGER')
    vi.mocked(getUser).mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/groups')

    const response = await loader({ request, params: {}, context: {} })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toHaveProperty('error', 'Missing required parameter')
  })

  it('should return group sets for the specified tournament', async () => {
    const { getUser } = await import('~/utils/session.server')
    const mockUser = createMockUser('MANAGER')
    vi.mocked(getUser).mockResolvedValue(mockUser)

    const request = new Request(
      'http://localhost/api/groups?tournament=test-tournament-id'
    )

    const response = await loader({ request, params: {}, context: {} })
    const json = await response.json()

    expect(json.groupSets).toHaveLength(1)
    expect(json.groupSets[0]).toHaveProperty('id', '1')
    expect(json.groupSets[0]).toHaveProperty('name', 'Group Set A')
    expect(json.groupSets[0]).toHaveProperty('tournamentId', 'test-tournament-id')
  })
})
