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

import {
  signinButtonContainerVariants,
  signinButtonVariants,
  signinCheckboxContainerVariants,
  signinCheckboxLabelVariants,
  signinCheckboxVariants,
  signinContainerVariants,
  signinFormContainerVariants,
  signinFormFooterVariants,
  signinFormLabelVariants,
  signinFormVariants,
  signinFormWrapperVariants,
  signinLinkVariants,
  signinSecondaryTextVariants,
} from '~/components/auth/signin.variants'
import { CheckCircleIcon } from '~/components/icons'
import { type Language } from '~/i18n/config'
import { verifySignin } from '~/models/user.server'
import { cn } from '~/utils/misc'
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
    // Use role-based redirect instead of always going to admin panel
    const redirectTo = shouldRedirectAuthenticatedUser(user, '/auth/signin')
    if (redirectTo) {
      return redirect(redirectTo)
    }
  }
  return {}
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
    <div className={signinContainerVariants()}>
      <div className={signinFormContainerVariants()}>
        <div className={signinFormWrapperVariants()}>
          {registered ? (
            <div className='bg-accent mb-6 rounded-md p-4'>
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
                  <div className='text-foreground mt-2 text-sm'>
                    <p>{t('auth.pleaseSignIn')}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <Form method='post' className={signinFormVariants()}>
            <div>
              <label
                htmlFor='email'
                className={signinFormLabelVariants({
                  language: i18n.language as Language,
                })}
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
                  className='text-foreground placeholder:text-foreground/60 w-full rounded-md border border-teal-600 bg-teal-900/20 px-4 py-3 text-lg transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-400 dark:bg-teal-200/10 dark:focus:border-teal-300 dark:focus:ring-teal-300/20'
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
                className={signinFormLabelVariants({
                  language: i18n.language as Language,
                })}
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
                  className='text-foreground placeholder:text-foreground/60 w-full rounded-md border border-teal-600 bg-teal-900/20 px-4 py-3 text-lg transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-400 dark:bg-teal-200/10 dark:focus:border-teal-300 dark:focus:ring-teal-300/20'
                />
                {actionData?.errors?.password ? (
                  <div className='text-error pt-1' id='password-error'>
                    {t(`auth.errors.${actionData.errors.password}`)}
                  </div>
                ) : null}
              </div>
            </div>

            <div className={signinButtonContainerVariants()}>
              <input type='hidden' name='redirectTo' value={redirectTo} />
              <button
                type='submit'
                disabled={isSubmitting}
                className={signinButtonVariants()}
              >
                {isSubmitting ? (
                  <>
                    <span className='me-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></span>
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.signin')
                )}
              </button>
            </div>
            <div className={signinFormFooterVariants()}>
              <div className={signinCheckboxContainerVariants()}>
                <input
                  id='remember'
                  name='remember'
                  type='checkbox'
                  className={signinCheckboxVariants()}
                />
                <label
                  htmlFor='remember'
                  className={signinCheckboxLabelVariants({
                    language: i18n.language as Language,
                  })}
                >
                  {t('auth.rememberMe')}
                </label>
              </div>
              <div
                className={signinSecondaryTextVariants({
                  language: i18n.language as Language,
                })}
              >
                {t('auth.dontHaveAccount')}{' '}
                <Link
                  className={signinLinkVariants()}
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
