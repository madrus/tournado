import type {
	Auth,
	User as FirebaseAuthUser,
	GoogleAuthProvider,
	UserCredential,
} from 'firebase/auth'

type OnAuthStateChangedDual = ((
	auth: Auth,
	nextOrObserver: (user: FirebaseAuthUser | null) => unknown,
) => () => void) &
	((nextOrObserver: (user: FirebaseAuthUser | null) => unknown) => () => void)

type SignInWithPopup = (
	auth: Auth,
	provider: GoogleAuthProvider,
) => Promise<UserCredential>
type SignOut = (auth: Auth) => Promise<void>
type SignInWithEmailAndPassword = (
	auth: Auth,
	email: string,
	password: string,
) => Promise<UserCredential>
type CreateUserWithEmailAndPassword = (
	auth: Auth,
	email: string,
	password: string,
) => Promise<UserCredential>

declare global {
	interface Window {
		playwrightTest?: boolean
		mockFirebaseAuth?: {
			onAuthStateChanged?: OnAuthStateChangedDual
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
