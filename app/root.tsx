import os from 'node:os'

import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderFunctionArgs, TypedResponse } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'

import { I18nextProvider } from 'react-i18next'

import { AppBar } from '~/components/AppBar'

import { GeneralErrorBoundary } from './components/GeneralErrorBoundary'
import { PWAElements } from './components/PWAElements'
import { i18n } from './i18n'
import layoutStylesheetUrl from './styles/layout.css'
import safeAreasStylesheetUrl from './styles/safe-areas.css'
import tailwindStylesheetUrl from './styles/tailwind.css'
import { getEnv } from './utils/env.server'
import { getUser } from './utils/session.server'
import { capitalize } from './utils/utils'

export const meta: MetaFunction = () => [
  { title: 'Tournado' },
  { name: 'description', content: `Tournament management for everyone` },
]

export const links: LinksFunction = (): { rel: string; href: string }[] =>
  [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'stylesheet', href: layoutStylesheetUrl },
    { rel: 'stylesheet', href: safeAreasStylesheetUrl },
    {
      rel: 'stylesheet',
      href:
        'data:text/css;base64,' +
        btoa(`
      :root {
        --sat: env(safe-area-inset-top);
        --sar: env(safe-area-inset-right);
        --sab: env(safe-area-inset-bottom);
        --sal: env(safe-area-inset-left);
        }
        body {
          padding: var(--sat) var(--sar) var(--sab) var(--sal);
        }
        /* Ensure content doesn't go under status bar */
        .safe-top {
          padding-top: max(env(safe-area-inset-top), 16px);
        }
        /* Ensure content doesn't go under home indicator */
        .safe-bottom {
          padding-bottom: max(env(safe-area-inset-bottom), 16px);
        }
        /* For fixed position elements */
        .fixed-safe-top {
          top: env(safe-area-inset-top);
        }
        .fixed-safe-bottom {
          bottom: env(safe-area-inset-bottom);
        }
      `),
    },
    cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
  ].filter(Boolean) as { rel: string; href: string }[]

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    authenticated: boolean
    ENV: Record<string, string>
    username: string
  }>
> => {
  const user = await getUser(request)
  const prettyUsername = capitalize(os.userInfo().username)
  return json({
    authenticated: !!user,
    username: user?.email ?? prettyUsername,
    ENV: getEnv(),
  })
}

const Document = ({ children }: { children: React.ReactNode }) => (
  <html lang={i18n.language} className='h-full overflow-x-hidden'>
    <head>
      <Meta />
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width,initial-scale=1' />
      <Links />
    </head>
    <body className='bg-background text-foreground flex h-full flex-col justify-between'>
      {children}
      <I18nextProvider i18n={i18n}>
        <PWAElements />
      </I18nextProvider>
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </body>
  </html>
)

export default function App(): JSX.Element {
  const appData = useLoaderData<typeof loader>()

  return (
    <Document>
      <AppBar
        authenticated={appData.authenticated}
        title={'Tournado'}
        username={appData.username}
      />
      <div className='flex-1'>
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
          __html: `window.ENV = ${JSON.stringify(appData.ENV)}`,
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
