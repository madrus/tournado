import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import type { Mock } from 'vitest'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import { useFirebaseAuth } from '../useFirebaseAuth'

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('~/features/firebase/client', () => ({
  auth: {},
  googleProvider: {},
}))

// Set up MSW server for API mocking
const server = setupServer()

describe('useFirebaseAuth', () => {
  let mockSignInWithPopup: Mock
  let mockSignOut: Mock
  let mockOnAuthStateChanged: Mock
  let mockGetIdToken: Mock

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' })
  })

  afterAll(() => {
    server.close()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  beforeEach(async () => {
    vi.clearAllMocks()

    // Get the mocked functions
    const { signInWithPopup, signOut, onAuthStateChanged } =
      await import('firebase/auth')
    mockSignInWithPopup = vi.mocked(signInWithPopup)
    mockSignOut = vi.mocked(signOut)
    mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)
    mockGetIdToken = vi.fn()

    // Default mock implementation for onAuthStateChanged
    mockOnAuthStateChanged.mockImplementation((_auth, handler) => {
      // Call immediately with null user
      handler(null)
      // Return unsubscribe function
      return vi.fn()
    })
  })

  test('initializes with default state', () => {
    const { result } = renderHook(() => useFirebaseAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBeFalsy()
    expect(result.current.error).toBeNull()
    expect(typeof result.current.signInWithGoogle).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
    expect(typeof result.current.clearError).toBe('function')
  })

  test('handles successful sign-in flow', async () => {
    const mockUser = {
      getIdToken: mockGetIdToken,
    }
    const mockResult = { user: mockUser }

    mockSignInWithPopup.mockResolvedValue(mockResult)
    mockGetIdToken.mockResolvedValue('mock-id-token')

    // Set up MSW handler for successful auth callback (use wildcard to match any origin)
    server.use(
      http.post(
        '*/auth/callback',
        () =>
          new HttpResponse(null, {
            status: 200,
            headers: {
              Location: '/dashboard',
            },
          }),
      ),
    )

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    const { result } = renderHook(() => useFirebaseAuth())

    await act(async () => {
      await result.current.signInWithGoogle('/custom-redirect')
    })

    expect(mockSignInWithPopup).toHaveBeenCalledWith({}, {})
    expect(mockGetIdToken).toHaveBeenCalled()
  })

  test('handles sign-in errors gracefully', async () => {
    const error = new Error('Sign-in failed')
    mockSignInWithPopup.mockRejectedValue(error)

    const { result } = renderHook(() => useFirebaseAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(result.current.error).toBe('Sign-in failed')
    expect(result.current.loading).toBeFalsy()
  })

  test('handles successful sign-out flow', async () => {
    mockSignOut.mockResolvedValue(undefined)

    // Set up MSW handler for successful sign-out
    server.use(
      http.post(
        'http://localhost:5173/auth/signout',
        () => new HttpResponse(null, { status: 200 }),
      ),
    )

    // Spy on window.location.href setter and provide a base URL
    const locationSpy = vi.fn()
    let currentHref = 'http://localhost:5173/'
    delete (window as { location?: unknown }).location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:5173',
        protocol: 'http:',
        host: 'localhost:5173',
        hostname: 'localhost',
        port: '5173',
        pathname: '/',
        search: '',
        hash: '',
        set href(value: string) {
          currentHref = value
          locationSpy(value)
        },
        get href() {
          return currentHref
        },
      },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useFirebaseAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSignOut).toHaveBeenCalledWith({})
    expect(result.current.error).toBeNull()
    expect(locationSpy).toHaveBeenCalledWith('/auth/signin')
  })

  test('handles sign-out errors gracefully', async () => {
    const error = new Error('Sign-out failed')
    mockSignOut.mockRejectedValue(error)

    const { result } = renderHook(() => useFirebaseAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.error).toBe('Sign-out failed')
    expect(result.current.loading).toBeFalsy()
  })

  test('clears errors when requested', async () => {
    // First, create an error
    const error = new Error('Test error')
    mockSignInWithPopup.mockRejectedValue(error)

    const { result } = renderHook(() => useFirebaseAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(result.current.error).toBe('Test error')

    // Now clear the error
    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  test('updates user state when Firebase auth state changes', async () => {
    const mockFirebaseUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
    }

    // Mock onAuthStateChanged to call handler with user
    mockOnAuthStateChanged.mockImplementation((_auth, handler) => {
      setTimeout(() => handler(mockFirebaseUser), 0)
      return vi.fn()
    })

    const { result } = renderHook(() => useFirebaseAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      })
    })

    expect(result.current.loading).toBeFalsy()
  })

  test('lets server handle redirectTo when none provided', async () => {
    const mockUser = {
      getIdToken: mockGetIdToken,
    }
    const mockResult = { user: mockUser }

    mockSignInWithPopup.mockResolvedValue(mockResult)
    mockGetIdToken.mockResolvedValue('mock-id-token')

    // Set up MSW handler that returns no Location header (lets server decide)
    server.use(
      http.post('*/auth/callback', () => new HttpResponse(null, { status: 200 })),
    )

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    const { result } = renderHook(() => useFirebaseAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    // Verify sign-in was successful
    expect(mockSignInWithPopup).toHaveBeenCalledWith({}, {})
    expect(mockGetIdToken).toHaveBeenCalled()
  })
})
