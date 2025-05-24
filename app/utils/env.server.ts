import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test'] as const),
})

type ProcessEnv = z.infer<typeof schema>

type PublicEnv = {
  MODE: ProcessEnv['NODE_ENV']
}

export function init(): void {
  const parsed = schema.safeParse(process.env)

  if (parsed.success === false) {
    // eslint-disable-next-line no-console
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    )

    throw new Error('Invalid environment variables')
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv(): PublicEnv {
  return {
    MODE: (process.env.NODE_ENV || 'development') as
      | 'test'
      | 'production'
      | 'development',
  }
}

type ENV = ReturnType<typeof getEnv>

declare global {
  let ENV: ENV
  interface Window {
    ENV: ENV
  }
}
