import type { Session, SessionData } from 'react-router'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { User } from '~/models/user.server'

import type { DecodedIdToken } from '../server'
import {
  clearFirebaseSession,
  createSessionFromFirebaseToken,
  getFirebaseSessionData,
  syncFirebaseUserToDatabase,
  validateFirebaseSession,
} from '../session.server'

// Mock Firebase server
vi.mock('../server', () => ({
  verifyIdToken: vi.fn(),
}))

// Mock user model
vi.mock('~/models/user.server', () => ({
  createUserFromFirebase: vi.fn(),
  getUserByFirebaseUid: vi.fn(),
  updateUserFirebaseData: vi.fn(),
}))

// Mock session utilities
vi.mock('~/utils/session.server', () => ({
  getSession: vi.fn(),
  sessionStorage: {
    commitSession: vi.fn(),
  },
}))

const { verifyIdToken } = await import('../server')
const { createUserFromFirebase, getUserByFirebaseUid, updateUserFirebaseData } =
  await import('~/models/user.server')
const { getSession } = await import('~/utils/session.server')

describe('firebaseSession.server', () => {
  const mockRequest = new Request('http://localhost:3000')
  const mockDecodedToken: DecodedIdToken = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    name: 'Test User',
    aud: 'test-project',
    auth_time: Date.now(),
    exp: Date.now() + 3600,
    firebase: {
      identities: {},
      sign_in_provider: 'password',
    },
    iat: Date.now(),
    iss: 'test-issuer',
    sub: 'firebase-uid-123',
  }

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

  const mockSession = {
    get: vi.fn(),
    set: vi.fn(),
    unset: vi.fn(),
    has: vi.fn(),
    flash: vi.fn(),
    id: 'mock-session-id',
    // eslint-disable-next-line id-blacklist
    data: {},
  } as Session<SessionData, SessionData>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getSession).mockResolvedValue(mockSession)
  })

  describe('createSessionFromFirebaseToken', () => {
    it('should create session for valid Firebase token with existing user', async () => {
      const validToken = 'valid-firebase-token'

      vi.mocked(verifyIdToken).mockResolvedValue(mockDecodedToken)
      vi.mocked(getUserByFirebaseUid).mockResolvedValue(mockUser)
      vi.mocked(updateUserFirebaseData).mockResolvedValue(mockUser)

      const result = await createSessionFromFirebaseToken({
        idToken: validToken,
        request: mockRequest,
      })

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
        isNewUser: false,
      })
      expect(mockSession.set).toHaveBeenCalledWith('userId', 'user-123')
      expect(mockSession.set).toHaveBeenCalledWith('firebaseSession', {
        firebaseUid: 'firebase-uid-123',
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      })
    })

    it('should create session for new user', async () => {
      const validToken = 'valid-firebase-token'

      vi.mocked(verifyIdToken).mockResolvedValue(mockDecodedToken)
      vi.mocked(getUserByFirebaseUid).mockResolvedValue(null)
      vi.mocked(createUserFromFirebase).mockResolvedValue(mockUser)

      const result = await createSessionFromFirebaseToken({
        idToken: validToken,
        request: mockRequest,
      })

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
        isNewUser: true,
      })
      expect(createUserFromFirebase).toHaveBeenCalledWith({
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
      })
    })

    it('should return null for invalid Firebase token', async () => {
      const invalidToken = 'invalid-firebase-token'

      vi.mocked(verifyIdToken).mockRejectedValue(new Error('Invalid token'))

      const result = await createSessionFromFirebaseToken({
        idToken: invalidToken,
        request: mockRequest,
      })

      expect(result).toBeNull()
    })

    it('should handle token without displayName', async () => {
      const tokenWithoutName = { ...mockDecodedToken, name: undefined }
      vi.mocked(verifyIdToken).mockResolvedValue(tokenWithoutName)
      vi.mocked(getUserByFirebaseUid).mockResolvedValue(mockUser)
      vi.mocked(updateUserFirebaseData).mockResolvedValue(mockUser)

      const _result = await createSessionFromFirebaseToken({
        idToken: 'token',
        request: mockRequest,
      })

      expect(mockSession.set).toHaveBeenCalledWith('firebaseSession', {
        firebaseUid: 'firebase-uid-123',
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      })
    })
  })

  describe('syncFirebaseUserToDatabase', () => {
    it('should update existing user found by Firebase UID', async () => {
      const updatedUser = { ...mockUser, email: 'updated@example.com' }

      vi.mocked(getUserByFirebaseUid).mockResolvedValue(mockUser)
      vi.mocked(updateUserFirebaseData).mockResolvedValue(updatedUser)

      const result = await syncFirebaseUserToDatabase({
        firebaseUser: mockDecodedToken,
      })

      expect(result).toEqual({ user: updatedUser, isNewUser: false })
      expect(updateUserFirebaseData).toHaveBeenCalledWith({
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      })
    })

    it('should create new user when not found by Firebase UID', async () => {
      vi.mocked(getUserByFirebaseUid).mockResolvedValue(null)
      vi.mocked(createUserFromFirebase).mockResolvedValue(mockUser)

      const result = await syncFirebaseUserToDatabase({
        firebaseUser: mockDecodedToken,
      })

      expect(result).toEqual({ user: mockUser, isNewUser: true })
      expect(createUserFromFirebase).toHaveBeenCalledWith({
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
      })
    })

    it('should throw error for Firebase user without email', async () => {
      const tokenWithoutEmail = { ...mockDecodedToken, email: undefined }

      await expect(
        syncFirebaseUserToDatabase({
          firebaseUser: tokenWithoutEmail as DecodedIdToken,
        })
      ).rejects.toThrow('Firebase user must have an email address')
    })

    it('should handle Firebase user without displayName', async () => {
      const tokenWithoutName = { ...mockDecodedToken, name: undefined }
      vi.mocked(getUserByFirebaseUid).mockResolvedValue(null)
      vi.mocked(createUserFromFirebase).mockResolvedValue(mockUser)

      await syncFirebaseUserToDatabase({
        firebaseUser: tokenWithoutName,
      })

      expect(createUserFromFirebase).toHaveBeenCalledWith({
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        displayName: undefined,
      })
    })
  })

  describe('validateFirebaseSession', () => {
    it('should validate valid Firebase session', async () => {
      const firebaseSessionData = {
        firebaseUid: 'firebase-uid-123',
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      vi.mocked(mockSession.get)
        .mockReturnValueOnce(firebaseSessionData) // First call for Firebase session data
        .mockReturnValueOnce('user-123') // Second call for userId

      vi.mocked(getUserByFirebaseUid).mockResolvedValue(mockUser)

      const result = await validateFirebaseSession({
        request: mockRequest,
      })

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      })
      expect(getUserByFirebaseUid).toHaveBeenCalledWith('firebase-uid-123')
    })

    it('should return null for missing Firebase session data', async () => {
      vi.mocked(mockSession.get).mockReturnValue(null)

      const result = await validateFirebaseSession({
        request: mockRequest,
      })

      expect(result).toBeNull()
    })

    it('should return null for Firebase session data without userId', async () => {
      const invalidSessionData = {
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
      }

      vi.mocked(mockSession.get).mockReturnValue(invalidSessionData)

      const result = await validateFirebaseSession({
        request: mockRequest,
      })

      expect(result).toBeNull()
    })

    it('should return null for mismatched user IDs', async () => {
      const firebaseSessionData = {
        firebaseUid: 'firebase-uid-123',
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      vi.mocked(mockSession.get)
        .mockReturnValueOnce(firebaseSessionData)
        .mockReturnValueOnce('different-user-id')

      const result = await validateFirebaseSession({
        request: mockRequest,
      })

      expect(result).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      const firebaseSessionData = {
        firebaseUid: 'firebase-uid-123',
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      vi.mocked(mockSession.get)
        .mockReturnValueOnce(firebaseSessionData)
        .mockReturnValueOnce('user-123')

      vi.mocked(getUserByFirebaseUid).mockResolvedValue(null)

      const result = await validateFirebaseSession({
        request: mockRequest,
      })

      expect(result).toBeNull()
    })

    it('should return null for user ID mismatch between database and session', async () => {
      const firebaseSessionData = {
        firebaseUid: 'firebase-uid-123',
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      const differentUser = { ...mockUser, id: 'different-user-id' }

      vi.mocked(mockSession.get)
        .mockReturnValueOnce(firebaseSessionData)
        .mockReturnValueOnce('user-123')

      vi.mocked(getUserByFirebaseUid).mockResolvedValue(differentUser)

      const result = await validateFirebaseSession({
        request: mockRequest,
      })

      expect(result).toBeNull()
    })

    it('should handle validation errors gracefully', async () => {
      vi.mocked(getSession).mockRejectedValue(new Error('Session error'))

      const result = await validateFirebaseSession({
        request: mockRequest,
      })

      expect(result).toBeNull()
    })
  })

  describe('getFirebaseSessionData', () => {
    it('should return Firebase session data when present', async () => {
      const sessionData = {
        firebaseUid: 'firebase-uid-123',
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      vi.mocked(mockSession.get).mockReturnValue(sessionData)

      const result = await getFirebaseSessionData(mockRequest)

      expect(result).toEqual(sessionData)
      expect(mockSession.get).toHaveBeenCalledWith('firebaseSession')
    })

    it('should return null when no Firebase session data', async () => {
      vi.mocked(mockSession.get).mockReturnValue(undefined)

      const result = await getFirebaseSessionData(mockRequest)

      expect(result).toBeNull()
    })

    it('should return null when Firebase session data is null', async () => {
      vi.mocked(mockSession.get).mockReturnValue(null)

      const result = await getFirebaseSessionData(mockRequest)

      expect(result).toBeNull()
    })
  })

  describe('clearFirebaseSession', () => {
    it('should clear Firebase session data', async () => {
      await clearFirebaseSession(mockSession)

      expect(mockSession.unset).toHaveBeenCalledWith('firebaseSession')
    })
  })
})
