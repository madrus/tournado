import { redirect } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { User } from '~/models/user.server'

import { requireFirebaseAuth } from '../auth.server'

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

// Mock react-router
vi.mock('react-router', () => ({
  redirect: vi.fn(),
}))

const { getUser } = await import('~/utils/session.server')

describe('auth.server', () => {
  const mockRequest = new Request('http://localhost:3000/test')
  const mockUser: User = {
    id: 'user-123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    firebaseUid: 'firebase-uid-123',
    displayName: null,
    active: true,
    role: 'PUBLIC',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireFirebaseAuth', () => {
    it('should return user when authenticated', async () => {
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const result = await requireFirebaseAuth(mockRequest)

      expect(result).toEqual(mockUser)
    })

    it('should redirect to signin when not authenticated', async () => {
      vi.mocked(getUser).mockResolvedValue(null)
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(requireFirebaseAuth(mockRequest)).rejects.toThrow(
        'Redirect: /auth/signin?redirectTo=%2Ftest'
      )

      expect(redirect).toHaveBeenCalledWith('/auth/signin?redirectTo=%2Ftest')
    })

    it('should use custom redirectTo when provided', async () => {
      vi.mocked(getUser).mockResolvedValue(null)
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(
        requireFirebaseAuth(mockRequest, '/custom-redirect')
      ).rejects.toThrow('Redirect: /auth/signin?redirectTo=%2Fcustom-redirect')

      expect(redirect).toHaveBeenCalledWith(
        '/auth/signin?redirectTo=%2Fcustom-redirect'
      )
    })

    it('should handle request URLs with search params', async () => {
      const requestWithParams = new Request(
        'http://localhost:3000/test?foo=bar&baz=qux'
      )
      vi.mocked(getUser).mockResolvedValue(null)
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(requireFirebaseAuth(requestWithParams)).rejects.toThrow(
        'Redirect: /auth/signin?redirectTo=%2Ftest%3Ffoo%3Dbar%26baz%3Dqux'
      )
    })
  })
})
