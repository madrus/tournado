import { JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Link, useNavigation, useSearchParams } from 'react-router'

import type { Language } from '~/i18n/config'

import {
  signinButtonContainerVariants,
  signinButtonVariants,
  signinContainerVariants,
  signinFormContainerVariants,
  signinFormFooterVariants,
  signinFormLabelVariants,
  signinFormVariants,
  signinFormWrapperVariants,
  signinLinkVariants,
  signinSecondaryTextVariants,
} from './signin.variants'

type ActionData = {
  errors?: {
    email: string | null
    password: string | null
    firstName?: string | null
    lastName?: string | null
  }
}

interface SignUpProps {
  actionData?: ActionData
}

export function SignUp({ actionData }: SignUpProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const redirectTo = searchParams.get('redirectTo') || '' // Empty string instead of hard-coded default
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
    <div className={signinContainerVariants()}>
      <div className={signinFormContainerVariants()}>
        <div className={signinFormWrapperVariants()}>
          <Form method='post' className={signinFormVariants()} role='form'>
            <div>
              <label
                htmlFor='firstName'
                className={signinFormLabelVariants({
                  language: i18n.language as Language,
                })}
              >
                {t('auth.firstName')}
              </label>
              <div className='mt-1'>
                <input
                  ref={firstNameRef}
                  id='firstName'
                  required
                  name='firstName'
                  type='text'
                  autoComplete='given-name'
                  aria-invalid={actionData?.errors?.firstName ? true : undefined}
                  aria-describedby='firstName-error'
                  className='text-foreground placeholder:text-foreground/60 w-full rounded-md border border-teal-600 bg-teal-900/20 px-4 py-3 text-lg transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-400 dark:bg-teal-200/10 dark:focus:border-teal-300 dark:focus:ring-teal-300/20'
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
                className={signinFormLabelVariants({
                  language: i18n.language as Language,
                })}
              >
                {t('auth.lastName')}
              </label>
              <div className='mt-1'>
                <input
                  ref={lastNameRef}
                  id='lastName'
                  required
                  name='lastName'
                  type='text'
                  autoComplete='family-name'
                  aria-invalid={actionData?.errors?.lastName ? true : undefined}
                  aria-describedby='lastName-error'
                  className='text-foreground placeholder:text-foreground/60 w-full rounded-md border border-teal-600 bg-teal-900/20 px-4 py-3 text-lg transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-400 dark:bg-teal-200/10 dark:focus:border-teal-300 dark:focus:ring-teal-300/20'
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
                  name='email'
                  type='email'
                  autoComplete='email'
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
                  required
                  autoComplete='new-password'
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
                  t('auth.createAccount')
                )}
              </button>
            </div>
            <div className={signinFormFooterVariants()}>
              <div></div> {/* Empty div for flexbox spacing */}
              <div
                className={signinSecondaryTextVariants({
                  language: i18n.language as Language,
                })}
              >
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to='/auth/signin' className={signinLinkVariants()}>
                  {t('auth.signin')}
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
