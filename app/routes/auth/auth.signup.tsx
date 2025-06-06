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
import type { RouteMetadata } from '~/utils/route-types'
import { createUserSession, getUserId } from '~/utils/session.server'
import { safeRedirect, validateEmail } from '~/utils/utils'

interface LoaderArgs {
  request: Request
}

interface ActionArgs {
  request: Request
}

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

export async function loader({ request }: LoaderArgs): Promise<object> {
  const userId = await getUserId(request)
  if (userId) {
    // If user is already logged in, redirect them
    // We can't determine their role here easily, so just redirect to teams
    return redirect('/teams')
  }
  return {}
}

export const action = async ({ request }: ActionArgs): Promise<Response> => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = safeRedirect(formData.get('redirectTo'), undefined)
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

  const user = await createUser(
    email,
    password,
    typeof firstName === 'string' ? firstName : '',
    typeof lastName === 'string' ? lastName : '',
    'PUBLIC' // Default role for new users
  )

  // Use consistent default redirect for all users regardless of role
  const defaultRedirect = '/'

  // Always respect redirectTo if provided, regardless of user role
  return createUserSession({
    redirectTo: redirectTo || defaultRedirect,
    remember: false,
    request,
    userId: user.id,
  })
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
  const { t } = useTranslation()
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
        <h2 className='mt-10 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900'>
          {t('common.titles.signUp')}
        </h2>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <Form method='post' className='space-y-6'>
          <div>
            <label
              htmlFor='firstName'
              className='block text-sm leading-6 font-medium text-gray-900'
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
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-600 focus:ring-inset sm:text-sm sm:leading-6'
              />
              {actionData?.errors?.firstName ? (
                <div className='pt-1 text-red-700' id='firstName-error'>
                  {t(`auth.errors.${actionData.errors.firstName}`)}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor='lastName'
              className='block text-sm leading-6 font-medium text-gray-900'
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
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-600 focus:ring-inset sm:text-sm sm:leading-6'
              />
              {actionData?.errors?.lastName ? (
                <div className='pt-1 text-red-700' id='lastName-error'>
                  {t(`auth.errors.${actionData.errors.lastName}`)}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm leading-6 font-medium text-gray-900'
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
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-600 focus:ring-inset sm:text-sm sm:leading-6'
              />
              {actionData?.errors?.email ? (
                <div className='pt-1 text-red-700' id='email-error'>
                  {t(`auth.errors.${actionData.errors.email}`)}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm leading-6 font-medium text-gray-900'
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
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-600 focus:ring-inset sm:text-sm sm:leading-6'
              />
              {actionData?.errors?.password ? (
                <div className='pt-1 text-red-700' id='password-error'>
                  {t(`auth.errors.${actionData.errors.password}`)}
                </div>
              ) : null}
            </div>
          </div>

          <input type='hidden' name='redirectTo' value={redirectTo} />
          <button
            type='submit'
            disabled={isSubmitting}
            className='focus-visible:outline-offset flex w-full justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm leading-6 font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:bg-emerald-300'
          >
            {isSubmitting ? (
              <>
                <span className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></span>
                {t('common.loading')}
              </>
            ) : (
              t('auth.createAccount')
            )}
          </button>
        </Form>

        <p className='mt-10 text-center text-sm text-gray-500'>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to='/auth/signin'
            className='leading-6 font-semibold text-emerald-600 hover:text-emerald-500'
          >
            {t('auth.signin')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
