import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// Mock Firebase Admin modules
const mockVerifyIdToken = vi.fn()
const mockUpdateUser = vi.fn()
const mockRevokeRefreshTokens = vi.fn()
const mockGetAuth = vi.fn(() => ({
	verifyIdToken: mockVerifyIdToken,
	updateUser: mockUpdateUser,
	revokeRefreshTokens: mockRevokeRefreshTokens,
}))

vi.mock('firebase-admin/app', () => ({
	initializeApp: vi.fn(() => ({ name: 'mock-admin-app' })),
	getApps: vi.fn(() => []),
}))

vi.mock('firebase-admin/auth', () => ({
	getAuth: mockGetAuth,
}))

vi.mock('firebase-admin', () => ({
	default: {
		credential: {
			cert: vi.fn(() => ({ name: 'mock-credential' })),
		},
	},
}))

describe('firebase.server', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockVerifyIdToken.mockReset()
		mockUpdateUser.mockReset()
		mockRevokeRefreshTokens.mockReset()
		mockGetAuth.mockClear()
		// Reset modules to ensure fresh imports
		vi.resetModules()

		// Reset environment variables
		process.env.FIREBASE_ADMIN_PROJECT_ID = 'test-project'
		process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
		process.env.FIREBASE_ADMIN_PRIVATE_KEY = 'test-private-key'
	})

	test('should initialize Firebase Admin SDK with correct configuration', async () => {
		const mockFirebaseAdmin = vi.mocked(await import('firebase-admin'))
		const mockFirebaseApp = vi.mocked(await import('firebase-admin/app'))

		// Import the server module to trigger initialization
		const { adminApp } = await import('../server')

		expect(mockFirebaseAdmin.default.credential.cert).toHaveBeenCalledWith({
			projectId: 'test-project',
			clientEmail: 'test@test-project.iam.gserviceaccount.com',
			privateKey: 'test-private-key',
		})

		expect(mockFirebaseApp.initializeApp).toHaveBeenCalledWith({
			credential: { name: 'mock-credential' },
			projectId: 'test-project',
		})

		expect(adminApp).toBeDefined()
	})

	test('should initialize auth service', async () => {
		const { adminAuth } = await import('../server')

		expect(mockGetAuth).toHaveBeenCalled()
		expect(adminAuth).toBeDefined()
	})

	test('should verify valid ID token', async () => {
		const mockDecodedToken = {
			uid: 'test-uid',
			email: 'test@example.com',
			iat: Date.now() / 1000,
			exp: Date.now() / 1000 + 3600,
		}

		mockVerifyIdToken.mockResolvedValue(mockDecodedToken)

		const { verifyIdToken } = await import('../server')
		const result = await verifyIdToken('valid-token')

		expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token')
		expect(result).toEqual(mockDecodedToken)
	})

	test('should reject invalid ID token', async () => {
		mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))

		const { verifyIdToken } = await import('../server')

		await expect(verifyIdToken('invalid-token')).rejects.toThrow(
			'Invalid Firebase ID token: Invalid token',
		)
	})

	test('should throw error when admin SDK not initialized', async () => {
		// Mock missing environment variables
		process.env.FIREBASE_ADMIN_PROJECT_ID = ''
		process.env.FIREBASE_ADMIN_CLIENT_EMAIL = ''
		process.env.FIREBASE_ADMIN_PRIVATE_KEY = ''

		vi.resetModules()
		const { verifyIdToken } = await import('../server')

		await expect(verifyIdToken('some-token')).rejects.toThrow('Firebase Admin SDK not initialized')
	})

	test('should handle missing environment variables gracefully', async () => {
		// Mock missing environment variables
		delete process.env.FIREBASE_ADMIN_PROJECT_ID
		delete process.env.FIREBASE_ADMIN_CLIENT_EMAIL
		delete process.env.FIREBASE_ADMIN_PRIVATE_KEY

		vi.resetModules()
		const { adminAuth, verifyIdToken } = await import('../server')

		// Test functionality: adminAuth should be null when env vars are missing
		expect(adminAuth).toBeNull()

		// Verify that verifyIdToken throws when adminAuth is not initialized
		await expect(verifyIdToken('some-token')).rejects.toThrow('Firebase Admin SDK not initialized')
	})

	test('should handle initialization errors gracefully', async () => {
		const { initializeApp } = await import('firebase-admin/app')
		vi.mocked(initializeApp).mockImplementation(() => {
			throw new Error('Admin SDK initialization failed')
		})

		vi.resetModules()
		const { adminAuth, verifyIdToken } = await import('../server')

		// Test functionality: adminAuth should be null when initialization fails
		expect(adminAuth).toBeNull()

		// Verify that verifyIdToken throws when adminAuth is not initialized
		await expect(verifyIdToken('some-token')).rejects.toThrow('Firebase Admin SDK not initialized')
	})

	describe('disableFirebaseUser', () => {
		test('throws when firebaseUid is empty', async () => {
			const { disableFirebaseUser } = await import('../server')

			await expect(disableFirebaseUser('')).rejects.toThrow(
				'firebaseUid must be a non-empty string',
			)
		})

		test('logs warning and returns when admin SDK unavailable', async () => {
			process.env.FIREBASE_ADMIN_PROJECT_ID = ''
			process.env.FIREBASE_ADMIN_CLIENT_EMAIL = ''
			process.env.FIREBASE_ADMIN_PRIVATE_KEY = ''
			vi.resetModules()

			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => void 0)
			const { disableFirebaseUser } = await import('../server')

			await expect(disableFirebaseUser('uid-123')).resolves.toBeUndefined()
			expect(warnSpy).toHaveBeenCalledWith(
				'[firebase-admin] Cannot disable user - Admin SDK not initialized',
			)
			expect(mockUpdateUser).not.toHaveBeenCalled()
		})

		test('disables user when admin SDK available', async () => {
			mockUpdateUser.mockResolvedValue(undefined)
			const logSpy = vi.spyOn(console, 'log').mockImplementation(() => void 0)
			const { disableFirebaseUser } = await import('../server')

			await disableFirebaseUser('uid-123')

			expect(mockUpdateUser).toHaveBeenCalledWith('uid-123', {
				disabled: true,
			})
			expect(logSpy).toHaveBeenCalledWith(
				'[firebase-admin] Successfully disabled Firebase user: uid-123',
			)
		})

		test('wraps and rethrows errors from Firebase SDK', async () => {
			mockUpdateUser.mockRejectedValue(new Error('boom'))
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)
			const { disableFirebaseUser } = await import('../server')

			await expect(disableFirebaseUser('uid-123')).rejects.toThrow(
				'Failed to disable Firebase user: boom',
			)
			expect(errorSpy).toHaveBeenCalledWith('[firebase-admin] disableFirebaseUser error:', 'boom')
		})
	})

	describe('enableFirebaseUser', () => {
		test('throws when firebaseUid is empty', async () => {
			const { enableFirebaseUser } = await import('../server')

			await expect(enableFirebaseUser('')).rejects.toThrow('firebaseUid must be a non-empty string')
		})

		test('logs warning and returns when admin SDK unavailable', async () => {
			process.env.FIREBASE_ADMIN_PROJECT_ID = ''
			process.env.FIREBASE_ADMIN_CLIENT_EMAIL = ''
			process.env.FIREBASE_ADMIN_PRIVATE_KEY = ''
			vi.resetModules()

			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => void 0)
			const { enableFirebaseUser } = await import('../server')

			await expect(enableFirebaseUser('uid-123')).resolves.toBeUndefined()
			expect(warnSpy).toHaveBeenCalledWith(
				'[firebase-admin] Cannot enable user - Admin SDK not initialized',
			)
			expect(mockUpdateUser).not.toHaveBeenCalled()
		})

		test('enables user when admin SDK available', async () => {
			mockUpdateUser.mockResolvedValue(undefined)
			const logSpy = vi.spyOn(console, 'log').mockImplementation(() => void 0)
			const { enableFirebaseUser } = await import('../server')

			await enableFirebaseUser('uid-123')

			expect(mockUpdateUser).toHaveBeenCalledWith('uid-123', {
				disabled: false,
			})
			expect(logSpy).toHaveBeenCalledWith(
				'[firebase-admin] Successfully enabled Firebase user: uid-123',
			)
		})

		test('wraps and rethrows errors from Firebase SDK', async () => {
			mockUpdateUser.mockRejectedValue(new Error('enable-fail'))
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)
			const { enableFirebaseUser } = await import('../server')

			await expect(enableFirebaseUser('uid-123')).rejects.toThrow(
				'Failed to enable Firebase user: enable-fail',
			)
			expect(errorSpy).toHaveBeenCalledWith(
				'[firebase-admin] enableFirebaseUser error:',
				'enable-fail',
			)
		})
	})

	describe('revokeRefreshTokens', () => {
		test('throws when firebaseUid is empty', async () => {
			const { revokeRefreshTokens } = await import('../server')

			await expect(revokeRefreshTokens('')).rejects.toThrow(
				'firebaseUid must be a non-empty string',
			)
		})

		test('logs warning and returns when admin SDK unavailable', async () => {
			process.env.FIREBASE_ADMIN_PROJECT_ID = ''
			process.env.FIREBASE_ADMIN_CLIENT_EMAIL = ''
			process.env.FIREBASE_ADMIN_PRIVATE_KEY = ''
			vi.resetModules()

			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => void 0)
			const { revokeRefreshTokens } = await import('../server')

			await expect(revokeRefreshTokens('uid-123')).resolves.toBeUndefined()
			expect(warnSpy).toHaveBeenCalledWith(
				'[firebase-admin] Cannot revoke tokens - Admin SDK not initialized',
			)
			expect(mockRevokeRefreshTokens).not.toHaveBeenCalled()
		})

		test('revokes tokens when admin SDK available', async () => {
			mockRevokeRefreshTokens.mockResolvedValue(undefined)
			const logSpy = vi.spyOn(console, 'log').mockImplementation(() => void 0)
			const { revokeRefreshTokens } = await import('../server')

			await revokeRefreshTokens('uid-123')

			expect(mockRevokeRefreshTokens).toHaveBeenCalledWith('uid-123')
			expect(logSpy).toHaveBeenCalledWith(
				'[firebase-admin] Successfully revoked refresh tokens for user: uid-123',
			)
		})

		test('wraps and rethrows errors from Firebase SDK', async () => {
			mockRevokeRefreshTokens.mockRejectedValue(new Error('revoke-fail'))
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)
			const { revokeRefreshTokens } = await import('../server')

			await expect(revokeRefreshTokens('uid-123')).rejects.toThrow(
				'Failed to revoke refresh tokens: revoke-fail',
			)
			expect(errorSpy).toHaveBeenCalledWith(
				'[firebase-admin] revokeRefreshTokens error:',
				'revoke-fail',
			)
		})
	})
})

afterEach(() => {
	vi.restoreAllMocks()
})
