import { redirect } from 'react-router'

import { createSessionFromFirebaseToken } from '~/features/firebase/session.server'
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
  return redirect(absoluteSigninUrl)
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
    return redirect(absoluteErrorUrl)
  }

  try {
    // Use session bridge to create server session from Firebase token
    const sessionResult = await createSessionFromFirebaseToken({
      idToken,
      request,
    })

    if (!sessionResult) {
      const url = new URL(request.url)
      const absoluteErrorUrl = new URL(
        '/auth/signin?error=invalid-token',
        `${url.protocol}//${url.host}`
      ).toString()
      return redirect(absoluteErrorUrl)
    }

    const { user } = sessionResult

    // Get role-based redirect destination
    const finalRedirectTo = getPostSignInRedirect(user, redirectTo || undefined)

    // Create absolute URL to avoid protocol issues
    const url = new URL(request.url)
    const absoluteRedirectUrl = new URL(
      finalRedirectTo,
      `${url.protocol}//${url.host}`
    ).toString()

    return redirect(absoluteRedirectUrl, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(sessionResult.session),
      },
    })
  } catch (_error) {
    // Firebase auth callback error
    const url = new URL(request.url)
    const absoluteErrorUrl = new URL(
      '/auth/signin?error=auth-failed',
      `${url.protocol}//${url.host}`
    ).toString()
    return redirect(absoluteErrorUrl)
  }
}
