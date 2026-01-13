import { createRequire } from 'node:module'
import pino from 'pino'

type LoggerFactoryOptions = {
  nodeEnv?: string
  logLevel?: string
  resolvePretty?: () => string | null
}

/**
 * Build a centralized pino logger with env-aware defaults and optional pretty output.
 * @param nodeEnv - Runtime environment string (defaults to process.env.NODE_ENV).
 * @param logLevel - Desired log level (defaults to process.env.LOG_LEVEL or env-based fallback).
 * @param resolvePretty - Optional resolver for pino-pretty; when provided it overrides module resolution
 * and enables pretty logging in non-production if it returns a target string.
 * @returns ReturnType<typeof pino> configured with redaction, base env, and optional pretty transport.
 * @note Pretty logging is enabled only outside production when a target is resolved.
 */
export function createLogger({
  nodeEnv,
  logLevel,
  resolvePretty,
}: LoggerFactoryOptions = {}): ReturnType<typeof pino> {
  const resolvedNodeEnv = nodeEnv ?? process.env.NODE_ENV
  const resolvedLogLevel = logLevel ?? process.env.LOG_LEVEL
  const isProduction = resolvedNodeEnv === 'production'

  const require = createRequire(import.meta.url)
  let prettyTarget: string | null = null
  if (!isProduction) {
    if (resolvePretty) {
      prettyTarget = resolvePretty()
    } else {
      try {
        prettyTarget = require.resolve('pino-pretty')
      } catch {
        prettyTarget = null
      }
    }
  }

  const transport =
    prettyTarget === null
      ? undefined
      : pino.transport({
          target: prettyTarget,
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            customColors: 'error:red,warn:yellowBright',
          },
        })

  return pino(
    {
      level: resolvedLogLevel ?? (isProduction ? 'info' : 'debug'),
      base: { env: resolvedNodeEnv },
      redact: {
        paths: [
          'password',
          'token',
          'secret',
          'apiKey',
          'authorization',
          'cookie',
          'session',
          'firebaseUid',
          'email',
          'phone',
          'ip',
          'headers.authorization',
          'headers.cookie',
          'req.headers.authorization',
          'req.headers.cookie',
        ],
        remove: true,
      },
    },
    transport,
  )
}

export const logger = createLogger()
