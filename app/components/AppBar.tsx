import { type JSX, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFetcher, useLocation } from 'react-router'

import type { User } from '@prisma/client'

import logo from '~/assets/logo-192x192.png'
import { usePageTitle } from '~/utils/route-utils'

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
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const signoutFetcher = useFetcher()
  // Get the current page title
  const pageTitle = usePageTitle()

  // Track optimistic authenticated state
  const isAuthenticated =
    signoutFetcher.formAction === '/auth/signout' ? false : authenticated

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN'

  // Handle sign-in
  const handleSignIn = useCallback(() => {
    // Close both mobile and desktop menus
    setMobileMenuOpen(false)
    setDesktopMenuOpen(false)
  }, [setMobileMenuOpen, setDesktopMenuOpen])

  // Handle sign-out
  const handleSignOut = useCallback(() => {
    setMobileMenuOpen(false)
    setDesktopMenuOpen(false)
    // Submit signout form
    signoutFetcher.submit({}, { method: 'post', action: '/auth/signout' })
  }, [signoutFetcher, setMobileMenuOpen, setDesktopMenuOpen])

  // Current language logic
  const languages = [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ]

  const currentLanguage =
    languages.find(lang => lang.code === i18n.language) ||
    languages.find(lang => lang.code === i18n.options.fallbackLng) ||
    languages[0]

  const menuItems = [
    {
      label: t('common.titles.teams'),
      icon: 'group',
      href: '/teams',
      authenticated: false,
    },
    // Divider after Teams
    {
      label: '',
      icon: '',
      divider: true,
      authenticated: false,
    },
    // Admin Panel - only show for admin users, right after Teams
    ...(isAdmin
      ? [
          {
            label: t('common.titles.adminPanel'),
            icon: 'admin_panel_settings',
            href: '/admin',
            authenticated: true,
          },
        ]
      : []),
    {
      label: t('common.titles.profile'),
      icon: 'person',
      href: '/profile',
      todo: true,
      authenticated: true,
    },
    {
      label: t('common.titles.settings'),
      icon: 'settings',
      href: '/settings',
      todo: true,
      authenticated: true,
    },
    {
      label: t('common.titles.about'),
      icon: 'info',
      href: '/about',
      authenticated: false,
    },
    {
      label: currentLanguage.name,
      icon: '',
      customIcon: currentLanguage.flag,
      subMenu: languages.map(lang => ({
        label: lang.name,
        customIcon: lang.flag,
        onClick: () => i18n.changeLanguage(lang.code),
        active: lang.code === currentLanguage.code,
      })),
      authenticated: false,
    },
    {
      label: isAuthenticated ? t('auth.signout') : t('auth.signin'),
      icon: isAuthenticated ? 'logout' : 'login',
      action: isAuthenticated ? (
        <button
          onClick={handleSignOut}
          className='flex w-full content-start items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100'
        >
          <span className='material-symbols-outlined w-8 pl-0 text-left'>logout</span>
          {t('auth.signout')}
        </button>
      ) : (
        <PrimaryNavLink
          to={`/auth/signin?redirectTo=${encodeURIComponent(location.pathname)}`}
          className='flex w-full content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
          onClick={handleSignIn}
        >
          <span className='material-symbols-outlined w-8 pl-0 text-left'>login</span>
          {t('auth.signin')}
        </PrimaryNavLink>
      ),
      authenticated: false,
    },
  ]

  return (
    <>
      <header className='safe-top relative z-20 h-14 bg-emerald-800 px-4 text-white'>
        {/* Logo and Brand for all screen sizes */}
        <div className='absolute top-1/2 left-2 flex -translate-y-1/2 items-center gap-1 lg:left-4 lg:gap-2'>
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
            <span className='hidden text-xl font-bold text-white lg:inline-block'>
              Tournado
            </span>
          </PrimaryNavLink>
        </div>

        {/* Page title in center */}
        <h2 className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xl font-bold sm:text-2xl'>
          {pageTitle}
        </h2>

        {/* Mobile menu button */}
        <div className='absolute top-1/2 right-2 flex -translate-y-1/2 items-center lg:hidden'>
          <button
            type='button'
            aria-label='Toggle menu'
            className='inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-emerald-700'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span
              className='material-symbols-outlined text-[28px]'
              style={{ fontSize: '32px' }}
            >
              menu
            </span>
          </button>
        </div>

        {/* Desktop menu */}
        <div className='absolute top-1/2 right-4 hidden -translate-y-1/2 items-center gap-4 lg:flex'>
          <UserMenu
            authenticated={isAuthenticated}
            username={username}
            menuItems={menuItems.filter(item => !item.authenticated || isAuthenticated)}
            isOpen={desktopMenuOpen}
            onOpenChange={setDesktopMenuOpen}
          />
        </div>
      </header>

      {/* Mobile menu */}
      <UserMenu
        authenticated={isAuthenticated}
        username={username}
        menuItems={menuItems.filter(item => !item.authenticated || isAuthenticated)}
        isMobile={true}
        isOpen={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      <div className='h-1.5 w-full bg-red-500' />
    </>
  )
}
