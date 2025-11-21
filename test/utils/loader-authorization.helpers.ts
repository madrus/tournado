import type { Role, User } from '@prisma/client'

import { describe, expect, it, vi } from 'vitest'

import type { RouteMetadata } from '~/utils/routeTypes'

/**
 * Authorization test case for a specific role
 */
export type AuthTestCase = {
	role: Role
	shouldAccess: boolean
	description: string
}

/**
 * Factory to generate authorization test cases from route metadata
 */
export function generateAuthTestCases(metadata?: RouteMetadata): AuthTestCase[] {
	const { authorization } = metadata || {}

	if (!authorization?.requiredRoles) {
		// No role restriction - all authenticated users can access
		const allRoles: Role[] = ['PUBLIC', 'REFEREE', 'EDITOR', 'BILLING', 'MANAGER', 'ADMIN']
		return allRoles.map((role) => ({
			role,
			shouldAccess: true,
			description: `${role} users should access (no role restriction)`,
		}))
	}

	// All required roles are already Prisma Role type (no mapping needed)
	const allowedRoles: Role[] = authorization.requiredRoles

	// Generate test cases for all 6 Prisma roles
	const allRoles: Role[] = ['PUBLIC', 'REFEREE', 'EDITOR', 'BILLING', 'MANAGER', 'ADMIN']

	return allRoles.map((role) => ({
		role,
		shouldAccess: allowedRoles.includes(role),
		description: allowedRoles.includes(role)
			? `${role} users should access (allowed role)`
			: `${role} users should be blocked (unauthorized)`,
	}))
}

/**
 * Create mock user with specified role
 */
export const createMockUser = (role: Role): User => ({
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

/**
 * Unit test factory for route loader authorization
 * Generates comprehensive authorization tests from route metadata
 */
export function createLoaderAuthTests<
	TParams extends Record<string, string | undefined> = Record<string, never>,
	TContext extends Record<string, unknown> = Record<string, never>,
>(options: {
	routePath: string
	metadata?: RouteMetadata
	loaderFunction: (args: {
		request: Request
		params: TParams
		context: TContext
		unstable_pattern: string
	}) => Promise<unknown>
}): void {
	const { routePath, metadata, loaderFunction } = options
	const testCases = generateAuthTestCases(metadata)

	describe(`Loader Authorization: ${routePath}`, () => {
		// Test each role
		testCases.forEach(({ role, shouldAccess, description }) => {
			it(description, async () => {
				// Mock getUser to return user with specified role
				const { getUser } = await import('~/utils/session.server')
				const mockUser = createMockUser(role)
				vi.mocked(getUser).mockResolvedValue(mockUser)

				const request = new Request(`http://localhost${routePath}`)

				if (shouldAccess) {
					// Should not throw
					await expect(
						loaderFunction({
							request,
							params: {} as TParams,
							context: {} as TContext,
							unstable_pattern: routePath,
						}),
					).resolves.toBeDefined()
				} else {
					// Should throw redirect to /unauthorized
					await expect(
						loaderFunction({
							request,
							params: {} as TParams,
							context: {} as TContext,
							unstable_pattern: routePath,
						}),
					).rejects.toThrow()
				}
			})
		})

		// Test unauthenticated access
		it('should redirect unauthenticated users to signin', async () => {
			const { getUser } = await import('~/utils/session.server')
			vi.mocked(getUser).mockResolvedValue(null)

			const request = new Request(`http://localhost${routePath}`)
			await expect(
				loaderFunction({
					request,
					params: {} as TParams,
					context: {} as TContext,
					unstable_pattern: routePath,
				}),
			).rejects.toThrow()
		})
	})
}
