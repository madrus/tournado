import { createCookieSessionStorage, redirect, type Session } from '@remix-run/node'

import invariant from 'tiny-invariant'

import type { User } from '~/models/user.server'
import { getUserById } from '~/models/user.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
    maxAge: undefined, // Default to session cookie, will be overridden when remember is true
  },
})

const USER_SESSION_KEY = 'userId'

export async function getSession(request: Request): Promise<Session> {
  const cookie = request.headers.get('Cookie')
  return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request): Promise<User['id'] | undefined> {
  const session = await getSession(request)
  const userId = session.get(USER_SESSION_KEY)
  return userId
}

export async function getUser(request: Request): Promise<User | null> {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  const user = await getUserById(userId)
  if (user) return user

  throw await signout(request)
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<User['id']> {
  const userId = await getUserId(request)
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/signin?${searchParams}`)
  }
  return userId
}

export async function requireUser(request: Request): Promise<User> {
  const userId = await requireUserId(request)

  const user = await getUserById(userId)
  if (user) return user

  throw await signout(request)
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request
  userId: string
  remember: boolean
  redirectTo: string | null
}): Promise<Response> {
  const session = await getSession(request)
  session.set('userId', userId)

  const cookieOptions = {
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined, // 7 days if remember, otherwise session cookie
  }

  return redirect(redirectTo || '/', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, cookieOptions),
      'Cache-Control': 'no-store',
    },
  })
}

export async function signout(request: Request): Promise<Response> {
  const session = await getSession(request)

  // Force the cookie to be cleared
  const cookieValue = await sessionStorage.destroySession(session)

  // Additional headers to prevent caching
  return redirect('/', {
    headers: {
      'Set-Cookie': cookieValue,
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
      Expires: new Date(0).toUTCString(),
    },
  })
}
