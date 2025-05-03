import { Form, Link } from '@remix-run/react'

import { useTranslation } from 'react-i18next'

import logo from '~/assets/logo-192x192.png'
import { LanguageSwitcher } from '~/components/LanguageSwitcher'

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
  const { t } = useTranslation()
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
        <div className='absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-4 lg:right-4'>
          <LanguageSwitcher />
          {<p className='hidden text-sm md:block'>{username}</p>}
          {authenticated ? (
            <Form action='/signout' method='post'>
              <button
                type='submit'
                className='rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-600 active:bg-emerald-600'
              >
                {t('auth.signout')}
              </button>
            </Form>
          ) : (
            <Link
              to='/signin'
              className='rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600'
            >
              {t('auth.signin')}
            </Link>
          )}
        </div>
      </header>
      <div className='h-1.5 w-full bg-red-500' />
    </>
  )
}
