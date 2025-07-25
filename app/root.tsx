// Remove the OS import since we're no longer using it
// import os from 'node:os'
import React, { JSX, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import {
  Links,
  LinksFunction,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { User } from '@prisma/client'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

import { AppBar } from '~/components/AppBar'
import DesktopFooter from '~/components/desktopFooter/DesktopFooter'

import type { Route } from './+types/root'
import { GeneralErrorBoundary } from './components/GeneralErrorBoundary'
import BottomNavigation from './components/mobileNavigation/BottomNavigation'
import { PWAElements } from './components/PWAElements'
import { prisma } from './db.server'
import { initI18n, Language, SUPPORTED_LANGUAGES } from './i18n/config'
import type { TournamentData } from './lib/lib.types'
import { useAuthStore, useAuthStoreHydration } from './stores/useAuthStore'
import { useSettingsStore, useSettingsStoreHydration } from './stores/useSettingsStore'
import { useTeamFormStore } from './stores/useTeamFormStore'
import layoutStylesheetUrl from './styles/layout.css?url'
import safeAreasStylesheetUrl from './styles/safe-areas.css?url'
import tailwindStylesheetUrl from './styles/tailwind.css?url'
import { getEnv } from './utils/env.server'
import { cn } from './utils/misc'
import { getDirection, getTypographyClass } from './utils/rtlUtils'
import { getUser } from './utils/session.server'

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
  }
}

type DocumentProps = {
  children: React.ReactNode
  language: string
  theme: 'light' | 'dark'
}

const Document = ({ children, language, theme: serverTheme }: DocumentProps) => {
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
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Links />
        {/* Custom CSS to override Radix green colors with emerald brand colors */}
        <style>{`
          .radix-themes {
            /* Override green accent colors with emerald equivalents */
            --green-1: #ecfdf5;
            --green-2: #d1fae5;
            --green-3: #a7f3d0;
            --green-4: #6ee7b7;
            --green-5: #34d399;
            --green-6: #10b981;
            --green-7: #059669;
            --green-8: #047857;
            --green-9: #065f46;
            --green-10: #064e3b;
            --green-11: #022c22;
            --green-12: #041e17;

            /* Override green alpha colors */
            --green-a1: rgba(16, 185, 129, 0.05);
            --green-a2: rgba(16, 185, 129, 0.1);
            --green-a3: rgba(16, 185, 129, 0.15);
            --green-a4: rgba(16, 185, 129, 0.2);
            --green-a5: rgba(16, 185, 129, 0.3);
            --green-a6: rgba(16, 185, 129, 0.4);
            --green-a7: rgba(16, 185, 129, 0.5);
            --green-a8: rgba(16, 185, 129, 0.6);
            --green-a9: rgba(16, 185, 129, 0.7);
            --green-a10: rgba(16, 185, 129, 0.8);
            --green-a11: rgba(16, 185, 129, 0.9);
            --green-a12: rgba(16, 185, 129, 0.95);
          }

          /* Mobile select dropdown fix - ensure native dropdown has enough space */
          @media (max-width: 1023px) {
            body {
              min-height: 100vh;
              min-height: 100dvh; /* Dynamic viewport height for mobile */
            }

            /* Ensure select dropdowns aren't clipped by containers */
            select {
              position: static !important;
            }
          }

        `}</style>
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
  } = loaderData

  // Handle store rehydration FIRST, before accessing store values
  useAuthStoreHydration()
  useSettingsStoreHydration()

  const { setAuth } = useAuthStore()
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
    setAuth(authenticated, username)
  }, [authenticated, username, setAuth])

  // Initialize theme store with server-side values
  useEffect(() => {
    setTheme(serverTheme)
    setLanguage(serverLanguage as 'nl' | 'en' | 'fr' | 'ar' | 'tr')
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
    <Document language={serverLanguage} theme={serverTheme}>
      <I18nextProvider i18n={i18n}>
        {/* Using "green" accent but overridden with emerald colors via CSS above */}
        <Theme
          accentColor='green'
          grayColor='slate'
          radius='medium'
          scaling='100%'
          appearance={currentTheme}
        >
          <div
            className='flex min-h-full flex-col'
            style={{ paddingTop: 'var(--header-padding, 62px)' }}
          >
            <div className='relative' style={{ zIndex: 50 }}>
              <AppBar authenticated={authenticated} username={username} user={user} />
            </div>
            <div
              className='flex-1 overflow-visible pb-16 md:pb-0'
              style={{
                background:
                  'linear-gradient(to bottom, var(--gradient-from), var(--gradient-to))',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div className='flex min-h-full flex-col'>
                <div className='flex-1'>
                  <Outlet />
                </div>
                {/* Desktop Footer - positioned at bottom of content */}
                <DesktopFooter />
              </div>
            </div>
            {/* Mobile Navigation - fixed at bottom of viewport */}
            <BottomNavigation />
          </div>
        </Theme>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
      </I18nextProvider>
    </Document>
  )
}

export function ErrorBoundary(): JSX.Element {
  // Handle store rehydration FIRST, before accessing store values
  useAuthStoreHydration()
  useSettingsStoreHydration()

  const { authenticated, username } = useAuthStore()
  const { theme } = useSettingsStore()

  // Use Dutch for error boundary fallback
  const i18n = initI18n('nl')
  return (
    <Document language='nl' theme={theme}>
      <I18nextProvider i18n={i18n}>
        {/* Using "green" accent but overridden with emerald colors via CSS above */}
        <Theme
          accentColor='green'
          grayColor='slate'
          radius='medium'
          scaling='100%'
          appearance={theme}
        >
          <div
            className='flex min-h-full flex-col'
            style={{ paddingTop: 'var(--header-padding, 62px)' }}
          >
            <div className='relative' style={{ zIndex: 50 }}>
              <AppBar authenticated={authenticated} username={username} />
            </div>
            <div
              className='flex-1 overflow-visible pb-16 md:pb-0'
              style={{
                background:
                  'linear-gradient(to bottom, var(--gradient-from), var(--gradient-to))',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div className='flex min-h-full flex-col'>
                <div className='flex-1'>
                  <GeneralErrorBoundary />
                </div>
                {/* Desktop Footer - positioned at bottom of content */}
                <DesktopFooter />
              </div>
            </div>
            {/* Mobile Navigation - fixed at bottom of viewport */}
            <BottomNavigation />
          </div>
        </Theme>
      </I18nextProvider>
    </Document>
  )
}
