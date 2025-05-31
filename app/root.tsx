// Remove the OS import since we're no longer using it
// import os from 'node:os'
import React, { JSX } from 'react'
import { I18nextProvider } from 'react-i18next'
import {
  Link,
  Links,
  LinksFunction,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import { AppBar } from '~/components/AppBar'

import type { Route } from './+types/root'
import { GeneralErrorBoundary } from './components/GeneralErrorBoundary'
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

interface LoaderData {
  authenticated: boolean
  ENV: Record<string, string>
  username: string
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const user = await getUser(request)

  return {
    authenticated: !!user,
    username: user?.email ?? '',
    ENV: getEnv(),
  }
}

const Document = ({ children }: { children: React.ReactNode }) => (
  <html lang={i18n.language} className='h-full overflow-x-hidden'>
    <head>
      <Meta />
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width,initial-scale=1' />
      <link
        rel='preload'
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap'
        as='style'
      />
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap'
      />
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
  const { authenticated, username, ENV } = loaderData

  // Update auth store whenever App renders with new data
  useAuthStore.getState().setAuth(authenticated, username)

  return (
    <Document>
      <div className='flex h-full flex-col'>
        <div className='relative' style={{ zIndex: 50 }}>
          <AppBar authenticated={authenticated} username={username} />
        </div>
        <div
          className='flex-1 overflow-hidden'
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Outlet />
        </div>
        <div className='container mx-auto flex justify-between p-2'>
          <Link to='/'>
            <div className='font-light'>Tournado</div>
          </Link>
          <p>Built with ♥️ by Madrus</p>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(ENV)}`,
        }}
      />
    </Document>
  )
}

export const ErrorBoundary = (): JSX.Element => (
  <Document>
    <I18nextProvider i18n={i18n}>
      <div className='flex h-full flex-col'>
        <div className='relative' style={{ zIndex: 50 }}>
          <AppBar
            authenticated={useAuthStore.getState().authenticated}
            username={useAuthStore.getState().username}
          />
        </div>
        <div
          className='flex-1 overflow-hidden'
          style={{ position: 'relative', zIndex: 1 }}
        >
          <GeneralErrorBoundary />
        </div>
        <div className='container mx-auto flex justify-between p-2'>
          <Link to='/'>
            <div className='font-light'>Tournado</div>
          </Link>
          <p>Built with ♥️ by Madrus</p>
        </div>
      </div>
    </I18nextProvider>
  </Document>
)
