import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../useAuthStore'

// Helper to access store state
const state = useAuthStore.getState

describe('useAuthStore', () => {
	beforeEach(() => {
		// Reset store to initial state
		state().resetStoreState()

		// Clear mocks
		vi.clearAllMocks()
	})

	it('should initialize with default values', () => {
		expect(state().user).toBe(null)
		expect(state().firebaseUser).toBe(null)
		expect(state().loading).toBe(false)
		expect(state().error).toBe(null)
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

		state().setUser(mockUser)

		expect(state().user).toEqual(mockUser)
	})

	it('should set firebase user state', () => {
		const mockFirebaseUser = {
			uid: 'firebase-uid-123',
			email: 'test@example.com',
			displayName: 'Test User',
			photoURL: 'https://example.com/photo.jpg',
		}

		state().setFirebaseUser(mockFirebaseUser)

		expect(state().firebaseUser).toEqual(mockFirebaseUser)
	})

	it('should handle loading state', () => {
		state().setLoading(true)
		expect(state().loading).toBe(true)

		state().setLoading(false)
		expect(state().loading).toBe(false)
	})

	it('should handle error state', () => {
		const errorMessage = 'Authentication failed'
		state().setError(errorMessage)
		expect(state().error).toBe(errorMessage)

		state().clearError()
		expect(state().error).toBe(null)
	})

	it('should persist state to sessionStorage', () => {
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

		state().setUser(mockUser)

		// Get the persisted data from sessionStorage
		const persistedDataString = sessionStorage.getItem('auth-storage')
		expect(persistedDataString).not.toBeNull()

		if (persistedDataString) {
			const persistedData = JSON.parse(persistedDataString)

			// Zustand persist middleware wraps the state in a 'state' key and adds a version
			expect(persistedData).toHaveProperty('state')
			expect(persistedData).toHaveProperty('version')

			// Check that the persisted state contains the expected values
			// Note: Dates are serialized to strings in sessionStorage
			expect(persistedData.state.user).toEqual({
				...mockUser,
				createdAt: mockUser.createdAt.toISOString(),
				updatedAt: mockUser.updatedAt.toISOString(),
			})
		}
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

		state().setUser(user1)
		expect(state().user).toEqual(user1)

		state().setUser(user2)
		expect(state().user).toEqual(user2)

		state().setUser(null)
		expect(state().user).toBe(null)
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
		state().setUser(mockUser)
		state().setLoading(true)
		state().setError('Some error')

		// Verify state is set
		expect(state().user).toEqual(mockUser)
		expect(state().loading).toBe(true)
		expect(state().error).toBe('Some error')

		// Reset state
		state().resetStoreState()

		// Verify state is reset to initial values
		expect(state().user).toBe(null)
		expect(state().firebaseUser).toBe(null)
		expect(state().loading).toBe(false)
		expect(state().error).toBe(null)
	})
})
