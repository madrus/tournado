// Remove the OS import since we're no longer using it
// import os from 'node:os'
import type { User } from '@prisma/client'
import '@radix-ui/themes/styles.css'
import type React from 'react'
import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import {
	Links,
	type LinksFunction,
	Meta,
	type MetaFunction,
	Scripts,
	ScrollRestoration,
	useLocation,
	useRouteLoaderData,
} from 'react-router'
import { AppLayout } from '~/components/AppLayout'
import { GeneralErrorBoundary } from '~/components/GeneralErrorBoundary'
import { PWAElements } from '~/components/PWAElements'
import { SubtleRouteTransition } from '~/components/RouteTransition'
import { prisma } from '~/db.server'
import { useGroupAssignmentActions } from '~/features/competition/stores/useGroupAssignmentStore'
import {
	useTeamFormActions,
	useTeamFormStore,
} from '~/features/teams/stores/useTeamFormStore'
import { useTournamentFormActions } from '~/features/tournaments/stores/useTournamentFormStore'
import type { TournamentData } from '~/features/tournaments/types'
import { transformTournamentData } from '~/features/tournaments/utils'
import { useRouteCleanup } from '~/hooks/useRouteCleanup'
import { type Language, SUPPORTED_LANGUAGES, initI18n } from '~/i18n/config'
import {
	useAuthActions,
	useAuthStoreHydration,
	useAuthUser,
} from '~/stores/useAuthStore'
import {
	useSettingsActions,
	useSettingsLanguage,
	useSettingsStoreHydration,
	useSettingsTheme,
} from '~/stores/useSettingsStore'
import { CONTENT_CONTAINER_CLASSES } from '~/styles/constants'
import layoutStylesheetUrl from '~/styles/layout.css?url'
import '~/styles/radix-overrides.css'
import safeAreasStylesheetUrl from '~/styles/safe-areas.css?url'
import tailwindStylesheetUrl from '~/styles/tailwind.css?url'
import { getEnv } from '~/utils/env.server'
import { cn } from '~/utils/misc'
import { getDirection, getTypographyClass } from '~/utils/rtlUtils'
import { getUser } from '~/utils/session.server'
import type { Route } from './+types/root'

export const meta: MetaFunction = () => [
	{ title: 'Tournado' },
	{ name: 'description', content: `Tournament management for everyone` },
	{ name: 'apple-mobile-web-app-capable', content: 'yes' },
	{
		name: 'apple-mobile-web-app-status-bar-style',
		content: 'black-translucent',
	},
	{ name: 'mobile-web-app-capable', content: 'yes' },
]

export const links: LinksFunction = () => [
	{ rel: 'manifest', href: '/manifest.json' },
	{ rel: 'stylesheet', href: tailwindStylesheetUrl },
	{ rel: 'stylesheet', href: layoutStylesheetUrl },
	{ rel: 'stylesheet', href: safeAreasStylesheetUrl },
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous' as const,
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap',
	},
	// Preload Amiri font for Arabic to prevent FOUC
	{
		rel: 'preload',
		href: 'https://fonts.gstatic.com/s/amiri/v29/J7aRnpd8CGxBHqUpvrIw74NL.woff2',
		as: 'font',
		type: 'font/woff2',
		crossOrigin: 'anonymous' as const,
	},
]

type LoaderData = {
	authenticated: boolean
	ENV: Record<string, string>
	username: string
	user: User | null
	language: Language
	theme: 'light' | 'dark'
	tournaments: TournamentData[]
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	const user = await getUser(request)
	// Read 'lang' and 'theme' cookies from request
	const cookieHeader = request.headers.get('Cookie') || ''
	const langMatch = cookieHeader.match(/lang=([^;]+)/)
	const themeMatch = cookieHeader.match(/theme=([^;]+)/)

	// Validate theme
	const rawTheme = themeMatch ? themeMatch[1] : undefined
	const theme = rawTheme === 'dark' || rawTheme === 'light' ? rawTheme : 'light'

	// Validate language
	const rawLanguage = langMatch ? langMatch[1] : undefined
	const supportedLanguageCodes = SUPPORTED_LANGUAGES.map((l) => l.code)
	const language = supportedLanguageCodes.includes(rawLanguage as Language)
		? (rawLanguage as Language)
		: 'nl'

	// Fetch tournaments and transform to TournamentData format
	const tournamentsRaw = await prisma.tournament.findMany({
		select: {
			id: true,
			name: true,
			location: true,
			startDate: true,
			endDate: true,
			divisions: true,
			categories: true,
		},
		orderBy: { startDate: 'asc' },
	})

	const tournaments: TournamentData[] = tournamentsRaw.map(transformTournamentData)

	return {
		authenticated: !!user,
		username: user?.email ?? '',
		user,
		ENV: getEnv(),
		language,
		theme,
		tournaments,
	}
}

