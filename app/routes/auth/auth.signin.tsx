import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, type MetaFunction, redirect, useLoaderData } from 'react-router'

import { InfoBanner } from '~/components/InfoBanner'
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

// Valid error types that can be passed via query parameter
// These correspond to error redirects in auth.callback.tsx
const VALID_AUTH_ERRORS = [
	'account-deactivated',
	'missing-token',
	'invalid-token',
	'auth-failed',
] as const

type AuthError = (typeof VALID_AUTH_ERRORS)[number]

// Route metadata
export const handle: RouteMetadata = {
	isPublic: true,
	title: 'common.auth.signIn',
}

export const loader = async ({
	request,
}: Route.LoaderArgs): Promise<
	Response | { redirectTo: string | undefined; error: AuthError | null }
> => {
	const user = await getUser(request)
	if (user) {
		// Use role-based redirect instead of always going to admin panel
		const redirectTo = shouldRedirectAuthenticatedUser(user, '/auth/signin')
		if (redirectTo) {
			return redirect(redirectTo)
		}
	}

	// Get the redirect destination and error parameter for Firebase sign-in
	const url = new URL(request.url)
	const redirectTo = url.searchParams.get('redirectTo') ?? undefined
	const error = url.searchParams.get('error')

	// Validate error parameter against whitelist for defense-in-depth
	const validError: AuthError | null =
		error && VALID_AUTH_ERRORS.includes(error as AuthError)
			? (error as AuthError)
			: null

	return { redirectTo, error: validError }
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
	const { redirectTo, error } = useLoaderData<typeof loader>()
	const { t } = useTranslation()

	return (
		<div className={authContainerVariants()}>
			<h2 className={authHeadingVariants()}>{t('auth.signInPage.description')}</h2>

			{/* Display error message for deactivated accounts */}
			{error === 'account-deactivated' ? (
				<InfoBanner variant='error'>
					{t('auth.errors.accountDeactivatedMessage')}
				</InfoBanner>
			) : null}

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
			<FirebaseEmailSignIn mode='signin' redirectTo={redirectTo} />

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
