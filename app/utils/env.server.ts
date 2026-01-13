import { z } from 'zod'
import type { ENV } from '~/@types/declarations'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test'] as const),
  APP_ENV: z.enum(['production', 'staging', 'development'] as const).optional(),
  // Firebase client environment variables (VITE_ prefixed for client-side access)
  VITE_FIREBASE_API_KEY: z.string().optional(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  VITE_FIREBASE_PROJECT_ID: z.string().optional(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  VITE_FIREBASE_APP_ID: z.string().optional(),
  VITE_ADMIN_SLUG: z.string().optional(),
  PLAYWRIGHT: z.string().optional(),
})

export function init(): void {
  const parsed = schema.safeParse(process.env)

  if (parsed.success === false) {
    throw new Error('Invalid environment variables')
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to be included in the client
 * @returns all public ENV variables
 */
export const getEnv = (): ENV => ({
  MODE: (process.env.NODE_ENV || 'development') as
    | 'test'
    | 'production'
    | 'development',
  APP_ENV: (process.env.APP_ENV || 'development') as
    | 'production'
    | 'staging'
    | 'development',
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
  VITE_ADMIN_SLUG: process.env.VITE_ADMIN_SLUG,
  PLAYWRIGHT: process.env.PLAYWRIGHT,
})
