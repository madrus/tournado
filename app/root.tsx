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

import { AppBar } from '~/components/AppBar'
import DesktopFooter from '~/components/desktopFooter/DesktopFooter'

import type { Route } from './+types/root'
import { GeneralErrorBoundary } from './components/GeneralErrorBoundary'
import BottomNavigation from './components/mobileNavigation/BottomNavigation'
import { PWAElements } from './components/PWAElements'
import { initI18n } from './i18n/config'
import { useAuthStore } from './stores/useAuthStore'
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

export const links: LinksFunction = (): { rel: string; href: string }[] => [
  { rel: 'stylesheet', href: tailwindStylesheetUrl },
  { rel: 'stylesheet', href: layoutStylesheetUrl },
  { rel: 'stylesheet', href: safeAreasStylesheetUrl },
]

type LoaderData = {
  authenticated: boolean
  ENV: Record<string, string>
  username: string
  user: User | null
  language: string
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const user = await getUser(request)
  // Read 'lang' cookie from request
  const cookieHeader = request.headers.get('Cookie') || ''
  const langMatch = cookieHeader.match(/lang=([^;]+)/)
  const language = langMatch ? langMatch[1] : 'nl'

  return {
    authenticated: !!user,
    username: user?.email ?? '',
    user,
    ENV: getEnv(),
    language,
  }
}

type DocumentProps = {
  children: React.ReactNode
  language: string
}

const Document = ({ children, language }: DocumentProps) => {
  // Use useTranslation to get dynamic language updates
  const { i18n: i18nInstance } = useTranslation()

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
    <html lang={currentLanguage} dir={direction} className='h-full overflow-x-hidden'>
      <head>
        <Meta />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Links />
      </head>
      <body
        className={cn(
          'bg-background text-foreground flex h-full flex-col',
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
  const { authenticated, username, user, ENV, language } = loaderData
  const { setAuth } = useAuthStore()

  // Update auth store only on client-side after hydration
  useEffect(() => {
    setAuth(authenticated, username)
  }, [authenticated, username])

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
        <div className='flex h-full flex-col'>
          <div className='relative' style={{ zIndex: 50 }}>
            <AppBar authenticated={authenticated} username={username} user={user} />
          </div>
          <div
            className='flex-1 overflow-y-auto bg-gradient-to-b from-emerald-50 to-white pb-16 md:pb-0'
            style={{ position: 'relative', zIndex: 1 }}
          >
            <Outlet />
          </div>
          {/* Desktop Footer - hidden on mobile */}
          <DesktopFooter />
          {/* Mobile Navigation - visible only on mobile */}
          <BottomNavigation />
        </div>
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

  // Use Dutch for error boundary fallback
  const i18n = initI18n('nl')
  return (
    <Document language='nl'>
      <I18nextProvider i18n={i18n}>
        <div className='flex h-full flex-col'>
          <div className='relative' style={{ zIndex: 50 }}>
            <AppBar authenticated={authenticated} username={username} />
          </div>
          <div
            className='flex-1 overflow-y-auto bg-gradient-to-b from-emerald-50 to-white pb-16 md:pb-0'
            style={{ position: 'relative', zIndex: 1 }}
          >
            <GeneralErrorBoundary />
          </div>
          {/* Desktop Footer - hidden on mobile */}
          <DesktopFooter />
          {/* Mobile Navigation - visible only on mobile */}
          <BottomNavigation />
        </div>
      </I18nextProvider>
    </Document>
  )
}
