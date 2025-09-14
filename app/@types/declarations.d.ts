// Global window/test augmentations used by E2E mocks
import type {
  Auth,
  User as FirebaseAuthUser,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth'

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

type OnAuthStateChanged = (
  auth: Auth,
  nextOrObserver: (user: FirebaseAuthUser | null) => unknown
) => () => void

type SignInWithPopup = (
  auth: Auth,
  provider: GoogleAuthProvider
) => Promise<UserCredential>

type SignOut = (auth: Auth) => Promise<void>

type SignInWithEmailAndPassword = (
  auth: Auth,
  email: string,
  password: string
) => Promise<UserCredential>

type CreateUserWithEmailAndPassword = (
  auth: Auth,
  email: string,
  password: string
) => Promise<UserCredential>

declare global {
  interface Window {
    playwrightTest?: boolean
    mockFirebaseAuth?: {
      onAuthStateChanged?: OnAuthStateChanged
      signInWithPopup?: SignInWithPopup
      signOut?: SignOut
      signInWithEmailAndPassword?: SignInWithEmailAndPassword
      createUserWithEmailAndPassword?: CreateUserWithEmailAndPassword
      currentUser?: unknown
    }
    mockFirebaseModule?: {
      GoogleAuthProvider: new () => GoogleAuthProvider
    }
  }
}
