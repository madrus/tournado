/* eslint-disable id-blacklist */
/* eslint-disable no-console */
// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { type JSX, useRef, useState } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useActionData,
  useFetcher,
  useLoaderData,
} from 'react-router'

import { prisma } from '~/db.server'
import { adminAuth, verifyIdToken } from '~/features/firebase/index.server'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type HealthData = {
  serverEnv: string
  appEnv: string
  initialized: boolean
  projectId: string | null
  adminEnv: {
    FIREBASE_ADMIN_PROJECT_ID: boolean
    FIREBASE_ADMIN_CLIENT_EMAIL: boolean
    FIREBASE_ADMIN_PRIVATE_KEY: boolean
  }
  clientEnv: {
    VITE_FIREBASE_API_KEY: boolean
    VITE_FIREBASE_AUTH_DOMAIN: boolean
    VITE_FIREBASE_PROJECT_ID: boolean
    VITE_FIREBASE_APP_ID: boolean
    VITE_FIREBASE_STORAGE_BUCKET: boolean
    VITE_FIREBASE_MESSAGING_SENDER_ID: boolean
    VITE_FIREBASE_MEASUREMENT_ID: boolean
  }
  serverVars: {
    SESSION_SECRET: boolean
    SUPER_ADMIN_EMAILS: boolean
    DATABASE_URL: boolean
    BASE_URL: boolean
    RESEND_API_KEY: boolean
    EMAIL_FROM: boolean
    PLAYWRIGHT: boolean
  }
  infra: {
    dbOk: boolean
    selfOk: boolean
  }
  overallOk: boolean
  timestamp: string
  requestHost: string | null
}

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<Response | HealthData> => {
  const env = process.env.NODE_ENV || 'development'
  const appEnv = process.env.APP_ENV || 'development'
  const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
  const url = new URL('/', `http://${host}`)

  // Production: keep fast plain probe for platform health checks
  if (env === 'production' && appEnv !== 'staging') {
    try {
      await Promise.all([
        prisma.user.count(),
        fetch(url.toString(), { method: 'HEAD' }).then(r => {
          if (!r.ok) return Promise.reject(r)
        }),
      ])
      return new Response('OK', { headers: { 'Content-Type': 'text/plain' } })
    } catch (error: unknown) {
      console.log('healthcheck ❌', { error })
      return new Response('ERROR', { status: 500 })
    }
  }

  // Dev/Test: return combined app + Firebase health (HTML by default, JSON if requested)
  let dbOk = false
  try {
    await prisma.user.count()
    dbOk = true
  } catch {
    dbOk = false
  }

  let selfOk = false
  try {
    const r = await fetch(url.toString(), { method: 'HEAD' })
    selfOk = r.ok
  } catch {
    selfOk = false
  }

  const data: HealthData = {
    serverEnv: env,
    appEnv,
    initialized: Boolean(adminAuth),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || null,
    adminEnv: {
      FIREBASE_ADMIN_PROJECT_ID: Boolean(process.env.FIREBASE_ADMIN_PROJECT_ID),
      FIREBASE_ADMIN_CLIENT_EMAIL: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
      FIREBASE_ADMIN_PRIVATE_KEY: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
    },
    clientEnv: {
      VITE_FIREBASE_API_KEY: Boolean(process.env.VITE_FIREBASE_API_KEY),
      VITE_FIREBASE_AUTH_DOMAIN: Boolean(process.env.VITE_FIREBASE_AUTH_DOMAIN),
      VITE_FIREBASE_PROJECT_ID: Boolean(process.env.VITE_FIREBASE_PROJECT_ID),
      VITE_FIREBASE_APP_ID: Boolean(process.env.VITE_FIREBASE_APP_ID),
      VITE_FIREBASE_STORAGE_BUCKET: Boolean(process.env.VITE_FIREBASE_STORAGE_BUCKET),
      VITE_FIREBASE_MESSAGING_SENDER_ID: Boolean(
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      ),
      VITE_FIREBASE_MEASUREMENT_ID: Boolean(process.env.VITE_FIREBASE_MEASUREMENT_ID),
    },
    serverVars: {
      SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
      SUPER_ADMIN_EMAILS: Boolean(process.env.SUPER_ADMIN_EMAILS),
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      BASE_URL: Boolean(process.env.BASE_URL),
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      EMAIL_FROM: Boolean(process.env.EMAIL_FROM),
      PLAYWRIGHT: Boolean(process.env.PLAYWRIGHT),
    },
    infra: { dbOk, selfOk },
    overallOk: Boolean(adminAuth) && dbOk && selfOk,
    timestamp: new Date().toISOString(),
    requestHost: host ?? null,
  }

  const accept = request.headers.get('accept') || ''
  const wantsJson =
    accept.includes('application/json') ||
    new URL(request.url).searchParams.get('json') === '1'
  if (wantsJson) return Response.json(data, { status: data.overallOk ? 200 : 500 })
  return data
}

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<
  Response | { ok: boolean; decoded?: unknown; error?: string }
