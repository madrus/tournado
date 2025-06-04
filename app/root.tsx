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
      <link
        rel='preload'
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional'
        as='style'
      />
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional'
      />
      <Links />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Detect when Material Symbols font has loaded
            (function() {
              function checkFontLoaded() {
                try {
                  if (document.fonts && document.fonts.check) {
                    // Modern browsers with FontFaceSet API
                    if (document.fonts.check('24px "Material Symbols Outlined"')) {
                      document.documentElement.classList.add('fonts-loaded');
                      return true;
                    }
                  }
                  
                  // Fallback: test if font is available by measuring text width
                  // Only if body exists
                  if (document.body) {
                    const testSpan = document.createElement('span');
                    testSpan.style.fontFamily = '"Material Symbols Outlined", monospace';
                    testSpan.style.fontSize = '24px';
                    testSpan.style.visibility = 'hidden';
                    testSpan.style.position = 'absolute';
                    testSpan.textContent = 'trophy';
                    document.body.appendChild(testSpan);
                    
                    const materialWidth = testSpan.offsetWidth;
                    
                    testSpan.style.fontFamily = 'monospace';
                    const fallbackWidth = testSpan.offsetWidth;
                    
                    document.body.removeChild(testSpan);
                    
                    // If widths are different, Material Symbols font has loaded
                    if (materialWidth !== fallbackWidth) {
                      document.documentElement.classList.add('fonts-loaded');
                      return true;
                    }
                  }
                } catch (e) {
                  // If any error occurs, add class after timeout as fallback
                  console.warn('Font loading detection failed:', e);
                }
                return false;
              }
              
              function initFontDetection() {
                // Check immediately if font is already cached
                if (checkFontLoaded()) return;
                
                // Listen for font load events
                if (document.fonts && document.fonts.addEventListener) {
                  document.fonts.addEventListener('loadingdone', function() {
                    if (checkFontLoaded()) return;
                  });
                }
                
                // Fallback timeout to ensure icons show eventually
                setTimeout(function() {
                  document.documentElement.classList.add('fonts-loaded');
                }, 1000);
                
                // Check periodically until font loads (for slower connections)
                let attempts = 0;
                const maxAttempts = 20;
                const checkInterval = setInterval(function() {
                  attempts++;
                  if (checkFontLoaded() || attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    if (attempts >= maxAttempts) {
                      document.documentElement.classList.add('fonts-loaded');
                    }
                  }
                }, 100);
              }
              
              // Wait for DOM to be ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initFontDetection);
              } else {
                initFontDetection();
              }
            })();
          `,
        }}
      />
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
          className='flex-1 overflow-hidden pb-16 md:pb-0'
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
            className='flex-1 overflow-hidden pb-16 md:pb-0'
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
