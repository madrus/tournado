/* eslint-disable no-console */
import { redirect } from 'react-router'

import { createSessionFromFirebaseToken } from '~/features/firebase/index.server'
import { getPostSignInRedirect } from '~/utils/roleBasedRedirects'
import { sessionStorage } from '~/utils/session.server'

import type { Route } from './+types/auth.callback'

export const loader = async ({ request }: Route.LoaderArgs): Promise<Response> => {
  // This route should only be accessed via POST (action)
  const url = new URL(request.url)
  const absoluteSigninUrl = new URL(
    '/auth/signin',
    `${url.protocol}//${url.host}`
  ).toString()
  return redirect(absoluteSigninUrl, { status: 302 })
}

export const action = async ({ request }: Route.ActionArgs): Promise<Response> => {
  const formData = await request.formData()
  const idToken = formData.get('idToken') as string
  const redirectTo = formData.get('redirectTo') as string

  if (!idToken) {
    const url = new URL(request.url)
    const absoluteErrorUrl = new URL(
      '/auth/signin?error=missing-token',
      `${url.protocol}//${url.host}`
    ).toString()
    return redirect(absoluteErrorUrl, { status: 303 })
  }

  try {
    // Use session bridge to create server session from Firebase token
    const sessionResult = await createSessionFromFirebaseToken({
      idToken,
      request,
    })

    if (!sessionResult) {
      console.log('[auth-callback] Session creation failed - invalid token')
      const url = new URL(request.url)
      const absoluteErrorUrl = new URL(
        '/auth/signin?error=invalid-token',
        `${url.protocol}//${url.host}`
      ).toString()
      return redirect(absoluteErrorUrl, { status: 303 })
    }

    const { user } = sessionResult
    console.log(
      `[auth-callback] User found: ${user.email}, role: ${user.role}, id: ${user.id}`
    )

    // Get role-based redirect destination
    const finalRedirectTo = getPostSignInRedirect(user, redirectTo || undefined)
    console.log(
      `[auth-callback] Redirecting to: ${finalRedirectTo} (requested: ${redirectTo}, user role: ${user.role})`
    )

    // Create absolute URL to avoid protocol issues
    const url = new URL(request.url)
    const absoluteRedirectUrl = new URL(
      finalRedirectTo,
      `${url.protocol}//${url.host}`
    ).toString()

    return redirect(absoluteRedirectUrl, {
      status: 303,
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(sessionResult.session),
      },
    })
  } catch (_error) {
    console.log('[auth-callback] Error:', _error)

    // Handle deactivated account error
    if (_error instanceof Error && _error.message === 'ACCOUNT_DEACTIVATED') {
      const url = new URL(request.url)
      const absoluteErrorUrl = new URL(
        '/auth/signin?error=account-deactivated',
        `${url.protocol}//${url.host}`
      ).toString()
      return redirect(absoluteErrorUrl, { status: 303 })
    }

    // Firebase auth callback error
    const url = new URL(request.url)
    const absoluteErrorUrl = new URL(
      '/auth/signin?error=auth-failed',
      `${url.protocol}//${url.host}`
    ).toString()
    return redirect(absoluteErrorUrl, { status: 303 })
  }
}
