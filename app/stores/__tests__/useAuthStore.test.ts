import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../useAuthStore'

// Helper to access store state
const getState = useAuthStore.getState

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    getState().resetStoreState()

    // Clear mocks
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    expect(getState().user).toBe(null)
    expect(getState().firebaseUser).toBe(null)
    expect(getState().loading).toBe(false)
    expect(getState().error).toBe(null)
  })

  it('should set user state', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'PUBLIC' as const,
      firebaseUid: 'firebase-uid-123',
      displayName: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    getState().setUser(mockUser)

    expect(getState().user).toEqual(mockUser)
  })

  it('should set firebase user state', () => {
    const mockFirebaseUser = {
      uid: 'firebase-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
    }

    getState().setFirebaseUser(mockFirebaseUser)

    expect(getState().firebaseUser).toEqual(mockFirebaseUser)
  })

  it('should handle loading state', () => {
    getState().setLoading(true)
    expect(getState().loading).toBe(true)

    getState().setLoading(false)
    expect(getState().loading).toBe(false)
  })

  it('should handle error state', () => {
    const errorMessage = 'Authentication failed'
    getState().setError(errorMessage)
    expect(getState().error).toBe(errorMessage)

    getState().clearError()
    expect(getState().error).toBe(null)
  })

  it('should handle multiple user state changes', () => {
    const user1 = {
      id: '1',
      email: 'user1@example.com',
      firstName: 'User',
      lastName: 'One',
      role: 'PUBLIC' as const,
      firebaseUid: 'firebase-uid-1',
      displayName: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const user2 = {
      id: '2',
      email: 'user2@example.com',
      firstName: 'User',
      lastName: 'Two',
      role: 'MANAGER' as const,
      firebaseUid: 'firebase-uid-2',
      displayName: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    getState().setUser(user1)
    expect(getState().user).toEqual(user1)

    getState().setUser(user2)
    expect(getState().user).toEqual(user2)

    getState().setUser(null)
    expect(getState().user).toBe(null)
  })

  it('should reset store state', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'PUBLIC' as const,
      firebaseUid: 'firebase-uid-123',
      displayName: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Set some state
    getState().setUser(mockUser)
    getState().setLoading(true)
    getState().setError('Some error')

    // Verify state is set
    expect(getState().user).toEqual(mockUser)
    expect(getState().loading).toBe(true)
    expect(getState().error).toBe('Some error')

    // Reset state
    getState().resetStoreState()

    // Verify state is reset to initial values
    expect(getState().user).toBe(null)
    expect(getState().firebaseUser).toBe(null)
    expect(getState().loading).toBe(false)
    expect(getState().error).toBe(null)
  })
})
