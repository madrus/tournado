import type { ActionFunctionArgs } from 'react-router'

import type { Role } from '@prisma/client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

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
      (url: string) => new Response(null, { status: 302, headers: { Location: url } })
    ),
  }
})

const { requireUserWithMetadata } = await import('~/utils/routeUtils.server')
const { updateUserDisplayName, updateUserRole, deactivateUser, reactivateUser } =
  await import('~/models/user.server')
const { redirect } = await import('react-router')

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
    userId: string
  ): ActionFunctionArgs => ({
    request: new Request('http://localhost', {
      method: 'POST',
      body: formData,
    }),
    params: { userId },
    context: {},
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
        `/a7k9m2x5p8w1n4q6r3y8b5t1/users/${mockTargetUserId}?success=displayName`
      )
      expect(response.status).toBe(302)
    })

    it('should handle empty display name', async () => {
      const formData = new FormData()
      formData.append('intent', 'updateDisplayName')
      formData.append('displayName', '')

      await action(createActionArgs(formData, mockTargetUserId))

      expect(updateUserDisplayName).toHaveBeenCalledWith({
        userId: mockTargetUserId,
        displayName: '',
        performedBy: mockCurrentUser.id,
      })
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
        `/a7k9m2x5p8w1n4q6r3y8b5t1/users/${mockTargetUserId}?success=role`
      )
      expect(response.status).toBe(302)
    })

    it('should prevent self-role change when userId === currentUserId', async () => {
      const formData = new FormData()
      formData.append('intent', 'updateRole')
      formData.append('role', 'PUBLIC')

      const response = await action(createActionArgs(formData, mockCurrentUser.id))

      expect(updateUserRole).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        errors: { role: 'cannotChangeOwnRole' },
      })
    })
  })

  describe('deactivate intent', () => {
    it('should successfully deactivate user when userId !== currentUserId', async () => {
      const formData = new FormData()
      formData.append('intent', 'deactivate')

      const response = await action(createActionArgs(formData, mockTargetUserId))

      expect(deactivateUser).toHaveBeenCalledWith({
        userId: mockTargetUserId,
        performedBy: mockCurrentUser.id,
      })
      expect(redirect).toHaveBeenCalledWith(
        `/a7k9m2x5p8w1n4q6r3y8b5t1/users/${mockTargetUserId}?success=deactivate`
      )
      expect(response.status).toBe(302)
    })

    it('should prevent self-deactivation when userId === currentUserId', async () => {
      const formData = new FormData()
      formData.append('intent', 'deactivate')

      const response = await action(createActionArgs(formData, mockCurrentUser.id))

      expect(deactivateUser).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        errors: { deactivate: 'cannotDeactivateOwnAccount' },
      })
    })
  })

  describe('reactivate intent', () => {
    it('should successfully reactivate user when userId !== currentUserId', async () => {
      const formData = new FormData()
      formData.append('intent', 'reactivate')

      const response = await action(createActionArgs(formData, mockTargetUserId))

      expect(reactivateUser).toHaveBeenCalledWith({
        userId: mockTargetUserId,
        performedBy: mockCurrentUser.id,
      })
      expect(redirect).toHaveBeenCalledWith(
        `/a7k9m2x5p8w1n4q6r3y8b5t1/users/${mockTargetUserId}?success=reactivate`
      )
      expect(response.status).toBe(302)
    })

    it('should prevent self-reactivation when userId === currentUserId', async () => {
      const formData = new FormData()
      formData.append('intent', 'reactivate')

      const response = await action(createActionArgs(formData, mockCurrentUser.id))

      expect(reactivateUser).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body).toEqual({
        errors: { deactivate: 'cannotReactivateOwnAccount' },
      })
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
        `/a7k9m2x5p8w1n4q6r3y8b5t1/users/${mockTargetUserId}?error=${encodeURIComponent(errorMessage)}`
      )
    })

    it('should handle unknown error types', async () => {
      const formData = new FormData()
      formData.append('intent', 'updateDisplayName')
      formData.append('displayName', 'Test')

      vi.mocked(updateUserDisplayName).mockRejectedValue('Unknown error')

      const response = await action(createActionArgs(formData, mockTargetUserId))

      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toContain('error=Unknown%20error')
    })

    it('should re-throw Response errors', async () => {
      const formData = new FormData()
      formData.append('intent', 'updateDisplayName')
      formData.append('displayName', 'Test')

      const responseError = new Response('Not found', { status: 404 })
      vi.mocked(updateUserDisplayName).mockRejectedValue(responseError)

      await expect(
        action(createActionArgs(formData, mockTargetUserId))
      ).rejects.toEqual(responseError)
    })
  })

  describe('missing userId parameter', () => {
    it('should throw 400 error when userId is missing', async () => {
      const formData = new FormData()
      formData.append('intent', 'updateDisplayName')

      const args: ActionFunctionArgs = {
        request: new Request('http://localhost', {
          method: 'POST',
          body: formData,
        }),
        params: {}, // No userId
        context: {},
      }

      try {
        await action(args)
        throw new Error('Expected action to throw')
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Response)
        const response = error as Response
        expect(response.status).toBe(400)
        const text = await response.text()
        expect(text).toBe('User ID required')
      }
    })
  })
})
