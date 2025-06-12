// Remove the OS import since we're no longer using it
// import os from 'node:os'
import React, { JSX, useEffect } from 'react'
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

import { AppBar } from '~/components/AppBar'
import DesktopFooter from '~/components/desktopFooter/DesktopFooter'

import type { Route } from './+types/root'
import { GeneralErrorBoundary } from './components/GeneralErrorBoundary'
import BottomNavigation from './components/mobileNavigation/BottomNavigation'
import { PWAElements } from './components/PWAElements'
import { i18n } from './i18n'
import { useAuthStore } from './stores/useAuthStore'
import layoutStylesheetUrl from './styles/layout.css?url'
import safeAreasStylesheetUrl from './styles/safe-areas.css?url'
import tailwindStylesheetUrl from './styles/tailwind.css?url'
import { getEnv } from './utils/env.server'
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
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const user = await getUser(request)

  return {
    authenticated: !!user,
    username: user?.email ?? '',
    user,
    ENV: getEnv(),
  }
}

const Document = ({ children }: { children: React.ReactNode }) => (
  <html lang={i18n.language} className='h-full overflow-x-hidden'>
    <head>
      <Meta />
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width,initial-scale=1' />
      <Links />
    </head>
    <body className='bg-background text-foreground flex h-full flex-col'>
      <I18nextProvider i18n={i18n}>
        {children}
        <PWAElements />
      </I18nextProvider>
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
)

// Auth state is now managed by the Zustand store in app/stores/authStore.ts

export default function App({ loaderData }: Route.ComponentProps): JSX.Element {
  const { authenticated, username, user, ENV } = loaderData
  const { setAuth } = useAuthStore()

  // Update auth store only on client-side after hydration
  useEffect(() => {
    setAuth(authenticated, username)
  }, [authenticated, username])

  return (
    <Document>
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
    </Document>
  )
}

export function ErrorBoundary(): JSX.Element {
  const { authenticated, username } = useAuthStore()

  return (
    <Document>
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
