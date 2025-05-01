import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'

import { I18nextProvider } from 'react-i18next'

import { GeneralErrorBoundary } from './components/GeneralErrorBoundary'
import { PWAElements } from './components/PWAElements'
import { i18n } from './i18n'
import './styles/layout.css'
import './styles/safe-areas.css'
import './styles/tailwind.css'
import { getUser } from './utils/session.server'

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
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
]

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<ReturnType<typeof json>> => {
  const user = await getUser(request)
  return json({ user })
}

const Document = ({ children }: { children: React.ReactNode }) => (
  <html lang='en' className='h-full overflow-x-hidden'>
    <head>
      <Meta />
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width,initial-scale=1' />
      <Links />
    </head>
    <body className='bg-background text-foreground flex h-full flex-col justify-between'>
      {children}
      <ScrollRestoration />
      <Scripts />
      {/* <EpicShop /> */}
      <LiveReload />
    </body>
  </html>
)

export default function App(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, id-blacklist
  const data = useLoaderData<typeof loader>()

  return (
    <html lang={i18n.language}>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <I18nextProvider i18n={i18n}>
          <Outlet />
          <PWAElements />
        </I18nextProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const ErrorBoundary = (): JSX.Element => (
  <Document>
    <div className='flex-1'>
      <GeneralErrorBoundary />
    </div>
  </Document>
)
