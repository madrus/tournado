import { Link, useFetcher } from '@remix-run/react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import logo from '~/assets/logo-192x192.png'

import { UserMenu } from './UserMenu'

// Accepts user and optional title as props for future flexibility
export function AppBar({
  authenticated,
  title,
  username,
}: {
  authenticated: boolean
  title?: string
  username?: string
}): JSX.Element {
  const { t, i18n } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const signoutFetcher = useFetcher()

  // Track optimistic authenticated state
  const isAuthenticated =
    signoutFetcher.formAction === '/signout' ? false : authenticated

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
      label: t('common.profile'),
      icon: 'person',
      href: '/profile',
      todo: true,
    },
    {
      label: t('common.settings'),
      icon: 'settings',
      href: '/settings',
      todo: true,
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
    },
    {
      label: isAuthenticated ? t('auth.signout') : t('auth.signin'),
      icon: isAuthenticated ? 'logout' : 'login',
      action: isAuthenticated ? (
        <signoutFetcher.Form action='/signout' method='post' className='m-0 p-0'>
          <button
            type='submit'
            className='flex w-full content-start items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100'
          >
            <span className='material-symbols-outlined w-8 pl-0 text-left'>logout</span>
            {t('auth.signout')}
          </button>
        </signoutFetcher.Form>
      ) : (
        <Link
          to='/signin'
          className='flex w-full content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
        >
          <span className='material-symbols-outlined w-8 pl-0 text-left'>login</span>
          {t('auth.signin')}
        </Link>
      ),
    },
  ]

  return (
    <>
      <header className='safe-top relative h-14 bg-emerald-800 px-4 text-white'>
        <div className='absolute top-1/2 left-2 flex -translate-y-1/2 items-center gap-4 lg:left-4'>
          <Link to='/'>
            <img
              src={logo}
              alt='Tournado Logo'
              className='app-bar-logo'
              width={40}
              height={40}
              loading={'eager'}
            />
          </Link>
        </div>
        {/* Page title */}
        <h2 className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold'>
          <Link to='/' className='text-white hover:text-emerald-100'>
            {title ?? 'Tournado'}
          </Link>
        </h2>

        {/* Mobile menu button */}
        <div className='absolute top-1/2 right-2 flex -translate-y-1/2 items-center lg:hidden'>
          <button
            type='button'
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
            menuItems={menuItems}
          />
        </div>
      </header>

      {/* Mobile menu */}
      <UserMenu
        authenticated={isAuthenticated}
        username={username}
        menuItems={menuItems}
        isMobile={true}
        isOpen={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      <div className='h-1.5 w-full bg-red-500' />
    </>
  )
}
