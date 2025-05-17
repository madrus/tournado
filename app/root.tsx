import os from 'node:os'

import React, { JSX } from 'react'
import { I18nextProvider } from 'react-i18next'
import {
  Link,
  Links,
  LinksFunction,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import { AppBar } from '~/components/AppBar'

import type { Route } from './+types/root'
import { GeneralErrorBoundary } from './components/GeneralErrorBoundary'
import { PWAElements } from './components/PWAElements'
import { i18n } from './i18n'
import { getEnv } from './utils/env.server'
import { getUser } from './utils/session.server'
import { capitalize } from './utils/utils'

// In Vite, ?url imports return a string URL
const layoutStylesheetUrl = new URL('./styles/layout.css', import.meta.url).href
const safeAreasStylesheetUrl = new URL('./styles/safe-areas.css', import.meta.url).href
const tailwindStylesheetUrl = new URL('./styles/tailwind.css', import.meta.url).href

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
  const prettyUsername = capitalize(os.userInfo().username)

  return {
    authenticated: !!user,
    username: user?.email ?? prettyUsername,
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
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
      />
      <Links />
    </head>
    <body className='bg-background text-foreground flex h-full flex-col justify-between'>
      {children}
      <I18nextProvider i18n={i18n}>
        <PWAElements />
      </I18nextProvider>
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
)

export default function App({ loaderData }: Route.ComponentProps): JSX.Element {
  const { authenticated, username, ENV } = loaderData

  return (
    <Document>
      <div className='relative' style={{ zIndex: 50 }}>
        <AppBar authenticated={authenticated} username={username} />
      </div>
      <div className='flex-1' style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </div>
      <div className='container mx-auto flex justify-between'>
        <Link to='/'>
          <div className='font-light'>Tournado</div>
        </Link>
        <p>Built with ♥️ by Madrus</p>
      </div>
      <div className='h-5' />
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
    <div className='flex-1'>
      <GeneralErrorBoundary />
    </div>
  </Document>
)
