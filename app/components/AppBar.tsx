import { Form, Link } from '@remix-run/react'

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
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null)

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
      label: authenticated ? t('auth.signout') : t('auth.signin'),
      icon: authenticated ? 'logout' : 'login',
      action: authenticated ? (
        <Form action='/signout' method='post' className='m-0 p-0'>
          <button
            type='submit'
            className='flex w-full content-start items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100'
          >
            <span className='material-symbols-outlined w-8 pl-0 text-left'>logout</span>
            {t('auth.signout')}
          </button>
        </Form>
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

  // The actual mobile menu content
  const mobileMenuContent = (
    <div
      className='fixed inset-0 z-100 flex items-start justify-center bg-black/60 pt-16 backdrop-blur-sm'
      onClick={() => setMobileMenuOpen(false)}
    >
      <div
        className='w-[95%] max-w-md overflow-visible rounded-lg bg-white shadow-xl'
        onClick={event => event.stopPropagation()}
      >
        <div className='border-b border-gray-200 px-3 py-3'>
          <p className='text-gray-500'>{t('common.signedInAs')}</p>
          <p className='truncate font-medium text-gray-900'>
            {authenticated ? username : t('auth.notSignedIn')}
          </p>
        </div>
        <div className='py-2'>
          {menuItems
            .filter(
              item =>
                authenticated ||
                !(
                  item.href === '/profile' ||
                  item.href === '/settings' ||
                  item.label === t('auth.signin')
                )
            )
            .map((item, index) => (
              <div key={index} className='block px-3 py-0'>
                {item.customIcon ? (
                  <div className='relative'>
                    <button
                      className='flex w-full content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
                      onClick={event => {
                        event.stopPropagation()
                        setActiveSubmenu(activeSubmenu === index ? null : index)
                      }}
                    >
                      <span className='w-8 pl-0 text-left text-lg'>
                        {item.customIcon}
                      </span>
                      <span>{item.label}</span>
                    </button>

                    {activeSubmenu === index && item.subMenu ? (
                      <div className='ring-opacity-5 absolute top-full left-0 z-50 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black'>
                        {item.subMenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className={`flex w-full content-start items-center px-3 py-1 text-sm ${
                              subItem.active
                                ? 'bg-gray-100 text-emerald-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={event => {
                              event.stopPropagation()
                              subItem.onClick()
                              setActiveSubmenu(null)
                            }}
                          >
                            <span className='w-8 pl-0 text-left text-lg'>
                              {subItem.customIcon}
                            </span>
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : item.action ? (
                  item.action
                ) : (
                  <Link
                    to={item.href || '#'}
                    className='flex content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className='material-symbols-outlined w-8 pl-0 text-left'>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.todo ? (
                      <span className='ml-2 text-xs text-gray-500'>(TODO)</span>
                    ) : null}
                  </Link>
                )}
              </div>
            ))}

          {/* Add sign in link if not authenticated */}
          {!authenticated ? (
            <div className='block px-3 py-2'>
              <Link
                to='/signin'
                className='flex content-start items-center px-3 py-2 text-gray-700 hover:bg-gray-100'
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className='material-symbols-outlined w-8 pl-0 text-left'>
                  login
                </span>
                {t('auth.signin')}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

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
            <span className='material-symbols-outlined'>menu</span>
          </button>
        </div>

        {/* Desktop menu */}
        <div className='absolute top-1/2 right-4 hidden -translate-y-1/2 items-center gap-4 lg:flex'>
          <UserMenu
            authenticated={authenticated}
            username={username}
            menuItems={menuItems}
          />
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen ? mobileMenuContent : null}

      <div className='h-1.5 w-full bg-red-500' />
    </>
  )
}