> => {
  const env = process.env.NODE_ENV || 'development'
  const appEnv = process.env.APP_ENV || 'development'
  if (env === 'production' && appEnv !== 'staging') {
    return new Response('Not Found', { status: 404 })
  }

  if (!adminAuth) {
    const payload = { ok: false, error: 'admin-not-initialized' }
    const accept = request.headers.get('accept') || ''
    if (accept.includes('application/json')) {
      return Response.json(payload, { status: 500 })
    }
    return payload
  }

  let idToken: string | undefined
  const contentType = request.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      const body = (await request.json()) as { idToken?: string }
      idToken = body.idToken
    } else {
      const form = await request.formData()
      idToken = (form.get('idToken') as string) || undefined
    }
  } catch {
    /* ignore body parsing errors */
  }

  if (!idToken) {
    const payload = { ok: false, error: 'missing-idToken' }
    const accept = request.headers.get('accept') || ''
    if (accept.includes('application/json')) {
      return Response.json(payload, { status: 400 })
    }
    return payload
  }

  try {
    const decoded = await verifyIdToken(idToken)
    const sanitized = {
      uid: decoded.uid ?? null,
      email: typeof decoded.email === 'string' ? decoded.email : null,
      email_verified:
        typeof decoded.email_verified === 'boolean' ? decoded.email_verified : null,
      aud: typeof decoded.aud === 'string' ? decoded.aud : null,
      iss: typeof decoded.iss === 'string' ? decoded.iss : null,
      auth_time: typeof decoded.auth_time === 'number' ? decoded.auth_time : null,
      iat: typeof decoded.iat === 'number' ? decoded.iat : null,
      exp: typeof decoded.exp === 'number' ? decoded.exp : null,
      sub: typeof decoded.sub === 'string' ? decoded.sub : null,
      firebase:
        decoded && decoded.firebase && typeof decoded.firebase === 'object'
          ? {
              sign_in_provider:
                typeof decoded.firebase.sign_in_provider === 'string'
                  ? decoded.firebase.sign_in_provider
                  : null,
            }
          : null,
    }
    const payload = { ok: true, decoded: sanitized } as const
    const accept = request.headers.get('accept') || ''
    if (accept.includes('application/json')) {
      return Response.json(payload, { status: 200 })
    }
    return payload
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid-token'
    const payload = { ok: false, error: message }
    const accept = request.headers.get('accept') || ''
    if (accept.includes('application/json')) {
      return Response.json(payload, { status: 400 })
    }
    return payload
  }
}

