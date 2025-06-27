// Remove the OS import since we're no longer using it
// import os from 'node:os'
import React, { JSX, useEffect, useLayoutEffect, useState } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
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
import { initI18n } from './i18n/config'
import type { TournamentData } from './lib/lib.types'
import { useAuthStore, useAuthStoreHydration } from './stores/useAuthStore'
import { useTeamFormStore } from './stores/useTeamFormStore'
import { useThemeStore, useThemeStoreHydration } from './stores/useThemeStore'
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
]

export const links: LinksFunction = () => [
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
  tournaments: TournamentData[]
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const user = await getUser(request)
  // Read 'lang' cookie from request
  const cookieHeader = request.headers.get('Cookie') || ''
  const langMatch = cookieHeader.match(/lang=([^;]+)/)
  const language = langMatch ? langMatch[1] : 'nl'

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
    tournaments,
  }
}

type DocumentProps = {
  children: React.ReactNode
  language: string
}

const Document = ({ children, language }: DocumentProps) => {
  // Use useTranslation to get dynamic language updates
  const { i18n: i18nInstance } = useTranslation()

  // Get theme from store
  const { theme } = useThemeStore()

  // Handle theme store rehydration
  useThemeStoreHydration()

  // Use the current language from i18n instance, falling back to initial language
  const currentLanguage = i18nInstance.language || language

  // Use useState for reactive values that depend on language
  const [direction, setDirection] = useState(getDirection(currentLanguage))
  const [typographyClass, setTypographyClass] = useState(
    getTypographyClass(currentLanguage)
  )

  // Update direction, typography, cookie, and localStorage when language changes
  useEffect(() => {
    setDirection(getDirection(currentLanguage))
    setTypographyClass(getTypographyClass(currentLanguage))
    if (typeof window !== 'undefined' && i18nInstance.language) {
      // Write both cookie and localStorage for persistence
      document.cookie = `lang=${i18nInstance.language}; path=/; max-age=31536000`
      localStorage.setItem('lang', i18nInstance.language)
    }
  }, [currentLanguage, i18nInstance.language])

  return (
    <html
      lang={currentLanguage}
      dir={direction}
      className={cn('h-full overflow-x-hidden', theme)}
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
          'bg-background text-foreground flex h-full min-w-[320px] flex-col',
          typographyClass
        )}
      >
        {/* i18n instance will be provided by App/ErrorBoundary */}
        {children}
        <PWAElements />
        <ScrollRestoration />
        {/* Inject the SSR language for client-side hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SSR_LANGUAGE__ = ${JSON.stringify(language)};`,
          }}
        />
        <Scripts />
      </body>
    </html>
  )
}

// Auth state is now managed by the Zustand store in app/stores/authStore.ts

export default function App({ loaderData }: Route.ComponentProps): JSX.Element {
  const { authenticated, username, user, ENV, language, tournaments } = loaderData
  const { setAuth } = useAuthStore()
  const { setAvailableOptionsField } = useTeamFormStore()
  const { theme } = useThemeStore()

  // Handle auth store rehydration
  useAuthStoreHydration()

  // Update auth store only on client-side after hydration
  useEffect(() => {
    setAuth(authenticated, username)
  }, [authenticated, username, setAuth])

  // Initialize tournaments in the store
  useEffect(() => {
    setAvailableOptionsField('tournaments', tournaments)
  }, [tournaments, setAvailableOptionsField])

  // Set i18n language before paint (minimize hydration mismatch)
  useLayoutEffect(() => {
    let lang = language
    if (!lang) {
      // Try to read from cookie (client-side)
      const cookieLang =
        typeof document !== 'undefined' ? document.cookie.match(/lang=([^;]+)/) : null
      lang = cookieLang
        ? cookieLang[1]
        : (typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null) ||
          'nl'
    }
    // No-op: i18n is already initialized with the correct language
  }, [language])

  // Create i18n instance for this request/language
  const i18n = initI18n(language)

  return (
    <Document language={language}>
      <I18nextProvider i18n={i18n}>
        {/* Using "green" accent but overridden with emerald colors via CSS above */}
        <Theme
          accentColor='green'
          grayColor='gray'
          radius='medium'
          scaling='100%'
          appearance={theme}
        >
          <div className='flex h-full flex-col'>
            <div className='relative' style={{ zIndex: 50 }}>
              <AppBar authenticated={authenticated} username={username} user={user} />
            </div>
            <div
              className='flex-1 overflow-visible pb-16 md:overflow-y-auto md:pb-0'
              style={{
                background:
                  'linear-gradient(to bottom, var(--gradient-from), var(--gradient-to))',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Outlet />
            </div>
            {/* Desktop Footer - hidden on mobile */}
            <DesktopFooter />
            {/* Mobile Navigation - visible only on mobile */}
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
  const { authenticated, username } = useAuthStore()
  const { theme } = useThemeStore()

  // Handle auth store rehydration
  useAuthStoreHydration()

  // Use Dutch for error boundary fallback
  const i18n = initI18n('nl')
  return (
    <Document language='nl'>
      <I18nextProvider i18n={i18n}>
        {/* Using "green" accent but overridden with emerald colors via CSS above */}
        <Theme
          accentColor='green'
          grayColor='gray'
          radius='medium'
          scaling='100%'
          appearance={theme}
        >
          <div className='flex h-full flex-col'>
            <div className='relative' style={{ zIndex: 50 }}>
              <AppBar authenticated={authenticated} username={username} />
            </div>
            <div
              className='flex-1 overflow-visible pb-16 md:overflow-y-auto md:pb-0'
              style={{
                background:
                  'linear-gradient(to bottom, var(--gradient-from), var(--gradient-to))',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <GeneralErrorBoundary />
            </div>
            {/* Desktop Footer - hidden on mobile */}
            <DesktopFooter />
            {/* Mobile Navigation - visible only on mobile */}
            <BottomNavigation />
          </div>
        </Theme>
      </I18nextProvider>
    </Document>
  )
}
