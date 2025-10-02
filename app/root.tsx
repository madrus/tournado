// Remove the OS import since we're no longer using it
// import os from 'node:os'
import React, { JSX, useEffect, useState } from 'react'
import {
  Links,
  LinksFunction,
  Meta,
  MetaFunction,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { User } from '@prisma/client'
import '@radix-ui/themes/styles.css'

import { AppLayout } from '~/components/AppLayout'
import { GeneralErrorBoundary } from '~/components/GeneralErrorBoundary'
import { PWAElements } from '~/components/PWAElements'
import { SubtleRouteTransition } from '~/components/RouteTransition'
import { prisma } from '~/db.server'
import { initI18n, Language, SUPPORTED_LANGUAGES } from '~/i18n/config'
import type { TournamentData } from '~/lib/lib.types'
import { useAuthStore, useAuthStoreHydration } from '~/stores/useAuthStore'
import { useSettingsStore, useSettingsStoreHydration } from '~/stores/useSettingsStore'
import { useTeamFormStore } from '~/stores/useTeamFormStore'
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
  { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
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
]

type LoaderData = {
  authenticated: boolean
  ENV: Record<string, string>
  username: string
  user: User | null
  language: string
  theme: 'light' | 'dark'
  tournaments: TournamentData[]
  nonce: string
}

export async function loader({
  request,
  context,
}: Route.LoaderArgs): Promise<LoaderData> {
  // Extract nonce from context (set in entry.server.tsx)
  const nonce = (context as { nonce?: string })?.nonce || ''
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
  const supportedLanguageCodes = SUPPORTED_LANGUAGES.map(l => l.code)
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

  const tournaments: TournamentData[] = tournamentsRaw.map(t => ({
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
    nonce,
  }
}

type DocumentProps = {
  children: React.ReactNode
  language: string
  theme: 'light' | 'dark'
  nonce?: string
}

const Document = ({ children, language, theme: serverTheme, nonce }: DocumentProps) => {
  // Get current theme and language from store (reactive to changes)
  const { theme: storeTheme, language: storeLanguage } = useSettingsStore()

  // Use store values after hydration, otherwise use server values for SSR
  // This prevents flash on initial load while allowing reactive updates
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const currentTheme = isHydrated ? storeTheme : serverTheme
  // Use store language after hydration, server language during SSR
  const currentLanguage = isHydrated ? storeLanguage : language

  // Use useState for reactive values that depend on language
  const [direction, setDirection] = useState(getDirection(currentLanguage))
  const [typographyClass, setTypographyClass] = useState(
    getTypographyClass(currentLanguage)
  )

  // Update direction and typography when language changes
  useEffect(() => {
    setDirection(getDirection(currentLanguage))
    setTypographyClass(getTypographyClass(currentLanguage))
  }, [currentLanguage])

  return (
    <html
      lang={currentLanguage}
      dir={direction}
      className={cn('min-h-full overflow-x-hidden', currentTheme)}
    >
      <head>
        <Meta />
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1,viewport-fit=cover'
        />
        <Links />
      </head>
      <body
        className={cn(
          'bg-background text-foreground flex min-h-full min-w-[320px] flex-col',
          typographyClass
        )}
      >
        {/* i18n instance will be provided by App/ErrorBoundary */}
        {children}
        <PWAElements />
        <ScrollRestoration />
        {/* Inject the SSR language and theme for client-side hydration */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.__SSR_LANGUAGE__ = ${JSON.stringify(language)}; window.__SSR_THEME__ = ${JSON.stringify(serverTheme)};`,
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
    nonce,
  } = loaderData

  // Handle store rehydration FIRST, before accessing store values
  useAuthStoreHydration()
  useSettingsStoreHydration()

  const { setUser, setFirebaseUser } = useAuthStore()
  const { setAvailableOptionsField } = useTeamFormStore()
  const {
    setTheme,
    setLanguage,
    theme: currentTheme,
    language: storeLanguage,
  } = useSettingsStore()

  // Get current language from store (this makes store the source of truth)
  const [isHydrated, setIsHydrated] = useState(false)
  const currentLanguage = isHydrated ? storeLanguage : serverLanguage

  // Create i18n instance - use store language after hydration, server language for SSR
  const [i18n, setI18n] = useState(() => initI18n(serverLanguage))

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

  // Initialize theme store with server-side values
  useEffect(() => {
    setTheme(serverTheme)
    setLanguage(serverLanguage as 'nl' | 'en' | 'de' | 'fr' | 'ar' | 'tr')
  }, [serverTheme, serverLanguage, setTheme, setLanguage])

  // Initialize tournaments in the store
  useEffect(() => {
    setAvailableOptionsField('tournaments', tournaments)
  }, [tournaments, setAvailableOptionsField])

  // Update i18n when store language changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      const newI18n = initI18n(currentLanguage)
      setI18n(newI18n)
    }
  }, [currentLanguage, isHydrated])

  return (
    <Document language={serverLanguage} theme={serverTheme} nonce={nonce}>
      <AppLayout
        authenticated={authenticated}
        username={username}
        user={user}
        theme={currentTheme}
        i18n={i18n}
        env={ENV}
        nonce={nonce}
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

  // Note: nonce is not available in error boundaries since they don't have access to loader data
  // Error boundaries will not have inline scripts that require nonces

  return (
    <Document language='nl' theme={theme}>
      <AppLayout
        authenticated={authenticated}
        username={username}
        theme={theme}
        i18n={i18n}
        contentClassName={cn('pt-8 md:pb-4', CONTENT_CONTAINER_CLASSES)}
      >
        <GeneralErrorBoundary />
      </AppLayout>
    </Document>
  )
}
