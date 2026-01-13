/**
 * @fileoverview Firebase feature module exports (client-safe)
 *
 * This index file provides client-safe Firebase functionality.
 * For server-side Firebase functionality, import from './index.server.ts' instead.
 */

export type { Auth as ClientAuth, FirebaseApp, GoogleAuthProvider } from './client'
// Client-side Firebase exports
export { auth, firebaseApp, googleProvider, isFirebaseConfigured } from './client'

// Types (safe to export as they are type-only)
export * from './types'
