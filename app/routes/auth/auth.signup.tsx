import { JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { createUser, getUserByEmail } from '~/models/user.server'
import { cn } from '~/utils/misc'
import { shouldRedirectAuthenticatedUser } from '~/utils/roleBasedRedirects'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinTitleClass } from '~/utils/rtlUtils'
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

  await createUser(
    email,
    password,
    typeof firstName === 'string' ? firstName : '',
    typeof lastName === 'string' ? lastName : '',
    'PUBLIC' // Default role for new users
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
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const redirectTo = searchParams.get('redirectTo') || '' // Empty string instead of hard-coded default
  const actionData = useActionData<ActionData>()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    } else if (actionData?.errors?.firstName) {
      firstNameRef.current?.focus()
    } else if (actionData?.errors?.lastName) {
      lastNameRef.current?.focus()
    }
  }, [actionData])

  return (
    <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
        <h2
          className={cn(
            'mt-10 text-center text-2xl leading-9 font-bold tracking-tight',
            getLatinTitleClass(i18n.language)
          )}
        >
          {t('common.titles.signUp')}
        </h2>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <Form method='post' className='space-y-6'>
          <div>
            <label
              htmlFor='firstName'
              className='text-foreground block text-sm leading-6 font-medium'
            >
              {t('auth.firstName')}
            </label>
            <div className='mt-2'>
              <input
                ref={firstNameRef}
                id='firstName'
                required
                name='firstName'
                type='text'
                autoComplete='given-name'
                aria-invalid={actionData?.errors?.firstName ? true : undefined}
                aria-describedby='firstName-error'
                className='ring-input-border placeholder:text-foreground-lighter hover:ring-input-hover focus:ring-input-focus bg-input text-input-foreground block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset hover:ring-2 hover:ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6'
              />
              {actionData?.errors?.firstName ? (
                <div className='text-error pt-1' id='firstName-error'>
                  {t(`auth.errors.${actionData.errors.firstName}`)}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor='lastName'
              className='text-foreground block text-sm leading-6 font-medium'
            >
              {t('auth.lastName')}
            </label>
            <div className='mt-2'>
              <input
                ref={lastNameRef}
                id='lastName'
                required
                name='lastName'
                type='text'
                autoComplete='family-name'
                aria-invalid={actionData?.errors?.lastName ? true : undefined}
                aria-describedby='lastName-error'
                className='ring-input-border placeholder:text-foreground-lighter hover:ring-input-hover focus:ring-input-focus bg-input text-input-foreground block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset hover:ring-2 hover:ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6'
              />
              {actionData?.errors?.lastName ? (
                <div className='text-error pt-1' id='lastName-error'>
                  {t(`auth.errors.${actionData.errors.lastName}`)}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor='email'
              className='text-foreground block text-sm leading-6 font-medium'
            >
              {t('auth.emailAddress')}
            </label>
            <div className='mt-2'>
              <input
                ref={emailRef}
                id='email'
                required
                name='email'
                type='email'
                autoComplete='email'
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby='email-error'
                className='ring-input-border placeholder:text-foreground-lighter hover:ring-input-hover focus:ring-input-focus bg-input text-input-foreground block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset hover:ring-2 hover:ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6'
              />
              {actionData?.errors?.email ? (
                <div className='text-error pt-1' id='email-error'>
                  {t(`auth.errors.${actionData.errors.email}`)}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='text-foreground block text-sm leading-6 font-medium'
            >
              {t('auth.password')}
            </label>
            <div className='mt-2'>
              <input
                id='password'
                ref={passwordRef}
                name='password'
                type='password'
                autoComplete='new-password'
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby='password-error'
                className='ring-input-border placeholder:text-foreground-lighter hover:ring-input-hover focus:ring-input-focus bg-input text-input-foreground block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset hover:ring-2 hover:ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6'
              />
              {actionData?.errors?.password ? (
                <div className='text-error pt-1' id='password-error'>
                  {t(`auth.errors.${actionData.errors.password}`)}
                </div>
              ) : null}
            </div>
          </div>

          <input type='hidden' name='redirectTo' value={redirectTo} />
          <button
            type='submit'
            disabled={isSubmitting}
            className='focus-visible:outline-offset bg-button-primary-background text-button-primary-text hover:bg-button-primary-hover-background focus-visible:outline-primary flex w-full justify-center rounded-md px-3 py-1.5 text-sm leading-6 font-semibold shadow-sm focus-visible:outline-2 disabled:opacity-50'
          >
            {isSubmitting ? (
              <>
                <span className='border-button-primary-text me-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent'></span>
                {t('common.loading')}
              </>
            ) : (
              t('auth.createAccount')
            )}
          </button>
        </Form>

        <p className='text-foreground-lighter mt-10 text-center text-sm'>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to='/auth/signin'
            className='text-primary hover:text-primary-hover leading-6 font-semibold'
          >
            {t('auth.signin')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
