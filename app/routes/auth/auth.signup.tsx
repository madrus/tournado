import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, type MetaFunction } from 'react-router'
import { redirect, useLoaderData } from 'react-router'

import { authenticateFirebaseUser } from '~/features/firebase/auth.server'
import { FirebaseEmailSignIn } from '~/features/firebase/components/FirebaseEmailSignIn'
import { FirebaseSignIn } from '~/features/firebase/components/FirebaseSignIn'
import { shouldRedirectAuthenticatedUser } from '~/utils/roleBasedRedirects'
import type { RouteMetadata } from '~/utils/routeTypes'

import type { Route } from './+types/auth.signup'

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.auth.signUp',
}

export const loader = async ({
  request,
}: Route.LoaderArgs): Promise<Response | { redirectTo: string | null }> => {
  const user = await authenticateFirebaseUser(request)
  if (user) {
    // Use role-based redirect instead of always going to homepage
    const redirectTo = shouldRedirectAuthenticatedUser(user, '/auth/signup')
    if (redirectTo) {
      return redirect(redirectTo)
    }
  }

  // Get the redirect destination for Firebase sign-up
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirectTo')

  return { redirectTo }
}

// No action needed since Firebase handles signup client-side
// The Firebase callback route handles creating the user session

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

export default function SignUpPage(): JSX.Element {
  const { redirectTo } = useLoaderData<typeof loader>()
  const { t } = useTranslation()

  return (
    <div className='mx-auto max-w-md space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>{t('common.auth.signUp')}</h1>
        <p className='text-muted-foreground'>{t('auth.signUpPage.description')}</p>
      </div>

      {/* Firebase Google Sign-up */}
      <FirebaseSignIn redirectTo={redirectTo ?? '/'} />

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            {t('auth.continueWithEmail')}
          </span>
        </div>
      </div>

      {/* Firebase email/password sign-up */}
      <FirebaseEmailSignIn mode='signup' redirectTo={redirectTo ?? '/'} />

      <p className='text-muted-foreground text-center text-sm'>
        {t('auth.signUpPage.hasAccount')}{' '}
        <Link to='/auth/signin' className='text-brand hover:text-brand/80 underline'>
          {t('auth.signUpPage.signInLink')}
        </Link>
      </p>
    </div>
  )
}
