// Remove the OS import since we're no longer using it
// import os from 'node:os'

import type { User } from '@prisma/client'
import type React from 'react'
import { type JSX, useEffect, useState } from 'react'
import {
	Links,
	type LinksFunction,
	Meta,
	type MetaFunction,
	Scripts,
	ScrollRestoration,
} from 'react-router'
import '@radix-ui/themes/styles.css'

import { AppLayout } from '~/components/AppLayout'
import { GeneralErrorBoundary } from '~/components/GeneralErrorBoundary'
import { PWAElements } from '~/components/PWAElements'
import { SubtleRouteTransition } from '~/components/RouteTransition'
import { prisma } from '~/db.server'
import { useTeamFormStore } from '~/features/teams/stores/useTeamFormStore'
import type { TournamentData } from '~/features/tournaments/types'
import { initI18n, type Language, SUPPORTED_LANGUAGES } from '~/i18n/config'
import { useAuthStore, useAuthStoreHydration } from '~/stores/useAuthStore'
import { useSettingsStore, useSettingsStoreHydration } from '~/stores/useSettingsStore'
import { CONTENT_CONTAINER_CLASSES } from '~/styles/constants'
import layoutStylesheetUrl from '~/styles/layout.css?url'
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

	const tournaments: TournamentData[] = tournamentsRaw.map((t) => ({
		...t,
		startDate: t.startDate.toISOString(),
		endDate: t.endDate?.toISOString() || null,
		divisions: Array.isArray(t.divisions)
			? (t.divisions as string[])
			: t.divisions
				? JSON.parse(t.divisions as string)
				: [],
		categories: Array.isArray(t.categories)
			? (t.categories as string[])
			: t.categories
				? JSON.parse(t.categories as string)
				: [],
	}))

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
	// Update direction and typography when language changes
	useEffect(() => {
		const direction = getDirection(language)
		const typographyClass = getTypographyClass(language)

		document.documentElement.setAttribute('dir', direction)

		if (typographyClass) {
			document.documentElement.classList.add(typographyClass)
		} else {
			document.documentElement.classList.remove('arabic-text')
		}
	}, [language])

	return (
		<html lang={language} className={cn('min-h-full overflow-x-hidden', theme)}>
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
								// IMPORTANT: Only use cookie, not localStorage
								// This ensures SSR and client-side render use the same source
								const cookieLang = document.cookie.match(/lang=([^;]+)/)?.[1];
								const lang = cookieLang || 'nl';

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

	// Handle store rehydration FIRST, before accessing store values
	useAuthStoreHydration()
	useSettingsStoreHydration()

	// Read localStorage synchronously to get initial values BEFORE any render
	const [initialTheme] = useState(() => {
		if (typeof window === 'undefined') return serverTheme
		try {
			const stored = localStorage.getItem('UIPreferencesStore')
			if (stored) {
				const parsed = JSON.parse(stored)
				return parsed.state?.theme || serverTheme
			}
		} catch (_e) {
			// Ignore parse errors
		}
		return serverTheme
	})

	const [initialLanguage] = useState(() => {
		if (typeof window === 'undefined') return serverLanguage
		try {
			const stored = localStorage.getItem('UIPreferencesStore')
			if (stored) {
				const parsed = JSON.parse(stored)
				return parsed.state?.language || serverLanguage
			}
		} catch (_e) {
			// Ignore parse errors
		}
		return serverLanguage
	})

	const { setUser, setFirebaseUser } = useAuthStore()
	const { setAvailableOptionsField } = useTeamFormStore()

	// Subscribe to store for reactive updates
	const storeTheme = useSettingsStore((state) => state.theme)
	const storeLanguage = useSettingsStore((state) => state.language)

	// Use initial values from localStorage for first render, then use store values
	const [hasRendered, setHasRendered] = useState(false)

	useEffect(() => {
		setHasRendered(true)
	}, [])

	const currentTheme = hasRendered ? storeTheme : initialTheme
	const currentLanguage = hasRendered ? storeLanguage : initialLanguage

	// Create i18n instance with correct initial language
	const [i18n, setI18n] = useState(() => initI18n(initialLanguage))

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

	// Update i18n when language changes
	useEffect(() => {
		const newI18n = initI18n(currentLanguage)
		setI18n(newI18n)
	}, [currentLanguage])

	return (
		<Document language={currentLanguage} theme={currentTheme}>
			<AppLayout
				authenticated={authenticated}
				username={username}
				user={user}
				theme={currentTheme}
				language={currentLanguage}
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

	const { user } = useAuthStore()
	const authenticated = !!user
	const username = user?.email ?? ''
	const { theme } = useSettingsStore()

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
				contentClassName={cn('pt-8 md:pb-4', CONTENT_CONTAINER_CLASSES)}
			>
				<GeneralErrorBoundary />
			</AppLayout>
		</Document>
	)
}
