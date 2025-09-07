import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock Firebase Admin modules
const mockVerifyIdToken = vi.fn()
const mockGetAuth = vi.fn(() => ({
  verifyIdToken: mockVerifyIdToken,
}))

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-admin-app' })),
  getApps: vi.fn(() => []),
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: mockGetAuth,
}))

vi.mock('firebase-admin', () => ({
  credential: {
    cert: vi.fn(() => ({ name: 'mock-credential' })),
  },
}))

describe('firebase.server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset modules to ensure fresh imports
    vi.resetModules()

    // Reset environment variables
    process.env.FIREBASE_ADMIN_PROJECT_ID = 'test-project'
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL =
      'test@test-project.iam.gserviceaccount.com'
    process.env.FIREBASE_ADMIN_PRIVATE_KEY = 'test-private-key'
  })

  test('should initialize Firebase Admin SDK with correct configuration', async () => {
    const { initializeApp } = await import('firebase-admin/app')
    const { credential } = await import('firebase-admin')
    const { adminApp } = await import('~/lib/firebase.server')

    expect(credential.cert).toHaveBeenCalledWith({
      projectId: 'test-project',
      clientEmail: 'test@test-project.iam.gserviceaccount.com',
      privateKey: 'test-private-key',
    })

    expect(initializeApp).toHaveBeenCalledWith({
      credential: { name: 'mock-credential' },
      projectId: 'test-project',
    })

    expect(adminApp).toBeDefined()
  })

  test('should initialize auth service', async () => {
    const { adminAuth } = await import('~/lib/firebase.server')

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

    const { verifyIdToken } = await import('~/lib/firebase.server')
    const result = await verifyIdToken('valid-token')

    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token')
    expect(result).toEqual(mockDecodedToken)
  })

  test('should reject invalid ID token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))

    const { verifyIdToken } = await import('~/lib/firebase.server')

    await expect(verifyIdToken('invalid-token')).rejects.toThrow(
      'Invalid Firebase ID token: Invalid token'
    )
  })

  test('should throw error when admin SDK not initialized', async () => {
    // Mock missing environment variables
    process.env.FIREBASE_ADMIN_PROJECT_ID = ''
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL = ''
    process.env.FIREBASE_ADMIN_PRIVATE_KEY = ''

    vi.resetModules()
    const { verifyIdToken } = await import('~/lib/firebase.server')

    await expect(verifyIdToken('some-token')).rejects.toThrow(
      'Firebase Admin SDK not initialized'
    )
  })

  test('should handle missing environment variables gracefully', async () => {
    // Mock missing environment variables
    delete process.env.FIREBASE_ADMIN_PROJECT_ID
    delete process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    delete process.env.FIREBASE_ADMIN_PRIVATE_KEY

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => void 0)

    vi.resetModules()
    await import('~/lib/firebase.server')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Firebase Admin SDK: Missing required environment variables'
    )

    consoleSpy.mockRestore()
  })

  test('should handle initialization errors gracefully', async () => {
    const { initializeApp } = await import('firebase-admin/app')
    vi.mocked(initializeApp).mockImplementation(() => {
      throw new Error('Admin SDK initialization failed')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)

    vi.resetModules()
    await import('~/lib/firebase.server')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Firebase Admin SDK initialization failed:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })
})
