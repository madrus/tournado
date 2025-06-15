import { JSX, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFetcher, useLocation } from 'react-router'

import type { User } from '@prisma/client'

import logo from '~/assets/logo-192x192.png'
import { useLanguageSwitcher } from '~/hooks/useLanguageSwitcher'
import { SUPPORTED_LANGUAGES } from '~/lib/lib.constants'
import { IconName, renderIcon } from '~/utils/iconUtils'
import { usePageTitle } from '~/utils/route-utils'
import {
  getArabicTextClass,
  getLatinContentClass,
  getLatinTitleClass,
  useRTLDropdown,
} from '~/utils/rtlUtils'

import { PrimaryNavLink } from './PrefetchLink'
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

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN'

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
    {
      label: t('common.titles.teams'),
      icon: 'apparel' as IconName,
      href: isAdmin ? '/a7k9m2x5p8w1n4q6r3y8b5t1/teams' : '/teams',
      authenticated: false,
    },
    // Divider after Teams
    {
      label: '',
      icon: '' as IconName,
      divider: true,
      authenticated: false,
    },
    // Admin Panel - only show for admin users, right after Teams
    ...(isAdmin
      ? [
          {
            label: t('common.titles.adminPanel'),
            icon: 'admin_panel_settings' as IconName,
            href: '/a7k9m2x5p8w1n4q6r3y8b5t1',
            authenticated: true,
          },
        ]
      : []),
    {
      label: t('common.titles.profile'),
      href: '/profile',
      icon: 'person' as IconName,
      authenticated: true,
    },
    {
      label: t('common.titles.settings'),
      href: '/settings',
      icon: 'settings' as IconName,
      authenticated: true,
    },
    {
      label: t('common.titles.about'),
      icon: 'info' as IconName,
      href: '/about',
      authenticated: false,
    },
    {
      label: t('common.language'),
      icon: 'language' as IconName,
      subMenu: SUPPORTED_LANGUAGES.map(lang => ({
        label: lang.name,
        customIcon: lang.flag,
        onClick: () => switchLanguage(lang.code),
        active: lang.code === currentLanguage,
        className:
          lang.code === 'ar'
            ? getArabicTextClass()
            : getLatinContentClass(currentLanguage),
      })),
      authenticated: false,
    },
    {
      label: isAuthenticated ? t('auth.signout') : t('auth.signin'),
      icon: (isAuthenticated ? 'logout' : 'login') as IconName,
      action: isAuthenticated ? (
        <button
          onClick={handleSignOut}
          className={`flex w-full content-start items-center px-3 py-2 leading-normal text-emerald-800 hover:bg-gray-100 ${menuClasses.menuItem}`}
        >
          <span className={menuClasses.iconContainer}>
            {renderIcon('logout', { className: 'w-5 h-5' })}
          </span>
          <span className={menuClasses.textContainer}>{t('auth.signout')}</span>
        </button>
      ) : (
        <PrimaryNavLink
          to={`/auth/signin?redirectTo=${encodeURIComponent(location.pathname)}`}
          className={`flex w-full content-start items-center px-3 py-2 leading-normal text-emerald-800 hover:bg-gray-100 ${menuClasses.menuItem}`}
          onClick={handleSignIn}
        >
          <span className={menuClasses.iconContainer}>
            {renderIcon('login', { className: 'w-5 h-5' })}
          </span>
          <span className={menuClasses.textContainer}>{t('auth.signin')}</span>
        </PrimaryNavLink>
      ),
      authenticated: false,
    },
  ]

  return (
    <>
      <header className='safe-top relative z-20 h-14 bg-emerald-800 px-4 text-white'>
        {/* Logo and Brand for all screen sizes */}
        <div className='absolute start-2 top-1/2 flex -translate-y-1/2 items-center gap-1 lg:start-4 lg:gap-2'>
          <PrimaryNavLink to='/' className='flex items-center gap-1 lg:gap-2'>
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
              className={`hidden text-xl font-bold text-white lg:inline-block ${getLatinTitleClass(currentLanguage)}`}
            >
              Tournado
            </span>
          </PrimaryNavLink>
        </div>

        {/* Page title in center */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <h2 className='text-center text-xl font-bold sm:text-2xl'>{pageTitle}</h2>
        </div>

        {/* Unified menu for both desktop and mobile */}
        <div className='absolute end-4 top-1/2 flex -translate-y-1/2 items-center gap-4'>
          <UserMenu
            authenticated={isAuthenticated}
            username={username}
            menuItems={menuItems.filter(item => !item.authenticated || isAuthenticated)}
            isOpen={menuOpen}
            onOpenChange={setMenuOpen}
          />
        </div>
      </header>

      <div className='h-1.5 w-full bg-red-500' />
    </>
  )
}
