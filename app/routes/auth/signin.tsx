import { type JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Form,
  Link,
  type MetaFunction,
  redirect,
  useActionData,
  useSearchParams,
} from 'react-router'

import { verifySignin } from '~/models/user.server'
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
  }
}

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.signIn',
}

export const loader = async ({ request }: LoaderArgs): Promise<object> => {
  const userId = await getUserId(request)
  if (userId) {
    // Get the redirectTo parameter from the URL if present
    const url = new URL(request.url)
    const redirectTo = url.searchParams.get('redirectTo')
    // Redirect to the intended destination or root page
    return redirect(redirectTo || '/')
  }
  return {}
}

export const action = async ({ request }: ActionArgs): Promise<Response> => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/')
  const remember = formData.get('remember')

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

  const user = await verifySignin(email, password)

  if (!user) {
    return Response.json(
      { errors: { email: 'invalidCredentials', password: null } },
      { status: 400 }
    )
  }

  return createUserSession({
    redirectTo,
    remember: remember === 'on',
    request,
    userId: user.id,
  })
}

export const meta: MetaFunction = () => [{ title: 'Sign in' }]

export default function SigninPage(): JSX.Element {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const registered = searchParams.get('registered') === 'true'
  const emailFromRegistration = searchParams.get('email')
  const actionData = useActionData<ActionData>()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

  useEffect(() => {
    // Pre-fill email if provided from registration
    if (emailFromRegistration && emailRef.current) {
      emailRef.current.value = emailFromRegistration
      // Focus on password field if email is pre-filled
      passwordRef.current?.focus()
    }
  }, [emailFromRegistration])

  return (
    <div className='flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 via-white to-white'>
      <div className='flex flex-1 flex-col'>
        <div className='mx-auto mt-24 w-full max-w-md rounded-lg bg-white/50 p-8'>
          {registered ? (
            <div className='mb-4 rounded-md bg-green-50 p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <span className='material-symbols-outlined text-green-400'>
                    check_circle
                  </span>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-green-800'>
                    {t('auth.registrationSuccess')}
                  </h3>
                  <div className='mt-2 text-sm text-green-700'>
                    <p>{t('auth.pleaseSignIn')}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <Form method='post' className='space-y-6'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                {t('auth.emailAddress')}
              </label>
              <div className='mt-1'>
                <input
                  ref={emailRef}
                  id='email'
                  required
                  autoFocus={true}
                  name='email'
                  type='email'
                  autoComplete='email'
                  aria-invalid={actionData?.errors?.email ? true : undefined}
                  aria-describedby='email-error'
                  className='w-full rounded-sm border border-gray-500 px-2 py-1 text-lg'
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
                className='block text-sm font-medium text-gray-700'
              >
                {t('auth.password')}
              </label>
              <div className='mt-1'>
                <input
                  id='password'
                  ref={passwordRef}
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  aria-invalid={actionData?.errors?.password ? true : undefined}
                  aria-describedby='password-error'
                  className='w-full rounded-sm border border-gray-500 px-2 py-1 text-lg'
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
              className='w-full rounded-sm bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:bg-emerald-500'
            >
              {t('auth.signin')}
            </button>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember'
                  name='remember'
                  type='checkbox'
                  className='h-4 w-4 rounded-sm border-gray-300 text-emerald-600 focus:ring-emerald-500'
                />
                <label htmlFor='remember' className='ml-2 block text-sm text-gray-900'>
                  {t('auth.rememberMe')}
                </label>
              </div>
              <div className='text-center text-sm text-gray-500'>
                {t('auth.dontHaveAccount')}{' '}
                <Link
                  className='text-emerald-600 underline hover:text-emerald-500'
                  to={{
                    pathname: '/auth/signup',
                    search: searchParams.toString(),
                  }}
                  aria-label={t('auth.signup')}
                  role='link'
                >
                  {t('auth.signup')}
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
