import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ name: 'mock-auth' })),
  GoogleAuthProvider: vi.fn(() => ({
    addScope: vi.fn(),
  })),
}))

// Mock window.ENV
Object.defineProperty(window, 'ENV', {
  value: {
    VITE_FIREBASE_API_KEY: 'test-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    VITE_FIREBASE_APP_ID: '1:123456789:web:abcdef',
  },
  writable: true,
})

describe('firebase.client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset modules to ensure fresh imports
    vi.resetModules()
  })

  test('should initialize Firebase app when configuration is valid', async () => {
    const { initializeApp } = await import('firebase/app')
    const { firebaseApp, isFirebaseConfigured } = await import('../client')

    expect(isFirebaseConfigured).toBe(true)
    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef',
    })
    expect(firebaseApp).toBeDefined()
  })

  test('should initialize auth when Firebase is configured', async () => {
    const { getAuth } = await import('firebase/auth')
    const { auth } = await import('../client')

    expect(getAuth).toHaveBeenCalled()
    expect(auth).toBeDefined()
  })

  test('should initialize Google Auth Provider with correct scopes', async () => {
    const { GoogleAuthProvider } = await import('firebase/auth')
    const mockAddScope = vi.fn()

    vi.mocked(GoogleAuthProvider).mockImplementation(
      () =>
        ({
          addScope: mockAddScope,
        }) as unknown as InstanceType<typeof GoogleAuthProvider>
    )

    const { googleProvider } = await import('../client')

    expect(GoogleAuthProvider).toHaveBeenCalled()
    expect(mockAddScope).toHaveBeenCalledWith('email')
    expect(mockAddScope).toHaveBeenCalledWith('profile')
    expect(googleProvider).toBeDefined()
  })

  test('should detect invalid configuration', async () => {
    // Mock incomplete configuration
    Object.defineProperty(window, 'ENV', {
      value: {
        VITE_FIREBASE_API_KEY: '',
        VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_FIREBASE_STORAGE_BUCKET: '',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
        VITE_FIREBASE_APP_ID: '1:123456789:web:abcdef',
      },
      writable: true,
    })

    vi.resetModules()
    const { isFirebaseConfigured } = await import('../client')

    expect(isFirebaseConfigured).toBe(false)
  })

  test('should handle initialization errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0)

    // Ensure proper window environment for Firebase initialization
    Object.defineProperty(window, 'ENV', {
      value: {
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
        VITE_FIREBASE_APP_ID: '1:123456789:web:abcdef',
      },
      writable: true,
    })

    // Mock Firebase initialization to throw an error before importing
    vi.doMock('firebase/app', () => ({
      initializeApp: vi.fn(() => {
        throw new Error('Firebase initialization failed')
      }),
    }))

    vi.doMock('firebase/auth', () => ({
      getAuth: vi.fn(() => ({ name: 'mock-auth' })),
      GoogleAuthProvider: vi.fn(() => ({
        addScope: vi.fn(),
      })),
    }))

    vi.resetModules()

    // Import should trigger the error handling
    const { firebaseApp } = await import('../client')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Firebase initialization failed:',
      expect.any(Error)
    )
    expect(firebaseApp).toBeNull()

    consoleSpy.mockRestore()
    vi.doUnmock('firebase/app')
    vi.doUnmock('firebase/auth')
  })
})
