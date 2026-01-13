import type { Session, SessionData } from 'react-router'
import { redirect } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearFirebaseSession,
  validateFirebaseSession,
} from '~/features/firebase/session.server'
import type { User } from '~/models/user.server'
import { getUserById } from '~/models/user.server'
import { isPublicRoute } from '../publicRoutes.server'
import {
  createFirebaseUserSession,
  createUserSession,
  getSession,
  getUser,
  getUserId,
  requireUser,
  requireUserId,
  sessionStorage,
  signout,
} from '../session.server'

// Mock Firebase session utilities
vi.mock('~/features/firebase/session.server', () => ({
  validateFirebaseSession: vi.fn(),
  clearFirebaseSession: vi.fn(),
}))

// Mock user model
vi.mock('~/models/user.server', () => ({
  getUserById: vi.fn(),
}))

// Mock public route helper
vi.mock('../publicRoutes.server', () => ({
  isPublicRoute: vi.fn(),
}))

// Mock react-router
vi.mock('react-router', () => ({
  redirect: vi.fn(),
  createCookieSessionStorage: () => ({
    getSession: vi.fn(),
    commitSession: vi.fn(),
    destroySession: vi.fn(),
  }),
}))

describe('session.server', () => {
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

  const mockSession = {
    get: vi.fn(),
    set: vi.fn(),
    unset: vi.fn(),
    has: vi.fn(),
    flash: vi.fn(),
    id: 'mock-session-id',
    data: {},
  } as Session<SessionData, SessionData>

  const mockSessionStorage = {
    getSession: vi.fn(),
    commitSession: vi.fn(),
    destroySession: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the sessionStorage module-level variable
    Object.assign(sessionStorage, mockSessionStorage)
    mockSessionStorage.getSession.mockResolvedValue(mockSession)
  })

  describe('getSession', () => {
    it('should return session from cookie', async () => {
      const requestWithCookie = new Request('http://localhost:3000', {
        headers: { Cookie: '__session=session-cookie' },
      })

      // Verify the cookie header is set correctly
      const cookieHeader = requestWithCookie.headers.get('Cookie')

      await getSession(requestWithCookie)

      expect(mockSessionStorage.getSession).toHaveBeenCalledWith(cookieHeader)
    })

    it('should handle request without cookie', async () => {
      await getSession(mockRequest)

      expect(mockSessionStorage.getSession).toHaveBeenCalledWith(null)
    })
  })

  describe('getUserId', () => {
    it('should return user ID from Firebase session when available', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      const result = await getUserId(mockRequest)

      expect(result).toBe('user-123')
      expect(validateFirebaseSession).toHaveBeenCalledWith({
        request: mockRequest,
      })
    })

    it('should return user ID from legacy session when Firebase unavailable', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue('legacy-user-id')

      const result = await getUserId(mockRequest)

      expect(result).toBe('legacy-user-id')
      expect(mockSession.get).toHaveBeenCalledWith('userId')
    })

    it('should return undefined when no session available', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue(undefined)

      const result = await getUserId(mockRequest)

      expect(result).toBeUndefined()
    })
  })

  describe('getUser', () => {
    it('should return user from Firebase session when available', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      const result = await getUser(mockRequest)

      expect(result).toEqual(mockUser)
      expect(validateFirebaseSession).toHaveBeenCalledWith({
        request: mockRequest,
      })
    })

    it('should return user from legacy session when Firebase unavailable', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue('user-123')
      vi.mocked(getUserById).mockResolvedValue(mockUser)

      const result = await getUser(mockRequest)

      expect(result).toEqual(mockUser)
      expect(getUserById).toHaveBeenCalledWith('user-123')
    })

    it('should return null when no user ID available', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue(undefined)

      const result = await getUser(mockRequest)

      expect(result).toBeNull()
    })

    it('should call signout when user not found in database', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue('user-123')
      vi.mocked(getUserById).mockResolvedValue(null)
      vi.mocked(isPublicRoute).mockResolvedValue(true)
      mockSessionStorage.destroySession.mockResolvedValue('destroyed-cookie')
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(getUser(mockRequest)).rejects.toThrow('Redirect: /')
    })
  })

  describe('requireUserId', () => {
    it('should return user ID when authenticated', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      const result = await requireUserId(mockRequest)

      expect(result).toBe('user-123')
    })

    it('should redirect to signin when not authenticated', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue(undefined)
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(requireUserId(mockRequest)).rejects.toThrow(
        'Redirect: /auth/signin?redirectTo=%2Ftest',
      )
    })

    it('should use custom redirectTo parameter', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue(undefined)
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(requireUserId(mockRequest, '/custom')).rejects.toThrow(
        'Redirect: /auth/signin?redirectTo=%2Fcustom',
      )
    })
  })

  describe('requireUser', () => {
    it('should return user when authenticated', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })
      vi.mocked(getUserById).mockResolvedValue(mockUser)

      const result = await requireUser(mockRequest)

      expect(result).toEqual(mockUser)
    })

    it('should redirect when not authenticated', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue(undefined)
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(requireUser(mockRequest)).rejects.toThrow('Redirect: /auth/signin')
    })

    it('should call signout when user not found', async () => {
      vi.mocked(validateFirebaseSession).mockResolvedValue(null)
      vi.mocked(mockSession.get).mockReturnValue('user-123')
      vi.mocked(getUserById).mockResolvedValue(null)
      vi.mocked(isPublicRoute).mockResolvedValue(true)
      mockSessionStorage.destroySession.mockResolvedValue('destroyed-cookie')
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(requireUser(mockRequest)).rejects.toThrow('Redirect: /')
    })
  })

  describe('createUserSession', () => {
    it('should create session and redirect', async () => {
      mockSessionStorage.commitSession.mockResolvedValue('session-cookie')
      vi.mocked(redirect).mockImplementation((url, options) => {
        throw new Error(
          `Redirect: ${url} with cookie: ${(options as { headers?: Record<string, string> })?.headers?.['Set-Cookie']}`,
        )
      })

      await expect(
        createUserSession({
          request: mockRequest,
          userId: 'user-123',
          remember: false,
          redirectTo: '/dashboard',
        }),
      ).rejects.toThrow('Redirect: /dashboard with cookie: session-cookie')

      expect(mockSession.set).toHaveBeenCalledWith('userId', 'user-123')
      expect(mockSessionStorage.commitSession).toHaveBeenCalledWith(mockSession, {
        maxAge: undefined,
      })
    })

    it('should set maxAge when remember is true', async () => {
      mockSessionStorage.commitSession.mockResolvedValue('session-cookie')
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error('Redirect')
      })

      await expect(
        createUserSession({
          request: mockRequest,
          userId: 'user-123',
          remember: true,
          redirectTo: '/dashboard',
        }),
      ).rejects.toThrow('Redirect')

      expect(mockSessionStorage.commitSession).toHaveBeenCalledWith(mockSession, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    })

    it('should redirect to root when redirectTo is null', async () => {
      mockSessionStorage.commitSession.mockResolvedValue('session-cookie')
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })

      await expect(
        createUserSession({
          request: mockRequest,
          userId: 'user-123',
          remember: false,
          redirectTo: null,
        }),
      ).rejects.toThrow('Redirect: /')
    })
  })

  describe('createFirebaseUserSession', () => {
    it('should create session and redirect similar to createUserSession', async () => {
      mockSessionStorage.commitSession.mockResolvedValue('session-cookie')
      vi.mocked(redirect).mockImplementation((url, options) => {
        throw new Error(
          `Redirect: ${url} with cookie: ${(options as { headers?: Record<string, string> })?.headers?.['Set-Cookie']}`,
        )
      })

      await expect(
        createFirebaseUserSession({
          request: mockRequest,
          userId: 'user-123',
          remember: false,
          redirectTo: '/dashboard',
        }),
      ).rejects.toThrow('Redirect: /dashboard with cookie: session-cookie')

      expect(mockSession.set).toHaveBeenCalledWith('userId', 'user-123')
    })

    it('should handle remember option', async () => {
      mockSessionStorage.commitSession.mockResolvedValue('session-cookie')
      vi.mocked(redirect).mockImplementation(() => {
        throw new Error('Redirect')
      })

      await expect(
        createFirebaseUserSession({
          request: mockRequest,
          userId: 'user-123',
          remember: true,
        }),
      ).rejects.toThrow('Redirect')

      expect(mockSessionStorage.commitSession).toHaveBeenCalledWith(mockSession, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    })
  })

  describe('signout', () => {
    beforeEach(() => {
      mockSessionStorage.destroySession.mockResolvedValue('destroyed-cookie')
      vi.mocked(redirect).mockImplementation(url => {
        throw new Error(`Redirect: ${url}`)
      })
    })

    it('should clear Firebase session and destroy session', async () => {
      vi.mocked(isPublicRoute).mockResolvedValue(true)

      await expect(signout(mockRequest)).rejects.toThrow('Redirect: /')

      expect(clearFirebaseSession).toHaveBeenCalledWith(mockSession)
      expect(mockSessionStorage.destroySession).toHaveBeenCalledWith(mockSession)
    })

    it('should redirect to returnUrl if it is a public route', async () => {
      vi.mocked(isPublicRoute).mockResolvedValue(true)

      await expect(signout(mockRequest, '/public-page')).rejects.toThrow(
        'Redirect: /public-page',
      )
    })

    it('should redirect to home if returnUrl is not a public route', async () => {
      vi.mocked(isPublicRoute).mockResolvedValue(false)

      await expect(signout(mockRequest, '/admin-page')).rejects.toThrow('Redirect: /')
    })

    it('should include cache control headers', async () => {
      vi.mocked(isPublicRoute).mockResolvedValue(true)
      vi.mocked(redirect).mockImplementation((url, options) => {
        expect((options as { headers?: Record<string, string> })?.headers).toEqual({
          'Set-Cookie': 'destroyed-cookie',
          'Cache-Control': 'no-store, max-age=0',
          Pragma: 'no-cache',
          Expires: new Date(0).toUTCString(),
        })
        throw new Error(`Redirect: ${url}`)
      })

      await expect(signout(mockRequest)).rejects.toThrow('Redirect: /')
    })

    it('should handle URLs with search params in returnUrl', async () => {
      vi.mocked(isPublicRoute).mockResolvedValue(true)

      await expect(signout(mockRequest, '/public?foo=bar')).rejects.toThrow(
        'Redirect: /public?foo=bar',
      )

      expect(isPublicRoute).toHaveBeenCalledWith('/public')
    })
  })
})
