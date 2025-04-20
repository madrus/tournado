import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react'

import { useEffect } from 'react'

import safeAreaStyles from '@/styles/safe-areas.css'
import tailwindStyles from '@/styles/tailwind.css'
// import { registerServiceWorker } from '@/utils/serviceWorker'
import { getUser } from '@/utils/session.server'

import { AddToHomeScreenPrompt } from './components/AddToHomeScreenPrompt'
import { UpdatePrompt } from './components/UpdatePrompt'
import { registerServiceWorker } from './utils/serviceWorker'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwindStyles },
  { rel: 'stylesheet', href: safeAreaStyles },
  // Favicon for most browsers
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon/favicon-16x16.png',
  },
  // Apple Touch Icon
  {
    rel: 'apple-touch-icon',
    type: 'image/png',
    sizes: '180x180',
    href: '/favicon/apple-touch-icon.png',
  },
  // Web Manifest
  {
    rel: 'manifest',
    href: '/favicon/site.webmanifest',
  },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

/**
 * Meta tags for the app
 * - make sure there is no browser search bar on mobile
 * - To hide Safari/Chrome UI on iOS, users must:
 *   1. Add the app to home screen
 *   2. Launch it from the home screen icon
 */
export const meta: MetaFunction = () => [
  { charSet: 'utf-8' },
  {
    name: 'viewport',
    content:
      'width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no,minimal-ui,maximum-scale=1',
  },
  // iOS full-screen web app configuration
  {
    name: 'apple-mobile-web-app-capable',
    content: 'yes',
  },
  {
    name: 'apple-mobile-web-app-title',
    content: 'Tournado',
  },
  {
    name: 'apple-mobile-web-app-status-bar-style',
    content: 'black-translucent',
  },
  // Chrome mobile configuration
  {
    name: 'mobile-web-app-capable',
    content: 'yes',
  },
  {
    name: 'theme-color',
    content: '#047857',
  },
  {
    name: 'application-name',
    content: 'Tournado',
  },
  // Chrome for iOS specific
  {
    name: 'apple-mobile-web-app-orientations',
    content: 'portrait',
  },
  {
    name: 'apple-mobile-web-app-status-bar',
    content: 'black-translucent',
  },
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ user: await getUser(request) })
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Something went wrong</h1>
      <p>We're working on fixing this issue. Please try again later.</p>
    </div>
  )
}

export default function App() {
  // Register service worker
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <html lang='en' className='h-full'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <meta name='theme-color' content='#1e293b' />
        <Meta />
        <Links />
        <style>{`
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
        `}</style>
      </head>
      <body className='h-full bg-linear-to-b from-emerald-50 to-emerald-100'>
        <div className='min-h-full'>
          <Outlet />
          <div id='pwa-prompts'>
            <AddToHomeScreenPrompt />
            <UpdatePrompt />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
