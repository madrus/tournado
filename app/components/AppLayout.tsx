import type { ElementType, JSX, ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'

import type { User } from '@prisma/client'
import { Theme } from '@radix-ui/themes'

import type { i18n as I18n } from 'i18next'
import { Toaster } from 'sonner'

import { AppBar } from '~/components/AppBar'
import DesktopFooter from '~/components/desktopFooter/DesktopFooter'
import BottomNavigation from '~/components/mobileNavigation/BottomNavigation'
import {
  CSSRouteTransition,
  RouteTransition,
  RouteTransitionAdvanced,
  RouteTransitionFixed,
  SubtleRouteTransition,
  ViewTransition,
} from '~/components/RouteTransition'
import type { Language } from '~/i18n/config'
import { CONTENT_PX } from '~/styles/constants'

type AppLayoutProps = {
  authenticated: boolean
  username: string
  user?: User | null
  theme: 'light' | 'dark'
  language: Language
  i18n: I18n
  children: ReactNode
  contentClassName?: string
  env?: Record<string, string>
}

export const AppLayout = ({
  authenticated,
  username,
  user,
  theme,
  language,
  i18n,
  children,
  contentClassName = `${CONTENT_PX} pt-8 md:pb-8`,
  env,
}: AppLayoutProps): JSX.Element => {
  const transitionComponents = useMemo(
    () =>
      new Set<ElementType>([
        CSSRouteTransition,
        RouteTransition,
        RouteTransitionFixed,
        RouteTransitionAdvanced,
        SubtleRouteTransition,
        ViewTransition,
      ]),
    []
  )

  const renderContent = (): ReactNode => {
    if (
      isValidElement(children) &&
      transitionComponents.has(children.type as ElementType)
    ) {
      const transitionChild = children as ReactElement<{ className?: string }>
      const mergedClassName = [contentClassName, transitionChild.props.className]
        .filter(Boolean)
        .join(' ')

      return cloneElement(transitionChild, {
        className: mergedClassName,
      })
    }

    return <div className={contentClassName}>{children}</div>
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Theme
        accentColor='teal'
        grayColor='slate'
        radius='medium'
        scaling='100%'
        appearance={theme}
      >
        <div
          className='flex min-h-screen flex-col'
          style={{ paddingTop: 'var(--header-padding, 62px)' }}
        >
          <div className='relative' style={{ zIndex: 50 }}>
            <AppBar
              authenticated={authenticated}
              username={username}
              user={user}
              language={language}
            />
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
            {renderContent()}
          </div>
          {/* Desktop Footer - positioned at bottom of viewport */}
          <DesktopFooter />
          {/* Mobile Navigation - positioned at bottom of viewport */}
          <BottomNavigation />
        </div>
        <Toaster
          position='top-center'
          toastOptions={{
            duration: 7500,
            unstyled: true,
          }}
          visibleToasts={10}
          closeButton
          expand={true}
        />
      </Theme>
      {env ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
      ) : null}
    </I18nextProvider>
  )
}