type DocumentProps = {
	children: React.ReactNode
	language: Language
	theme: 'light' | 'dark'
}

const Document = ({ children, language, theme }: DocumentProps) => {
	// Don't run on initial mount - inline script already set dir, arabic-text, and dark class correctly
	const isFirstRender = useRef(true)

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}

		const direction = getDirection(language)
		const typographyClass = getTypographyClass(language)

		document.documentElement.setAttribute('dir', direction)

		if (typographyClass) {
			document.documentElement.classList.add(typographyClass)
		} else {
			document.documentElement.classList.remove('arabic-text')
		}

		// Update theme class
		if (theme === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [language, theme])

	return (
		<html
			lang={language}
			dir={getDirection(language)}
			className={cn(
				'min-h-full overflow-x-hidden',
				getTypographyClass(language),
				theme,
			)}
		>
			<head>
				<Meta />
				<meta charSet='utf-8' />
				<meta
					name='viewport'
					content='width=device-width,initial-scale=1,viewport-fit=cover'
				/>
				{/* Inline script to prevent FOUC - runs before any rendering */}
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Critical for preventing FOUC
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								// IMPORTANT: Only use cookie, not sessionStorage/localStorage
								// This ensures SSR and client-side render use the same source
								const cookieLang = document.cookie.match(/lang=([^;]+)/)?.[1];
								const lang = cookieLang || 'nl';
								const cookieTheme = document.cookie.match(/theme=([^;]+)/)?.[1];
								const theme = cookieTheme || 'light';

								// Set direction immediately on html element
								const dir = lang === 'ar' ? 'rtl' : 'ltr';
								document.documentElement.setAttribute('dir', dir);

								// Set typography class immediately on html element
								const typographyClass = lang === 'ar' ? 'arabic-text' : '';
								if (typographyClass) {
									document.documentElement.classList.add(typographyClass);
								} else {
									// Remove arabic-text if switching from Arabic to another language
									document.documentElement.classList.remove('arabic-text');
								}

								// Set theme class immediately on html element
								if (theme === 'dark') {
									document.documentElement.classList.add('dark');
								} else {
									document.documentElement.classList.remove('dark');
								}
							})();
						`,
					}}
				/>
				<Links />
			</head>
			<body className='flex min-h-full min-w-[320px] flex-col bg-background text-foreground'>
				{/* i18n instance will be provided by App/ErrorBoundary */}
				{children}
				<PWAElements />
				<ScrollRestoration />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Inject the SSR language and theme for client-side hydration
					dangerouslySetInnerHTML={{
						__html: `window.__SSR_LANGUAGE__ = ${JSON.stringify(language)}; window.__SSR_THEME__ = ${JSON.stringify(theme)};`,
					}}
				/>
				<Scripts />
			</body>
		</html>
	)
}

// Auth state is now managed by the Zustand store in app/stores/authStore.ts

export default function App({ loaderData }: Route.ComponentProps): JSX.Element {
	const {
		authenticated,
		username,
		user,
		ENV,
		language: serverLanguage,
		theme: serverTheme,
		tournaments,
	} = loaderData

	// Handle store rehydration
	useAuthStoreHydration()
	useSettingsStoreHydration()

	const { setUser, setFirebaseUser } = useAuthActions()
	const { setTheme, setLanguage } = useSettingsActions()
	const { setAvailableOptionsField } = useTeamFormStore()
	const { clearStore: clearGroupAssignmentStore } = useGroupAssignmentActions()
	const { resetForm: resetTeamForm } = useTeamFormActions()
	const { resetForm: resetTournamentForm } = useTournamentFormActions()
	const location = useLocation()
	const handleClearGroupAssignment = useCallback(
		() => clearGroupAssignmentStore(),
		[clearGroupAssignmentStore],
	)
	const handleResetTeamForm = useCallback(() => resetTeamForm(), [resetTeamForm])
	const handleResetTournamentForm = useCallback(
		() => resetTournamentForm(),
		[resetTournamentForm],
	)

	// Initialize store from server values BEFORE first render
	// This runs synchronously before the component returns JSX
	const [_initialized] = useState(() => {
		setTheme(serverTheme)
		setLanguage(serverLanguage)
		return true
	})

	// Get store values (already initialized with server values above)
	const currentTheme = useSettingsTheme()
	const currentLanguage = useSettingsLanguage()

	// Create i18n instance
	const [i18n, _setI18n] = useState(() => initI18n(serverLanguage))

	// Add:
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	// Update auth store only on client-side after hydration
	useEffect(() => {
		if (user) {
			setUser(user)
			// We don't have Firebase user data in the loader, so we set it to null
			setFirebaseUser(null)
		} else {
			setUser(null)
			setFirebaseUser(null)
		}
	}, [user, setUser, setFirebaseUser])

	// Initialize tournaments in the store
	useEffect(() => {
		setAvailableOptionsField('tournaments', tournaments)
	}, [tournaments, setAvailableOptionsField])

	useRouteCleanup({
		currentPath: location.pathname,
		isActiveRoute: (pathname) =>
			/\/competition\/groups\/[^/]+$/.test(pathname.replace(/\/$/, '')),
		onLeave: handleClearGroupAssignment,
	})

	useRouteCleanup({
		currentPath: location.pathname,
		isActiveRoute: (pathname) =>
			/\/teams\/(new|[^/]+)$/.test(pathname.replace(/\/$/, '')),
		onLeave: handleResetTeamForm,
	})

	useRouteCleanup({
		currentPath: location.pathname,
		isActiveRoute: (pathname) =>
			/\/tournaments\/(new|[^/]+)$/.test(pathname.replace(/\/$/, '')),
		onLeave: handleResetTournamentForm,
	})

	// Update i18n when language changes
	useEffect(() => {
		i18n.changeLanguage(currentLanguage)
	}, [currentLanguage, i18n])

	// Compute effective values
	const effectiveLanguage = isHydrated ? currentLanguage : serverLanguage
	const effectiveTheme = isHydrated ? currentTheme : serverTheme

	return (
		<Document language={effectiveLanguage} theme={effectiveTheme}>
			<AppLayout
				authenticated={authenticated}
				username={username}
				user={user}
				theme={effectiveTheme}
				language={effectiveLanguage}
				i18n={i18n}
				env={ENV}
			>
				<SubtleRouteTransition duration={500} />
			</AppLayout>
		</Document>
	)
}

export function ErrorBoundary(): JSX.Element {
	// Handle store rehydration FIRST, before accessing store values
	useAuthStoreHydration()
	useSettingsStoreHydration()

	const rootData = useRouteLoaderData<LoaderData>('root')
	const user = useAuthUser()
	const authenticated = !!user
	const username = user?.email ?? ''
	const theme = useSettingsTheme()
	const env = rootData?.ENV ?? (typeof window !== 'undefined' ? window.ENV : undefined)

	// Use Dutch for error boundary fallback
	const i18n = initI18n('nl')

	return (
		<Document language='nl' theme={theme}>
			<AppLayout
				authenticated={authenticated}
				username={username}
				theme={theme}
				i18n={i18n}
				language='nl'
				env={env}
				contentClassName={cn('pt-8 md:pb-4', CONTENT_CONTAINER_CLASSES)}
			>
				<GeneralErrorBoundary />
			</AppLayout>
		</Document>
	)
}
