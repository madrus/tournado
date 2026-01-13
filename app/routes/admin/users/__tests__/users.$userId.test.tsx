import type { Role } from '@prisma/client'
import type { ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { validateRole } from '~/features/users/utils/roleUtils'
import {
	deactivateUser,
	reactivateUser,
	updateUserDisplayName,
	updateUserRole,
} from '~/models/user.server'
import { adminPath } from '~/utils/adminRoutes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { action } from '../users.$userId'

// Mock dependencies
vi.mock('~/utils/routeUtils.server', () => ({
	requireUserWithMetadata: vi.fn(),
}))

vi.mock('~/models/user.server', () => ({
	updateUserDisplayName: vi.fn(),
	updateUserRole: vi.fn(),
	deactivateUser: vi.fn(),
	reactivateUser: vi.fn(),
	getUserById: vi.fn(),
}))

vi.mock('~/features/users/utils/roleUtils', () => ({
	validateRole: vi.fn((role: unknown) => {
		if (typeof role === 'string' && ['ADMIN', 'MANAGER', 'PUBLIC'].includes(role)) {
			return role
		}
		throw new Error('Invalid role')
	}),
}))

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router')
	return {
		...actual,
		redirect: vi.fn(
			(url: string) => new Response(null, { status: 302, headers: { Location: url } }),
		),
	}
})

