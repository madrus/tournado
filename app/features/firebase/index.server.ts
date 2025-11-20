/**
 * @fileoverview Firebase server-side exports
 *
 * This file provides server-only Firebase functionality.
 * Import from this file only in .server.ts files or server-side route modules.
 */

export * from './auth.server'
export type { App, Auth as AdminAuth, DecodedIdToken } from './server'
// Server-side Firebase exports
export { adminApp, adminAuth, verifyIdToken } from './server'
// Server-side authentication and session exports
export * from './session.server'

// Types (safe to re-export as they are type-only)
export * from './types'
