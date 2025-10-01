/**
 * @fileoverview Firebase server-side exports
 *
 * This file provides server-only Firebase functionality.
 * Import from this file only in .server.ts files or server-side route modules.
 */

// Server-side Firebase exports
export { adminApp, adminAuth, verifyIdToken } from './server'
export type { App, DecodedIdToken } from './server'
export type { Auth as AdminAuth } from './server'

// Server-side authentication and session exports
export * from './session.server'
export * from './auth.server'

// Types (safe to re-export as they are type-only)
export * from './types'
