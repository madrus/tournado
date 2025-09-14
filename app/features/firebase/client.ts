import { type FirebaseApp, initializeApp } from 'firebase/app'
import {
  type Auth,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth'

import type { getEnv as getServerEnv } from '~/utils/env.server'

import type { FirebaseConfig } from './types'

// Prefer window.ENV (injected from server). Fallback to Vite's import.meta.env
type PublicEnv = ReturnType<typeof getServerEnv>
const getEnv = (key: keyof PublicEnv): string => {
  type EnvRecord = Partial<Record<keyof PublicEnv, string | undefined>>
  const winEnv: EnvRecord | undefined =
    typeof window !== 'undefined' ? (window.ENV as EnvRecord) : undefined
  const viteEnv: EnvRecord =
    typeof import.meta !== 'undefined'
      ? ((import.meta as unknown as { env?: EnvRecord }).env ?? {})
      : {}
  return (winEnv?.[key] ?? viteEnv?.[key] ?? '') || ''
}

const firebaseConfig: FirebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
}

// Validate that all required config values are present
export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => value && value.trim() !== ''
)

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

// Function to ensure Firebase is properly initialized
function ensureFirebaseInitialized(): void {
  if (typeof window === 'undefined') return

  // Check if we're in a test environment with mocks
  if (window.playwrightTest) {
    debug('Playwright test detected, checking for mocks...')
    debug('mockFirebaseAuth available:', Boolean(window.mockFirebaseAuth))

    if (window.mockFirebaseAuth && !auth) {
      debug('Using Firebase mocks for testing')
      auth = window.mockFirebaseAuth as unknown as Auth
      googleProvider = window.mockFirebaseModule?.GoogleAuthProvider
        ? new window.mockFirebaseModule.GoogleAuthProvider()
        : null
      firebaseApp = null // Mock doesn't need a real app
      return
    }
  }

  // Initialize real Firebase if not in test mode and not already initialized
  if (!auth && isFirebaseConfigured) {
    try {
      firebaseApp = initializeApp(firebaseConfig)
      auth = getAuth(firebaseApp)
      googleProvider = new GoogleAuthProvider()

      // Configure Google Auth Provider
      googleProvider.addScope('email')
      googleProvider.addScope('profile')

      // Force account selection for testing different users
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      })
    } catch (_error) {
      // Firebase initialization failed - keep auth and googleProvider null
    }
  }
}

if (typeof window !== 'undefined') {
  ensureFirebaseInitialized()
}

// Function to get current auth instance (useful for dynamic access)
function getCurrentAuth(): Auth | null {
  ensureFirebaseInitialized()
  return auth
}

export {
  auth,
  createUserWithEmailAndPassword,
  ensureFirebaseInitialized,
  firebaseApp,
  getCurrentAuth,
  googleProvider,
  signInWithEmailAndPassword,
}
export type { Auth, FirebaseApp, GoogleAuthProvider, UserCredential }

function debug(...args: unknown[]): void {
  if (typeof window !== 'undefined' && window.playwrightTest) {
    // eslint-disable-next-line no-console
    console.log(...args)
  }
}
