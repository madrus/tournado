import { PassThrough } from 'node:stream'

import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'

import type { EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'

import 'dotenv/config'

// Ensure DATABASE_URL is set for local dev if not already present
if (!process.env.DATABASE_URL) {
  const isTest =
    process.env.NODE_ENV === 'test' ||
    process.env.PLAYWRIGHT === 'true' ||
    process.env.PLAYWRIGHT_TEST === 'true'
  if (process.env.NODE_ENV !== 'production') {
    process.env.DATABASE_URL = isTest
      ? 'file:./prisma/data-test.db?connection_limit=1'
      : 'file:./prisma/data.db?connection_limit=1'
  } else {
    throw new Error('DATABASE_URL must be set in production environment!')
  }
}

const ABORT_DELAY = 5_000

function applySecurityHeaders(headers: Headers): void {
  const isDev = process.env.NODE_ENV !== 'production'

  // Note: We currently allow 'unsafe-inline' to support the small inline
  // SSR script in root.tsx. We can migrate to nonces later.
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    // Dev allowances include localhost and unsafe-eval for Vite HMR
    // Firebase Auth requires Google APIs and Firebase domains
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com${isDev ? " 'unsafe-eval' http://localhost:* http://127.0.0.1:*" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://www.google-analytics.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com${isDev ? ' http://localhost:* ws://localhost:* ws://127.0.0.1:*' : ''}`,
    'frame-src https://accounts.google.com https://*.firebaseapp.com',
    "frame-ancestors 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ')

  headers.set('Content-Security-Policy', csp)
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  if (!isDev) {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
): Promise<Response> {
  return isbot(request.headers.get('user-agent'))
    ? handleBotRequest(request, responseStatusCode, responseHeaders, reactRouterContext)
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        reactRouterContext
      )
}

const handleBotRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
): Promise<Response> =>
  new Promise((resolve, reject) => {
    const { abort, pipe } = renderToPipeableStream(
      <ServerRouter context={reactRouterContext} url={request.url} />,
      {
        onAllReady() {
          const body = new PassThrough()

          responseHeaders.set('Content-Type', 'text/html')
          applySecurityHeaders(responseHeaders)

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          // eslint-disable-next-line no-console
          console.error(error)
        },
      }
    )

    setTimeout(abort, ABORT_DELAY)
  })

const handleBrowserRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
): Promise<Response> =>
  new Promise((resolve, reject) => {
    const { abort, pipe } = renderToPipeableStream(
      <ServerRouter context={reactRouterContext} url={request.url} />,
      {
        onShellReady() {
          const body = new PassThrough()

          responseHeaders.set('Content-Type', 'text/html')
          applySecurityHeaders(responseHeaders)

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          // eslint-disable-next-line no-console
          console.error(error)
          responseStatusCode = 500
        },
      }
    )

    setTimeout(abort, ABORT_DELAY)
  })