describe('users.$userId route action', () => {
	const mockCurrentUser = {
		id: 'current-user-id',
		email: 'current@example.com',
		firstName: 'Current',
		lastName: 'User',
		firebaseUid: 'firebase-uid-current',
		displayName: 'Current User',
		role: 'ADMIN' as Role,
		active: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const mockTargetUserId = 'target-user-id'

	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(requireUserWithMetadata).mockResolvedValue(mockCurrentUser)
	})

	const createActionArgs = (
		formData: FormData,
		userId: string,
	): ActionFunctionArgs => ({
		request: new Request('http://localhost', {
			method: 'POST',
			body: formData,
		}),
		params: { userId },
		context: {},
		unstable_pattern: adminPath('/users/:userId'),
	})

	describe('updateDisplayName intent', () => {
		it('should successfully update display name', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateDisplayName')
			formData.append('displayName', 'New Display Name')

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(updateUserDisplayName).toHaveBeenCalledWith({
				userId: mockTargetUserId,
				displayName: 'New Display Name',
				performedBy: mockCurrentUser.id,
			})
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockTargetUserId}?success=displayName`),
			)
			expect(response.status).toBe(302)
		})

		it('should reject empty display name', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateDisplayName')
			formData.append('displayName', '')

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(updateUserDisplayName).not.toHaveBeenCalled()
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockTargetUserId}?error=displayNameRequired`),
			)
			expect(response.status).toBe(302)
		})
	})

	describe('updateRole intent', () => {
		it('should successfully update role when userId !== currentUserId', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateRole')
			formData.append('role', 'MANAGER')

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(updateUserRole).toHaveBeenCalledWith({
				userId: mockTargetUserId,
				newRole: 'MANAGER',
				performedBy: mockCurrentUser.id,
			})
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockTargetUserId}?success=role`),
			)
			expect(response.status).toBe(302)
		})

		it('should prevent self-role change when userId === currentUserId', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateRole')
			formData.append('role', 'PUBLIC')

			const response = await action(createActionArgs(formData, mockCurrentUser.id))

			expect(updateUserRole).not.toHaveBeenCalled()
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockCurrentUser.id}?error=cannotChangeOwnRole`),
			)
			expect(response.status).toBe(302)
		})

		it('should redirect with error when role validation fails', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateRole')
			formData.append('role', 'INVALID_ROLE')

			vi.mocked(validateRole).mockImplementationOnce(() => {
				throw new Error('Invalid role')
			})

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(updateUserRole).not.toHaveBeenCalled()
			expect(response.status).toBe(302)
			expect(response.headers.get('Location')).toContain('error=Invalid%20role')
		})
	})

	describe('deactivate intent', () => {
		it('should successfully deactivate user when userId !== currentUserId', async () => {
			const formData = new FormData()
			formData.append('intent', 'deactivate')
			formData.append('userId', mockTargetUserId)

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(deactivateUser).toHaveBeenCalledWith({
				userId: mockTargetUserId,
				performedBy: mockCurrentUser.id,
			})
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockTargetUserId}?success=deactivate`),
			)
			expect(response.status).toBe(302)
		})

		it('should prevent self-deactivation when userId === currentUserId', async () => {
			const formData = new FormData()
			formData.append('intent', 'deactivate')
			formData.append('userId', mockCurrentUser.id)

			const response = await action(createActionArgs(formData, mockCurrentUser.id))

			expect(deactivateUser).not.toHaveBeenCalled()
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockCurrentUser.id}?error=cannotDeactivateOwnAccount`),
			)
			expect(response.status).toBe(302)
		})

		it('should show friendly error when userId missing from payload', async () => {
			const formData = new FormData()
			formData.append('intent', 'deactivate')

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(deactivateUser).not.toHaveBeenCalled()
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockTargetUserId}?error=requestFailed`),
			)
			expect(response.status).toBe(302)
		})

		it('should show friendly error when userId does not match route', async () => {
			const formData = new FormData()
			formData.append('intent', 'deactivate')
			formData.append('userId', 'different-id')

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(deactivateUser).not.toHaveBeenCalled()
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockTargetUserId}?error=requestFailedRefresh`),
			)
			expect(response.status).toBe(302)
		})
	})

	describe('reactivate intent', () => {
		it('should successfully reactivate user when userId !== currentUserId', async () => {
			const formData = new FormData()
			formData.append('intent', 'reactivate')
			formData.append('userId', mockTargetUserId)

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(reactivateUser).toHaveBeenCalledWith({
				userId: mockTargetUserId,
				performedBy: mockCurrentUser.id,
			})
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockTargetUserId}?success=reactivate`),
			)
			expect(response.status).toBe(302)
		})

		it('should prevent self-reactivation when userId === currentUserId', async () => {
			const formData = new FormData()
			formData.append('intent', 'reactivate')
			formData.append('userId', mockCurrentUser.id)

			const response = await action(createActionArgs(formData, mockCurrentUser.id))

			expect(reactivateUser).not.toHaveBeenCalled()
			expect(redirect).toHaveBeenCalledWith(
				adminPath(`/users/${mockCurrentUser.id}?error=cannotReactivateOwnAccount`),
			)
			expect(response.status).toBe(302)
		})
	})

	describe('validation errors', () => {
		it('should redirect with friendly message when route userId is missing', async () => {
			const formData = new FormData()
			formData.append('intent', 'deactivate')
			formData.append('userId', mockTargetUserId)

			const response = await action({
				request: new Request('http://localhost', {
					method: 'POST',
					body: formData,
				}),
				params: {},
				context: {},
			} as ActionFunctionArgs)

			expect(redirect).toHaveBeenCalledWith(adminPath('/users?error=userNotFound'))
			expect(response.status).toBe(302)
		})
	})

	describe('invalid intent handling', () => {
		it('should throw 400 error for invalid intent', async () => {
			const formData = new FormData()
			formData.append('intent', 'invalidIntent')

			try {
				await action(createActionArgs(formData, mockTargetUserId))
				throw new Error('Expected action to throw')
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(Response)
				const response = error as Response
				expect(response.status).toBe(400)
				const text = await response.text()
				expect(text).toBe('Invalid intent')
			}
		})

		it('should throw 400 error for missing intent', async () => {
			const formData = new FormData()

			try {
				await action(createActionArgs(formData, mockTargetUserId))
				throw new Error('Expected action to throw')
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(Response)
				const response = error as Response
				expect(response.status).toBe(400)
				const text = await response.text()
				expect(text).toBe('Invalid intent')
			}
		})
	})

	describe('error handling', () => {
		it('should redirect with error message when update fails', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateDisplayName')
			formData.append('displayName', 'Test')

			const errorMessage = 'Database connection failed'
			vi.mocked(updateUserDisplayName).mockRejectedValue(new Error(errorMessage))

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(response.status).toBe(302)
			expect(response.headers.get('Location')).toBe(
				adminPath(
					`/users/${mockTargetUserId}?error=${encodeURIComponent(errorMessage)}`,
				),
			)
		})

		it('should handle unknown error types', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateDisplayName')
			formData.append('displayName', 'Test')

			vi.mocked(updateUserDisplayName).mockRejectedValue('Unknown error')

			const response = await action(createActionArgs(formData, mockTargetUserId))

			expect(response.status).toBe(302)
			expect(response.headers.get('Location')).toBe(
				adminPath(`/users/${mockTargetUserId}?error=unknownError`),
			)
		})

		it('should re-throw Response errors', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateDisplayName')
			formData.append('displayName', 'Test')

			const responseError = new Response('Not found', { status: 404 })
			vi.mocked(updateUserDisplayName).mockRejectedValue(responseError)

			await expect(
				action(createActionArgs(formData, mockTargetUserId)),
			).rejects.toEqual(responseError)
		})
	})

	describe('missing userId parameter', () => {
		it('should redirect with friendly error when userId is missing', async () => {
			const formData = new FormData()
			formData.append('intent', 'updateDisplayName')

			const args: ActionFunctionArgs = {
				request: new Request('http://localhost', {
					method: 'POST',
					body: formData,
				}),
				params: {}, // No userId
				context: {},
				unstable_pattern: adminPath('/users/:userId'),
			}

			const response = await action(args)

			expect(redirect).toHaveBeenCalledWith(adminPath('/users?error=userNotFound'))
			expect(response.status).toBe(302)
		})
	})
})
