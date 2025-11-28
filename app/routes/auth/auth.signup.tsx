import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, type MetaFunction, redirect, useLoaderData } from 'react-router'

import {
	FirebaseEmailSignIn,
	FirebaseSignIn,
} from '~/features/firebase/components/FirebaseAuth'
import { shouldRedirectAuthenticatedUser } from '~/utils/roleBasedRedirects'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getUser } from '~/utils/session.server'

import type { Route } from './+types/auth.signup'
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
	title: 'common.auth.signUp',
}

export const loader = async ({
	request,
}: Route.LoaderArgs): Promise<Response | { redirectTo: string | null }> => {
	const user = await getUser(request)
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
		<div className={authContainerVariants()}>
			<h2 className={authHeadingVariants()}>{t('auth.signUpPage.description')}</h2>

			{/* Firebase Google Sign-up */}
			<FirebaseSignIn redirectTo={redirectTo ?? '/'} />

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

			{/* Firebase email/password sign-up */}
			<FirebaseEmailSignIn mode='signup' redirectTo={redirectTo ?? '/'} />

			<p className={authFooterTextVariants()}>
				<span className={authTextSpacingVariants()}>
					{t('auth.signUpPage.hasAccount')}
				</span>
				<Link to='/auth/signin' className={authLinkVariants()}>
					{t('auth.signUpPage.signInLink')}
				</Link>
			</p>
		</div>
	)
}
