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
      // Firebase initialization failed - auth and googleProvider will remain null
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
