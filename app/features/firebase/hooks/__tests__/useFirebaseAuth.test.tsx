import { act, renderHook, waitFor } from '@testing-library/react'

import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Mock } from 'vitest'

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

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useFirebaseAuth', () => {
  let mockSignInWithPopup: Mock
  let mockSignOut: Mock
  let mockOnAuthStateChanged: Mock
  let mockGetIdToken: Mock

  beforeEach(async () => {
    vi.clearAllMocks()
    mockFetch.mockClear()

    // Get the mocked functions
    const { signInWithPopup, signOut, onAuthStateChanged } = await import(
      'firebase/auth'
    )
    mockSignInWithPopup = vi.mocked(signInWithPopup)
    mockSignOut = vi.mocked(signOut)
    mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)
    mockGetIdToken = vi.fn()

    // Default mock implementation for onAuthStateChanged
    mockOnAuthStateChanged.mockImplementation((auth, handler) => {
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
    mockFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('/dashboard'),
      },
    })

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
    expect(mockFetch).toHaveBeenCalledWith('/auth/callback', {
      method: 'POST',
      body: expect.any(FormData),
    })
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
    mockFetch.mockResolvedValue({ ok: true })

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    const { result } = renderHook(() => useFirebaseAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSignOut).toHaveBeenCalledWith({})
    expect(mockFetch).toHaveBeenCalledWith('/auth/signout', {
      method: 'POST',
    })
    expect(window.location.href).toBe('/auth/signin')
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
    mockOnAuthStateChanged.mockImplementation((auth, handler) => {
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

  test('uses default redirectTo when none provided', async () => {
    const mockUser = {
      getIdToken: mockGetIdToken,
    }
    const mockResult = { user: mockUser }

    mockSignInWithPopup.mockResolvedValue(mockResult)
    mockGetIdToken.mockResolvedValue('mock-id-token')
    mockFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
    })

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    const { result } = renderHook(() => useFirebaseAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(window.location.href).toBe('/a7k9m2x5p8w1n4q6r3y8b5t1')
  })
})
