import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { createUser, getUserByEmail } from '~/models/user.server'
import { createUserSession, getUserId } from '~/utils/session.server'
import { safeRedirect, validateEmail } from '~/utils/utils'

export const loader = async ({ request }: LoaderFunctionArgs): Promise<Response> => {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return json({})
}

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/')

  if (!validateEmail(email)) {
    return json(
      {
        errors: {
          email: 'emailInvalid',
          password: null,
          firstName: null,
          lastName: null,
        },
      },
      { status: 400 }
    )
  }

  if (typeof password !== 'string' || password.length === 0) {
    return json(
      {
        errors: {
          email: null,
          password: 'passwordRequired',
          firstName: null,
          lastName: null,
        },
      },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return json(
      {
        errors: {
          email: null,
          password: 'passwordTooShort',
          firstName: null,
          lastName: null,
        },
      },
      { status: 400 }
    )
  }

  if (typeof firstName !== 'string' || firstName.length === 0) {
    return json(
      {
        errors: {
          email: null,
          password: null,
          firstName: 'firstNameRequired',
          lastName: null,
        },
      },
      { status: 400 }
    )
  }

  if (typeof lastName !== 'string' || lastName.length === 0) {
    return json(
      {
        errors: {
          email: null,
          password: null,
          firstName: null,
          lastName: 'lastNameRequired',
        },
      },
      { status: 400 }
    )
  }

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return json(
      {
        errors: {
          email: 'emailExists',
          password: null,
          firstName: null,
          lastName: null,
        },
      },
      { status: 400 }
    )
  }

  const user = await createUser(email, password, firstName, lastName, 'PUBLIC')

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  })
}

export const meta: MetaFunction = () => [{ title: 'Sign Up' }]

export default function Join(): JSX.Element {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? undefined
  const actionData = useActionData<typeof action>()
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
    <div className='flex min-h-full flex-col justify-center'>
      <div className='mx-auto w-full max-w-md px-8'>
        <Form method='post' className='space-y-6'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
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
              htmlFor='firstName'
              className='block text-sm font-medium text-gray-700'
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
                className='w-full rounded-sm border border-gray-500 px-2 py-1 text-lg'
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
              className='block text-sm font-medium text-gray-700'
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
                className='w-full rounded-sm border border-gray-500 px-2 py-1 text-lg'
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
                autoComplete='new-password'
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
            className='w-full rounded-sm bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400'
          >
            {t('auth.createAccount')}
          </button>
          <div className='flex items-center justify-center'>
            <div className='text-center text-sm text-gray-500'>
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                className='text-blue-500 underline'
                to={{
                  pathname: '/signin',
                  search: searchParams.toString(),
                }}
              >
                {t('auth.signin')}
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
