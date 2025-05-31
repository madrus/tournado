import { PassThrough } from 'node:stream'

import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'

import type { EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'

import 'dotenv/config'

// Ensure DATABASE_URL is set for local dev if not already present
if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV !== 'production') {
    process.env.DATABASE_URL = 'file:./prisma/data.db?connection_limit=1'
  } else {
    throw new Error('DATABASE_URL must be set in production environment!')
  }
}

const ABORT_DELAY = 5_000

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
