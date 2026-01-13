import type { Role } from '@prisma/client'
import { type Session, createCookieSessionStorage, redirect } from 'react-router'
import invariant from 'tiny-invariant'
import {
	clearFirebaseSession,
	validateFirebaseSession,
} from '~/features/firebase/session.server'
import type { CreateUserSessionProps } from '~/features/firebase/types'
import type { User } from '~/models/user.server'
import { getUserById } from '~/models/user.server'
import { isPublicRoute } from './publicRoutes.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: '__session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === 'production' && !process.env.PLAYWRIGHT,
		maxAge: undefined, // Default to session cookie, will be overridden when remember is true
	},
})

const USER_SESSION_KEY = 'userId'

export async function getSession(request: Request): Promise<Session> {
	const cookie = request.headers.get('Cookie')
	return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request): Promise<User['id'] | undefined> {
	// First, try to get user from Firebase session
	const firebaseResult = await validateFirebaseSession({ request })
	if (firebaseResult) {
		return firebaseResult.user.id
	}

	// Fall back to legacy session
	const session = await getSession(request)
	const userId = session.get(USER_SESSION_KEY)
	return userId
}

export async function getUser(request: Request): Promise<User | null> {
	// First, try to get user from Firebase session
	const firebaseResult = await validateFirebaseSession({ request })
	if (firebaseResult) {
		return firebaseResult.user
	}

	// Fall back to legacy session
	const userId = await getUserId(request)
	if (userId === undefined) return null

	const user = await getUserById(userId)

	// Check if user is deactivated
	if (user && !user.active) {
		throw await signout(request)
	}

	if (user) return user

	throw await signout(request)
}

export async function requireUserId(
	request: Request,
	redirectTo: string = new URL(request.url).pathname,
): Promise<User['id']> {
	const userId = await getUserId(request)
	if (!userId) {
		const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
		throw redirect(`/auth/signin?${searchParams}`)
	}
	return userId
}

export async function requireUser(request: Request): Promise<User> {
	const userId = await requireUserId(request)

	const user = await getUserById(userId)
	if (user) return user

	throw await signout(request)
}

export async function requireUserWithRole(
	request: Request,
	allowedRoles: Role[],
): Promise<User> {
	const user = await requireUser(request)

	if (!allowedRoles.includes(user.role)) {
		throw redirect('/unauthorized')
	}

	return user
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

export async function createFirebaseUserSession({
	request,
	userId,
	remember,
	redirectTo,
}: CreateUserSessionProps): Promise<Response> {
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

export async function signout(request: Request, returnUrl?: string): Promise<Response> {
	const session = await getSession(request)

	// Clear Firebase session data if present
	await clearFirebaseSession(session)

	// Force the cookie to be cleared
	const cookieValue = await sessionStorage.destroySession(session)

	// Default to home page
	let redirectPath = '/'

	// If a returnUrl is provided, determine if it's a public route
	if (returnUrl) {
		// Extract just the path part (without query params)
		const url = new URL(returnUrl, 'http://example.com')
		const path = url.pathname

		// Check if it's a public route using our utility
		if (await isPublicRoute(path)) {
			redirectPath = returnUrl
		}
	}

	// Additional headers to prevent caching
	return redirect(redirectPath, {
		headers: {
			'Set-Cookie': cookieValue,
			'Cache-Control': 'no-store, max-age=0',
			Pragma: 'no-cache',
			Expires: new Date(0).toUTCString(),
		},
	})
}