export default function HealthcheckPage(): JSX.Element | null {
  const loaderData = useLoaderData()
  const actionData = useActionData() as
    | { ok: boolean; decoded?: unknown; error?: string }
    | undefined
  const fetcher = useFetcher<{ ok: boolean; decoded?: unknown; error?: string }>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [helper, setHelper] = useState<string | null>(null)

  // In production, loader returns Response, not HealthData
  if (!loaderData || typeof loaderData === 'string' || loaderData instanceof Response) {
    return null
  }

  const data = loaderData as HealthData

  const isDevOrStaging = data.serverEnv === 'development' || data.appEnv === 'staging'

  const handleUseCurrentUserToken = async (): Promise<void> => {
    try {
      setHelper(null)
      const mod = await import('~/features/firebase/client')
      const auth = mod.auth as import('firebase/auth').Auth | null
      if (!auth) {
        setHelper('Firebase client not configured')
        return
      }
      let user = auth.currentUser
      if (!user) {
        // Wait briefly for auth state to restore
        const authMod = await import('firebase/auth')
        const { onAuthStateChanged } = authMod
        user = await new Promise<import('firebase/auth').User | null>(resolve => {
          const timeout = setTimeout(() => resolve(null), 2000)
          const unsub = onAuthStateChanged(auth, u => {
            clearTimeout(timeout)
            unsub()
            resolve(u)
          })
        })
      }
      if (!user) {
        setHelper('No signed-in user found')
        return
      }
      const token = await user.getIdToken(true)
      if (inputRef.current) inputRef.current.value = token
      setHelper('Filled token from current user')
    } catch (err) {
      setHelper(err instanceof Error ? err.message : 'Failed to get ID token')
    }
  }

  // Production should not render this page, only staging and dev/test
  if (data.serverEnv === 'production' && data.appEnv !== 'staging') return null

  return (
    <div className='text-foreground space-y-4 p-4 sm:p-6'>
      <h1 className={cn('mb-8 text-3xl font-bold', getLatinTitleClass())}>
        App & Firebase Health (dev)
      </h1>

      <div className='flex items-center gap-3'>
        <span>Overall:</span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            data.overallOk
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          )}
        >
          {data.overallOk ? 'OK' : 'ISSUES'}
        </span>
      </div>

      <ul className='text-sm leading-6'>
        <li>
          <strong>Server env:</strong> {data.serverEnv}
        </li>
        <li>
          <strong>Admin initialized:</strong> {String(data.initialized)}
        </li>
        <li>
          <strong>Project ID:</strong> {data.projectId ?? 'null'}
        </li>
        <li>
          <strong>DB reachable:</strong> {String(data.infra.dbOk)}
        </li>
        <li>
          <strong>Self HEAD OK:</strong> {String(data.infra.selfOk)}
        </li>
        <li>
          <strong>Timestamp:</strong> {data.timestamp}
        </li>
        <li>
          <strong>Host:</strong> {data.requestHost ?? 'null'}
        </li>
      </ul>

      <div className='mt-6'>
        <h2 className='mb-2 text-lg font-semibold'>Env Presence</h2>
        <pre className='text-foreground border-border overflow-auto rounded-md border bg-white p-3 text-sm dark:bg-slate-950'>
          {JSON.stringify(
            {
              adminEnv: data.adminEnv,
              clientEnv: data.clientEnv,
              serverVars: data.serverVars,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div className='mt-6'>
        <h2 className='mb-2 text-lg font-semibold'>Verify ID Token</h2>
        <fetcher.Form method='post' className='flex flex-col gap-2'>
          <input
            name='idToken'
            type='text'
            placeholder='Paste Firebase ID token'
            ref={inputRef}
            className='bg-background text-foreground border-border focus:ring-primary/50 w-full flex-1 rounded-md border px-3 py-2 shadow-sm outline-none focus:ring-2'
          />
          <div className='flex items-center gap-2'>
            {isDevOrStaging ? (
              <button
                type='button'
                onClick={handleUseCurrentUserToken}
                className='bg-brand-50 text-brand-700 border-brand-600 hover:bg-brand-100 w-fit rounded-md border px-3 py-2 text-sm font-medium'
                title='Fill with current user ID token'
              >
                Use current user token
              </button>
            ) : null}
            <button
              type='submit'
              className='bg-brand-600 hover:bg-brand-700 w-fit rounded-md px-3 py-2 text-sm font-medium text-white'
            >
              Verify
            </button>
          </div>
          {helper ? <p className='text-foreground/70 text-xs'>{helper}</p> : null}
        </fetcher.Form>
        {fetcher.data || actionData ? (
          <pre className='text-foreground border-border mt-4 w-fit overflow-auto rounded-md border bg-white p-3 text-sm dark:bg-slate-950'>
            {JSON.stringify(fetcher.data ?? actionData, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  )
}
