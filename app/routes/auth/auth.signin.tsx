import { type JSX, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Form,
  Link,
  type MetaFunction,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from 'react-router'

import { CheckCircleIcon } from '~/components/icons'
import { verifySignin } from '~/models/user.server'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinTitleClass } from '~/utils/rtlUtils'
import { createUserSession, getUser } from '~/utils/session.server'
import { validateEmail } from '~/utils/utils'

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

export const loader = async ({ request }: Route.LoaderArgs): Promise<object> => {
  const user = await getUser(request)
  if (user) {
    // Always redirect all authorized users to Admin Panel
    return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1')
  }
  return {}
}

export const action = async ({ request }: Route.ActionArgs): Promise<Response> => {
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

  // Always redirect all authorized users to Admin Panel
  return createUserSession({
    redirectTo: '/a7k9m2x5p8w1n4q6r3y8b5t1',
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
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const redirectTo = searchParams.get('redirectTo') || ''
  const registered = searchParams.get('registered') === 'true'
  const emailFromRegistration = searchParams.get('email')
  const actionData = useActionData<ActionData>()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Use controlled inputs to prevent clearing issues
  const [formData, setFormData] = useState({
    email: emailFromRegistration || '',
    password: '',
  })

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

  useEffect(() => {
    // Pre-fill email if provided from registration
    if (emailFromRegistration) {
      setFormData(prev => ({ ...prev, email: emailFromRegistration }))
      // Focus on password field if email is pre-filled
      passwordRef.current?.focus()
    }
  }, [emailFromRegistration])

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: event.target.value }))
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, password: event.target.value }))
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <div className='flex flex-1 flex-col'>
        <div className='bg-background mx-auto mt-24 w-full max-w-md rounded-lg p-8'>
          {registered ? (
            <div className='bg-accent mb-4 rounded-md p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <CheckCircleIcon className='text-accent' size={20} />
                </div>
                <div className='ms-3'>
                  <h3
                    className={cn(
                      'text-foreground text-sm font-medium',
                      getLatinTitleClass(i18n.language)
                    )}
                  >
                    {t('auth.registrationSuccess')}
                  </h3>
                  <div className='text-foreground-light mt-2 text-sm'>
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
                className='text-foreground block text-sm font-medium'
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
                  value={formData.email}
                  onChange={handleEmailChange}
                  aria-invalid={actionData?.errors?.email ? true : undefined}
                  aria-describedby='email-error'
                  className='border-input-border text-input-foreground bg-input w-full rounded-sm border px-2 py-1 text-lg'
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
                className='text-foreground block text-sm font-medium'
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
                  value={formData.password}
                  onChange={handlePasswordChange}
                  aria-invalid={actionData?.errors?.password ? true : undefined}
                  aria-describedby='password-error'
                  className='border-input-border text-input-foreground bg-input w-full rounded-sm border px-2 py-1 text-lg'
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
              className='bg-button-primary-background text-button-primary-text hover:bg-button-primary-hover-background focus-visible:outline-primary w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'
            >
              {isSubmitting ? (
                <>
                  <span className='border-button-primary-text me-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent'></span>
                  {t('common.loading')}
                </>
              ) : (
                t('auth.signin')
              )}
            </button>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember'
                  name='remember'
                  type='checkbox'
                  className='border-input-border text-primary hover:ring-primary focus:ring-primary h-4 w-4 rounded-sm hover:ring-2'
                />
                <label htmlFor='remember' className='ms-2 block text-sm'>
                  {t('auth.rememberMe')}
                </label>
              </div>
              <div className='text-foreground-lighter text-center text-sm'>
                {t('auth.dontHaveAccount')}{' '}
                <Link
                  className='text-primary hover:text-primary-hover underline'
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
