/**
 * @fileoverview Firebase feature module exports
 *
 * This index file provides a clean API for importing Firebase functionality
 * from other parts of the application.
 */

// Client-side Firebase exports
export { auth, firebaseApp, googleProvider, isFirebaseConfigured } from './client'
export type { FirebaseApp, GoogleAuthProvider } from './client'
export type { Auth as ClientAuth } from './client'

// Server-side Firebase exports
export { adminApp, adminAuth, verifyIdToken } from './server'
export type { App, DecodedIdToken } from './server'
export type { Auth as AdminAuth } from './server'
export * from './session.server'
export * from './auth.server'

// Types
export * from './types'
