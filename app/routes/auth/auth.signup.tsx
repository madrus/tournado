import { JSX } from 'react'
import type { MetaFunction } from 'react-router'
import { redirect, useActionData } from 'react-router'

import { SignUp } from '~/components/auth'
import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { prisma } from '~/db.server'
import { createUser, getUserByEmail } from '~/models/user.server'
import { shouldRedirectAuthenticatedUser } from '~/utils/roleBasedRedirects'
import type { RouteMetadata } from '~/utils/route-types'
import { getUser } from '~/utils/session.server'
import { safeRedirect, validateEmail } from '~/utils/utils'

import type { Route } from './+types/auth.signup'

type ActionData = {
  errors?: {
    email: string | null
    password: string | null
    firstName?: string | null
    lastName?: string | null
  }
}

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.signUp',
}

export async function loader({ request }: Route.LoaderArgs): Promise<object> {
  const user = await getUser(request)
  if (user) {
    // Use role-based redirect instead of always going to homepage
    const redirectTo = shouldRedirectAuthenticatedUser(user, '/auth/signup')
    if (redirectTo) {
      return redirect(redirectTo)
    }
  }
  return {}
}

export const action = async ({ request }: Route.ActionArgs): Promise<Response> => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = safeRedirect(formData.get('redirectTo'), null)
  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')

  if (!validateEmail(email)) {
    return Response.json(
      { errors: { email: 'emailInvalid', password: null } },
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

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return Response.json(
      {
        errors: {
          email: 'emailExists',
          password: null,
        },
      },
      { status: 400 }
    )
  }

  // Check if this is the first user (make them admin)
  const userCount = await prisma.user.count()
  const role = userCount === 0 ? 'ADMIN' : 'PUBLIC'

  await createUser(
    email,
    password,
    typeof firstName === 'string' ? firstName : '',
    typeof lastName === 'string' ? lastName : '',
    role
  )

  // After successful signup, redirect to signin page (don't auto-login)
  // Preserve the original redirectTo parameter for after they sign in
  const signInUrl = redirectTo
    ? `/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`
    : '/auth/signin'

  return redirect(signInUrl)
}

export const meta: MetaFunction = () => [
  { title: 'Sign Up | Tournado' },
  {
    name: 'description',
    content:
      'Create your free Tournado account to start organizing and managing tournaments.',
  },
  { property: 'og:title', content: 'Sign Up | Tournado' },
  {
    property: 'og:description',
    content:
      'Create your free Tournado account to start organizing and managing tournaments.',
  },
  { property: 'og:type', content: 'website' },
]

export default function SignupPage(): JSX.Element {
  const actionData = useActionData<ActionData>()
  return <SignUp actionData={actionData} />
}

export { AuthErrorBoundary as ErrorBoundary }
