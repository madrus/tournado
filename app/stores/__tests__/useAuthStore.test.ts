import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../useAuthStore'

// Helper to access store state
const state = useAuthStore.getState

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state by manually setting values
    state().setAuth(false, '')

    // Clear mocks
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    expect(state().authenticated).toBe(false)
    expect(state().username).toBe('')
  })

  it('should set authentication state', () => {
    state().setAuth(true, 'testuser')

    expect(state().authenticated).toBe(true)
    expect(state().username).toBe('testuser')
  })

  it('should unset authentication state', () => {
    // First set to authenticated
    state().setAuth(true, 'testuser')
    expect(state().authenticated).toBe(true)

    // Then unset (logout)
    state().setAuth(false, '')
    expect(state().authenticated).toBe(false)
    expect(state().username).toBe('')
  })

  it('should persist state to sessionStorage', () => {
    state().setAuth(true, 'testuser')

    // Get the persisted data from sessionStorage
    const persistedDataString = sessionStorage.getItem('auth-store-storage')
    expect(persistedDataString).not.toBeNull()

    if (persistedDataString) {
      const persistedData = JSON.parse(persistedDataString)

      // Zustand persist middleware wraps the state in a 'state' key and adds a version
      expect(persistedData).toHaveProperty('state')
      expect(persistedData).toHaveProperty('version')

      // Check that the persisted state contains the expected values
      expect(persistedData.state.authenticated).toBe(true)
      expect(persistedData.state.username).toBe('testuser')
    }
  })

  it('should handle multiple auth state changes', () => {
    state().setAuth(true, 'user1')
    expect(state().authenticated).toBe(true)
    expect(state().username).toBe('user1')

    state().setAuth(true, 'user2')
    expect(state().authenticated).toBe(true)
    expect(state().username).toBe('user2')

    state().setAuth(false, '')
    expect(state().authenticated).toBe(false)
    expect(state().username).toBe('')
  })
})
