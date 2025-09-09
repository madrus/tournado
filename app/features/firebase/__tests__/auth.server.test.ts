import { redirect, type Session } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { User } from '~/models/user.server'

import {
  authenticateFirebaseUser,
  getFirebaseUser,
  requireFirebaseAuth,
} from '../auth.server'

// Mock Firebase session utilities
vi.mock('../session.server', () => ({
  validateFirebaseSession: vi.fn(),
}))

// Mock legacy session utilities
vi.mock('~/utils/session.server', () => ({
  getUser: vi.fn(),
}))

// Mock react-router
vi.mock('react-router', () => ({
  redirect: vi.fn(),
}))

const { validateFirebaseSession } = await import('../session.server')
const { getUser } = await import('~/utils/session.server')

describe('auth.server', () => {
  const mockRequest = new Request('http://localhost:3000/test')
  const mockUser: User = {
    id: 'user-123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    firebaseUid: 'firebase-uid-123',
    role: 'PUBLIC',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockSession = { id: 'session-123' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('authenticateFirebaseUser', () => {
    it('should return user from Firebase session when available', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: mockUser,
        session: mockSession as Session,
      })
      vi.mocked(getUser).mockResolvedValue(null)

      const result = await authenticateFirebaseUser(mockRequest)

      expect(result).toEqual(mockUser)
      expect(validateFirebaseSession).toHaveBeenCalledWith({ request: mockRequest })
      expect(getUser).not.toHaveBeenCalled()
    })

    it('should return user from legacy session when Firebase session unavailable', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const result = await authenticateFirebaseUser(mockRequest)

      expect(result).toEqual(mockUser)
      expect(validateFirebaseSession).toHaveBeenCalledWith({ request: mockRequest })
      expect(getUser).toHaveBeenCalledWith(mockRequest)
    })

    it('should return null when no authentication available', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(getUser).mockResolvedValue(null)

      const result = await authenticateFirebaseUser(mockRequest)

      expect(result).toBeNull()
      expect(validateFirebaseSession).toHaveBeenCalledWith({ request: mockRequest })
      expect(getUser).toHaveBeenCalledWith(mockRequest)
    })

    it('should prioritize Firebase session over legacy session', async () => {
      const firebaseUser = { ...mockUser, id: 'firebase-user-123' }
      const legacyUser = { ...mockUser, id: 'legacy-user-123' }

      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: firebaseUser,
        session: mockSession as Session,
      })
      vi.mocked(getUser).mockResolvedValue(legacyUser)

      const result = await authenticateFirebaseUser(mockRequest)

      expect(result).toEqual(firebaseUser)
      expect(getUser).not.toHaveBeenCalled()
    })
  })

  describe('requireFirebaseAuth', () => {
    it('should return user when authenticated', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: mockUser,
        session: mockSession as Session,
      })

      const result = await requireFirebaseAuth(mockRequest)

      expect(result).toEqual(mockUser)
    })

    it('should redirect to signin when not authenticated', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
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
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
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
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(getUser).mockResolvedValue(null)
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(requireFirebaseAuth(requestWithParams)).rejects.toThrow(
        'Redirect: /auth/signin?redirectTo=%2Ftest%3Ffoo%3Dbar%26baz%3Dqux'
      )
    })

    it('should work with legacy session authentication', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const result = await requireFirebaseAuth(mockRequest)

      expect(result).toEqual(mockUser)
    })
  })

  describe('getFirebaseUser', () => {
    it('should return user when authenticated via Firebase', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: mockUser,
        session: mockSession as Session,
      })

      const result = await getFirebaseUser(mockRequest)

      expect(result).toEqual(mockUser)
    })

    it('should return user when authenticated via legacy session', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const result = await getFirebaseUser(mockRequest)

      expect(result).toEqual(mockUser)
    })

    it('should return null when not authenticated', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(getUser).mockResolvedValue(null)

      const result = await getFirebaseUser(mockRequest)

      expect(result).toBeNull()
    })

    it('should be equivalent to authenticateFirebaseUser', async () => {
      // Test that both functions return the same result
      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: mockUser,
        session: mockSession as Session,
      })

      const authResult = await authenticateFirebaseUser(mockRequest)
      const getResult = await getFirebaseUser(mockRequest)

      expect(authResult).toEqual(getResult)
    })
  })
})
