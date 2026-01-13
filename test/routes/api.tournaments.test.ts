import type { Role } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loader } from '~/routes/api.tournaments'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'
import { getUser } from '~/utils/session.server'
import { createMockUser } from '../utils/loader-authorization.helpers'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

// Mock RBAC middleware to actually check permissions
vi.mock('~/utils/rbacMiddleware.server', async () => {
  const actual = await vi.importActual<typeof import('~/utils/rbacMiddleware.server')>(
    '~/utils/rbacMiddleware.server',
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
      const mockUser = createMockUser(role)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const request = new Request('http://localhost/api/tournaments')

      const response = await loader({
        request,
        params: {},
        context: {},
        unstable_pattern: '/api.tournaments',
      })
      const json = await response.json()

      // Verify RBAC middleware was called with correct permission
      expect(vi.mocked(requireUserWithPermission)).toHaveBeenCalledWith(
        expect.any(Request),
        'tournaments:read',
      )

      expect(response.status).toBe(200)
      expect(json).toHaveProperty('tournaments')
      expect(Array.isArray(json.tournaments)).toBe(true)
    })
  })

  it('should redirect unauthenticated users to signin', async () => {
    vi.mocked(getUser).mockResolvedValue(null)

    const request = new Request('http://localhost/api/tournaments')

    try {
      await loader({
        request,
        params: {},
        context: {},
        unstable_pattern: '/api.tournaments',
      })
      expect.fail('Expected loader to throw redirect')
    } catch (error) {
      // React Router redirects are Response objects
      expect(error).toBeInstanceOf(Response)
      const response = error as Response
      expect(response.status).toBeGreaterThanOrEqual(300)
      expect(response.status).toBeLessThan(400)

      // Verify redirect destination
      const location = response.headers.get('Location')
      expect(location).toBeTruthy()
      expect(location).toContain('/auth/signin')
      expect(location).toContain('redirectTo=%2Fapi%2Ftournaments')
    }
  })

  it('should serialize dates to ISO strings', async () => {
    const mockUser = createMockUser('MANAGER')
    vi.mocked(getUser).mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/tournaments')

    const response = await loader({
      request,
      params: {},
      context: {},
      unstable_pattern: '/api.tournaments',
    })
    const json = await response.json()

    expect(json.tournaments[0].startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(json.tournaments[0].endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
