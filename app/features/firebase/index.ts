/**
 * @fileoverview Firebase feature module exports (client-safe)
 *
 * This index file provides client-safe Firebase functionality.
 * For server-side Firebase functionality, import from './index.server.ts' instead.
 */

// Client-side Firebase exports
export { auth, firebaseApp, googleProvider, isFirebaseConfigured } from './client'
export type { FirebaseApp, GoogleAuthProvider } from './client'
export type { Auth as ClientAuth } from './client'

// Types (safe to export as they are type-only)
export * from './types'
