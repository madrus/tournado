import { type FirebaseApp, initializeApp } from 'firebase/app'
import {
  type Auth,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth'

import type { FirebaseConfig } from './types'

// Prefer window.ENV (injected from server). Fallback to Vite's import.meta.env
const getEnv = (key: keyof ReturnType<typeof import('~/utils/env.server').getEnv>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w: any = typeof window !== 'undefined' ? window : undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteEnv: any = typeof import.meta !== 'undefined' ? import.meta.env : {}
  return (
    (w?.ENV?.[key] as string | undefined) ??
    (viteEnv?.[key] as string | undefined) ??
    ''
  )
}

const firebaseConfig: FirebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY' as never),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN' as never),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID' as never),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET' as never),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID' as never),
  appId: getEnv('VITE_FIREBASE_APP_ID' as never),
}

// Validate that all required config values are present
export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => value && value.trim() !== ''
)

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

if (typeof window !== 'undefined') {
  if (isFirebaseConfigured) {
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

export {
  auth,
  firebaseApp,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
}
export type { Auth, FirebaseApp, GoogleAuthProvider, UserCredential }
