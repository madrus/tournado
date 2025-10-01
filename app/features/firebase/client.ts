import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
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

  // Initialize real Firebase if not already initialized
  if (!auth && isFirebaseConfigured) {
    try {
      // Reuse existing Firebase app if available (HMR, test reruns)
      firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
      auth = getAuth(firebaseApp)
      googleProvider = new GoogleAuthProvider()

      // Configure Google Auth Provider
      googleProvider.addScope('email')
      googleProvider.addScope('profile')

      // Force account selection for testing different users
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      })
    } catch (error) {
      // Log initialization errors so consumers don't incorrectly assume Firebase is unconfigured
      // eslint-disable-next-line no-console
      console.error('Firebase initialization failed:', error)
      // Keep auth and googleProvider null so consumers know Firebase is unavailable
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
