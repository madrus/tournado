import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, type MetaFunction, redirect, useLoaderData } from 'react-router'

import {
  FirebaseEmailSignIn,
  FirebaseSignIn,
} from '~/features/firebase/components/FirebaseAuth'
import { shouldRedirectAuthenticatedUser } from '~/utils/roleBasedRedirects'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getUser } from '~/utils/session.server'

import type { Route } from './+types/auth.signin'
import {
  authContainerVariants,
  authDividerContainerVariants,
  authDividerLineContainerVariants,
  authDividerLineVariants,
  authDividerTextContainerVariants,
  authDividerTextVariants,
  authFooterTextVariants,
  authHeadingVariants,
  authLinkVariants,
  authTextSpacingVariants,
} from './auth.variants'

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.auth.signIn',
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
  const redirectTo = url.searchParams.get('redirectTo')

  return { redirectTo }
}

// No action needed since Firebase handles authentication client-side
// The Firebase callback route handles creating the user session

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
  const { redirectTo } = useLoaderData<typeof loader>()
  const { t } = useTranslation()

  return (
    <div className={authContainerVariants()}>
      <h2 className={authHeadingVariants()}>{t('auth.signInPage.description')}</h2>

      {/* Firebase Google Sign-in */}
      <FirebaseSignIn redirectTo={redirectTo} />

      <div className={authDividerContainerVariants()}>
        <div className={authDividerLineContainerVariants()}>
          <span className={authDividerLineVariants()} />
        </div>
        <div className={authDividerTextContainerVariants()}>
          <span className={authDividerTextVariants()}>
            {t('auth.continueWithEmail')}
          </span>
        </div>
      </div>

      {/* Firebase email/password sign-in */}
      <FirebaseEmailSignIn mode='signin' redirectTo={redirectTo ?? undefined} />

      <p className={authFooterTextVariants()}>
        <span className={authTextSpacingVariants()}>
          {t('auth.signInPage.noAccount')}
        </span>
        <Link to='/auth/signup' className={authLinkVariants()}>
          {t('auth.signInPage.signUpLink')}
        </Link>
      </p>
    </div>
  )
}
