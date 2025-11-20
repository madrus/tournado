import type { Role } from '@prisma/client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loader } from '~/routes/api.teams'
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

beforeEach(() => {
	vi.clearAllMocks()
})

describe('Resource Route: /api/teams', () => {
	// Test roles with teams:read permission
	const rolesWithAccess: Role[] = ['PUBLIC', 'REFEREE', 'EDITOR', 'BILLING', 'MANAGER', 'ADMIN']

	rolesWithAccess.forEach((role) => {
		it(`${role} users should access (has teams:read permission)`, async () => {
			const mockUser = createMockUser(role)
			vi.mocked(getUser).mockResolvedValue(mockUser)

			const request = new Request('http://localhost/api/teams')

			const response = await loader({ request, params: {}, context: {} })
			const json = await response.json()

			// Verify RBAC middleware was called with correct permission
			expect(vi.mocked(requireUserWithPermission)).toHaveBeenCalledWith(
				expect.any(Request),
				'teams:read',
			)

			expect(response.status).toBe(200)
			expect(json).toHaveProperty('teams')
			expect(Array.isArray(json.teams)).toBe(true)
		})
	})

	it('should redirect unauthenticated users to signin', async () => {
		vi.mocked(getUser).mockResolvedValue(null)

		const request = new Request('http://localhost/api/teams')

		try {
			await loader({ request, params: {}, context: {} })
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
			expect(location).toContain('redirectTo=%2Fapi%2Fteams')
		}
	})

	it('should return team list items', async () => {
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
