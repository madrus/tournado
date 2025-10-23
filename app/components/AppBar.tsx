import { JSX, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFetcher, useLocation } from 'react-router'

import type { User } from '@prisma/client'

import logo from '~/assets/logo-192x192.png'
import { navigationVariants } from '~/components/navigation/navigation.variants'
import { useLanguageSwitcher } from '~/hooks/useLanguageSwitcher'
import { useRTLDropdown } from '~/hooks/useRTLDropdown'
import { useScrollDirection } from '~/hooks/useScrollDirection'
import { SUPPORTED_LANGUAGES } from '~/i18n/config'
import { CONTENT_PX } from '~/styles/constants'
import { breakpoints } from '~/utils/breakpoints'
import { IconName, renderIcon } from '~/utils/iconUtils'
import { canAccess, hasAdminPanelAccess } from '~/utils/rbac'
import { usePageTitle } from '~/utils/routeUtils'
import {
  getArabicTextClass,
  getLatinTextClass,
  getLatinTitleClass,
  getTypographyClass,
} from '~/utils/rtlUtils'

import { PrimaryNavLink } from './PrefetchLink'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

// Accepts user and optional title as props for future flexibility
export function AppBar({
  authenticated,
  username,
  user,
}: {
  authenticated: boolean
  title?: string
  username?: string
  user?: User | null
}): JSX.Element {
  const { t } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const signoutFetcher = useFetcher()
  // Get the current page title
  const pageTitle = usePageTitle()

  // Get RTL classes for auth actions
  const { menuClasses } = useRTLDropdown()

  // Track optimistic authenticated state
  const isAuthenticated =
    signoutFetcher.formAction === '/auth/signout' ? false : authenticated

  // Check user permissions using RBAC utilities
  // Menu visibility: delete permission implies full admin access (create, read, update, delete)
  const canManageTournaments = canAccess(user || null, 'tournaments:delete')
  const canManageTeams = canAccess(user || null, 'teams:delete')
  const canManageGroups = canAccess(user || null, 'groups:manage')
  const userHasAdminPanelAccess = hasAdminPanelAccess(user || null)

  // Handle sign-in
  const handleSignIn = useCallback(() => {
    // Close menu
    setMenuOpen(false)
  }, [setMenuOpen])

  // Handle sign-out
  const handleSignOut = useCallback(() => {
    setMenuOpen(false)
    // Submit signout form
    signoutFetcher.submit({}, { method: 'post', action: '/auth/signout' })
  }, [signoutFetcher, setMenuOpen])

  // Language switching logic
  const { switchLanguage, currentLanguage } = useLanguageSwitcher()

  const menuItems = [
    // Admin Panel - show for admin panel access (admin, manager, referee)
    ...(userHasAdminPanelAccess
      ? [
          {
            label: t('common.titles.adminPanel'),
            icon: 'admin_panel_settings' as IconName,
            href: '/a7k9m2x5p8w1n4q6r3y8b5t1',
            authenticated: true,
          },
        ]
      : []),
    // Tournaments - only show for users who can manage tournaments (ADMIN, MANAGER)
    ...(canManageTournaments
      ? [
          {
            label: t('common.titles.tournaments'),
            icon: 'trophy' as IconName,
            href: '/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments',
            authenticated: true,
          },
        ]
      : []),
    {
      label: t('common.titles.teams'),
      icon: 'apparel' as IconName,
      href: canManageTeams ? '/a7k9m2x5p8w1n4q6r3y8b5t1/teams' : '/teams',
      authenticated: false,
    },
    // Competition - only show for users who can manage groups (ADMIN, MANAGER)
    ...(canManageGroups
      ? [
          {
            label: t('common.titles.competition'),
            icon: 'sports' as IconName,
            href: '/a7k9m2x5p8w1n4q6r3y8b5t1/competition',
            authenticated: true,
          },
        ]
      : []),
    // Users - only show for ADMIN users
    ...(canAccess(user || null, 'users:approve')
      ? [
          {
            label: t('common.titles.users'),
            icon: 'people' as IconName,
            href: '/a7k9m2x5p8w1n4q6r3y8b5t1/users',
            authenticated: true,
          },
        ]
      : []),
    // Divider after Users
    {
      label: '',
      icon: '' as IconName,
      divider: true,
      authenticated: false,
    },
    {
      label: t('common.titles.about'),
      icon: 'info' as IconName,
      href: '/about',
      authenticated: false,
    },
    {
      label: t('common.titles.settings'),
      href: '/settings',
      icon: 'settings' as IconName,
      authenticated: true,
    },
    {
      label: t('common.titles.profile'),
      href: '/profile',
      icon: 'person' as IconName,
      authenticated: true,
    },
    {
      label: t('common.language'),
      icon: 'language' as IconName,
      subMenu: SUPPORTED_LANGUAGES.map(lang => ({
        label: lang.name,
        customIcon: lang.flag,
        onClick: () => switchLanguage(lang.code),
        active: lang.code === currentLanguage,
        className: lang.code === 'ar' ? getArabicTextClass() : getLatinTextClass(),
      })),
      authenticated: false,
    },
    {
      label: isAuthenticated ? t('common.auth.signOut') : t('common.auth.signIn'),
      icon: (isAuthenticated ? 'logout' : 'login') as IconName,
      action: isAuthenticated ? (
        <button
          onClick={handleSignOut}
          className={`text-foreground-darker hover:bg-accent flex w-full content-start items-center px-3 py-2 leading-normal focus:outline-none ${menuClasses.menuItem}`}
        >
          <span className={menuClasses.iconContainer}>
            {renderIcon('logout', { className: 'w-5 h-5' })}
          </span>
          <span className={menuClasses.textContainer}>{t('common.auth.signOut')}</span>
        </button>
      ) : (
        <PrimaryNavLink
          to={`/auth/signin?redirectTo=${encodeURIComponent(location.pathname)}`}
          className={`text-foreground-darker hover:bg-accent flex w-full content-start items-center px-3 py-2 leading-normal focus:outline-none ${menuClasses.menuItem}`}
          onClick={handleSignIn}
        >
          <span className={menuClasses.iconContainer}>
            {renderIcon('login', { className: 'w-5 h-5' })}
          </span>
          <span className={menuClasses.textContainer}>{t('common.auth.signIn')}</span>
        </PrimaryNavLink>
      ),
      authenticated: false,
    },
  ]

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState<number>(56)
  // Initialize isMobile to false to avoid SSR hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // Track mobile state - use same breakpoint logic as useScrollDirection for consistency
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return

    // Use same mobile detection as useScrollDirection hook to avoid breakpoint mismatch
    const checkMobile = () => {
      setIsMobile(breakpoints.isMobile())
    }

    // Initial setup
    checkMobile()

    // Add listener for window resize changes
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Measure header height once after mount
  useLayoutEffect(() => {
    if (containerRef.current) {
      const totalHeight = containerRef.current.offsetHeight
      setHeaderHeight(totalHeight)
      // Initialize padding to full height
      document.documentElement.style.setProperty('--header-padding', `${totalHeight}px`)
    }
  }, [])

  // Use direction-based show/hide logic
  const { showHeader } = useScrollDirection()

  // Adjust header visibility based on `isMobile`
  const effectiveShowHeader = isMobile ? showHeader : true

  // Update padding variable when visibility changes - client side only
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    document.documentElement.style.setProperty(
      '--header-padding',
      effectiveShowHeader ? `${headerHeight}px` : '0px'
    )
  }, [effectiveShowHeader, headerHeight])

  return (
    <>
      <div
        ref={containerRef}
        className={`fixed top-0 right-0 left-0 z-30 ${navigationVariants({
          component: 'APP_BAR',
          viewport: isMobile ? 'mobile' : 'desktop',
          visible: effectiveShowHeader,
        })}`}
      >
        <header
          className={`safe-top bg-primary text-primary-foreground relative h-14 w-full ${CONTENT_PX}`}
        >
          {/* Logo and Brand for all screen sizes */}
          <div className='absolute start-4 top-1/2 flex -translate-y-1/2 items-center gap-2'>
            <PrimaryNavLink to='/' className='flex items-center gap-2'>
              <img
                src={logo}
                alt='Tournado Logo'
                className='app-bar-logo'
                width={40}
                height={40}
                loading={'eager'}
              />
              {/* Show Tournado text next to logo only on desktop */}
              <span
                className={`text-primary-foreground hidden text-xl font-bold lg:inline-block ${getLatinTitleClass()}`}
              >
                Tournado
              </span>
            </PrimaryNavLink>
          </div>

          {/* Page title in center */}
          <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
            <h1
              className={`text-primary-foreground text-center text-xl font-bold sm:text-2xl ${getTypographyClass()}`}
            >
              {pageTitle}
            </h1>
          </div>

          {/* Unified menu for both desktop and mobile */}
          <div className='absolute end-4 top-1/2 flex -translate-y-1/2 items-center gap-1'>
            <ThemeToggle />
            <UserMenu
              authenticated={isAuthenticated}
              username={username}
              menuItems={menuItems.filter(
                item => !item.authenticated || isAuthenticated
              )}
              isOpen={menuOpen}
              onOpenChange={setMenuOpen}
            />
          </div>
        </header>

        <div className='bg-brand-accent h-1.5 w-full' />
      </div>
    </>
  )
}
