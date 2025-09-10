import { type JSX } from 'react'
import { type MetaFunction, redirect, useActionData, useLoaderData } from 'react-router'

import { SignIn } from '~/components/auth'
import { FirebaseSignIn } from '~/features/firebase/components/FirebaseSignIn'
import { verifySignin } from '~/models/user.server'
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIP,
  RATE_LIMITS,
} from '~/utils/rateLimit.server'
import {
  getPostSignInRedirect,
  shouldRedirectAuthenticatedUser,
} from '~/utils/roleBasedRedirects'
import type { RouteMetadata } from '~/utils/routeTypes'
import { validateEmail } from '~/utils/routeUtils'
import { createUserSession, getUser } from '~/utils/session.server'

import type { Route } from './+types/auth.signin'

type ActionData = {
  errors?: {
    email: string | null
    password: string | null
  }
}

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.signIn',
}

export const loader = async ({
  request,
}: Route.LoaderArgs): Promise<Response | { redirectTo: string | null }> => {
  const user = await getUser(request)
  if (user) {
    // Use role-based redirect instead of always going to admin panel
    const redirectTo = shouldRedirectAuthenticatedUser(user, '/auth/signin')
    if (redirectTo) {
      return redirect(redirectTo)
    }
  }

  // Get the redirect destination for Firebase sign-in
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirectTo') || null

  return { redirectTo }
}

export const action = async ({ request }: Route.ActionArgs): Promise<Response> => {
  // Rate limiting - check before processing any form data
  const clientIP = getClientIP(request)
  const rateLimitResult = checkRateLimit(
    `login:${clientIP}`,
    RATE_LIMITS.ADMIN_LOGIN,
    request
  )

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult, RATE_LIMITS.ADMIN_LOGIN)
  }

  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const remember = formData.get('remember')

  if (!validateEmail(email)) {
    return Response.json(
      { errors: { email: 'Email is invalid', password: null } },
      { status: 400 }
    )
  }

  if (typeof password !== 'string' || password.length === 0) {
    return Response.json(
      { errors: { email: null, password: 'passwordRequired' } },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return Response.json(
      { errors: { email: null, password: 'passwordTooShort' } },
      { status: 400 }
    )
  }

  const user = await verifySignin(email, password)

  if (!user) {
    return Response.json(
      {
        errors: {
          email: 'invalidCredentials',
          password: 'invalidCredentials',
        },
      },
      { status: 400 }
    )
  }

  // Get role-based redirect destination
  const url = new URL(request.url)
  const requestedPath = url.searchParams.get('redirectTo')
  const redirectTo = getPostSignInRedirect(user, requestedPath || undefined)

  return createUserSession({
    redirectTo,
    remember: remember === 'on' ? true : false,
    request,
    userId: user.id,
  })
}

export const meta: MetaFunction = () => [
  { title: 'Sign In | Tournado' },
  {
    name: 'description',
    content: 'Sign in to your Tournado account to manage your tournaments and teams.',
  },
  { property: 'og:title', content: 'Sign In | Tournado' },
  {
    property: 'og:description',
    content: 'Sign in to your Tournado account to manage your tournaments and teams.',
  },
  { property: 'og:type', content: 'website' },
]

export default function SigninPage(): JSX.Element {
  const actionData = useActionData<ActionData>()
  const { redirectTo } = useLoaderData<typeof loader>()

  return (
    <div className='mx-auto max-w-md space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>Sign In</h1>
        <p className='text-muted-foreground'>Sign in to your Tournado account</p>
      </div>

      {/* Firebase Google Sign-in */}
      <FirebaseSignIn redirectTo={redirectTo} />

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            Or continue with email
          </span>
        </div>
      </div>

      {/* Legacy email/password sign-in */}
      <SignIn actionData={actionData} />
    </div>
  )
}
