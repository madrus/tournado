import type { Role } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loader } from '~/routes/api.matches'
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

	rolesWithAccess.forEach((role) => {
		it(`${role} users should receive placeholder response (has matches:read permission)`, async () => {
			const mockUser = createMockUser(role)
			vi.mocked(getUser).mockResolvedValue(mockUser)

			const request = new Request('http://localhost/api/matches')

			const response = await loader({
				request,
				params: {},
				context: {},
				unstable_pattern: '/api.matches',
			})
			const json = await response.json()

			// Verify RBAC middleware was called with correct permission
			expect(vi.mocked(requireUserWithPermission)).toHaveBeenCalledWith(
				expect.any(Request),
				'matches:read',
			)

			expect(response.status).toBe(501) // Not Implemented
			expect(json).toHaveProperty('error', 'Match API not yet implemented')
			expect(json).toHaveProperty('status', 'placeholder')
		})
	})

	it('should redirect unauthenticated users to signin', async () => {
		vi.mocked(getUser).mockResolvedValue(null)

		const request = new Request('http://localhost/api/matches')

		try {
			await loader({
				request,
				params: {},
				context: {},
				unstable_pattern: '/api.matches',
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
			expect(location).toContain('redirectTo=%2Fapi%2Fmatches')
		}
	})
})
