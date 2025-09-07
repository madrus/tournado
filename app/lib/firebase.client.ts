import { type FirebaseApp, initializeApp } from 'firebase/app'
import { type Auth, getAuth, GoogleAuthProvider } from 'firebase/auth'

import type { FirebaseConfig } from '~/@types/firebase'

const firebaseConfig: FirebaseConfig = {
  apiKey: typeof window !== 'undefined' ? window.ENV?.VITE_FIREBASE_API_KEY || '' : '',
  authDomain:
    typeof window !== 'undefined' ? window.ENV?.VITE_FIREBASE_AUTH_DOMAIN || '' : '',
  projectId:
    typeof window !== 'undefined' ? window.ENV?.VITE_FIREBASE_PROJECT_ID || '' : '',
  storageBucket:
    typeof window !== 'undefined' ? window.ENV?.VITE_FIREBASE_STORAGE_BUCKET || '' : '',
  messagingSenderId:
    typeof window !== 'undefined'
      ? window.ENV?.VITE_FIREBASE_MESSAGING_SENDER_ID || ''
      : '',
  appId: typeof window !== 'undefined' ? window.ENV?.VITE_FIREBASE_APP_ID || '' : '',
}

// Validate that all required config values are present
export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => value && value.trim() !== ''
)

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    firebaseApp = initializeApp(firebaseConfig)
    auth = getAuth(firebaseApp)
    googleProvider = new GoogleAuthProvider()

    // Configure Google Auth Provider
    googleProvider.addScope('email')
    googleProvider.addScope('profile')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Firebase initialization failed:', error)
  }
}

export { auth, firebaseApp, googleProvider }
export type { Auth, FirebaseApp, GoogleAuthProvider }
