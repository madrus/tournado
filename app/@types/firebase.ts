export type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export type FirebaseUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
