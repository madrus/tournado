import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'

import { BlockIcon } from '~/components/icons'
import { ErrorRecoveryLink, PrimaryNavLink } from '~/components/PrefetchLink'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinTitleClass } from '~/utils/rtlUtils'

export const meta: MetaFunction = () => [
  { title: 'Unauthorized | Tournado' },
  {
    name: 'description',
    content:
      'You do not have permission to access this page. Contact your administrator for access.',
  },
  { property: 'og:title', content: 'Unauthorized | Tournado' },
  {
    property: 'og:description',
    content:
      'You do not have permission to access this page. Contact your administrator for access.',
  },
  { property: 'og:type', content: 'website' },
]

export const handle: RouteMetadata = {
  isPublic: true, // Accessible to authenticated users who lack permissions
  title: 'Unauthorized',
}

export default function UnauthorizedPage(): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50'>
      <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'>
        <div className='flex flex-col items-center gap-4'>
          {/* Icon */}
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
            <BlockIcon className='text-red-600' size={24} />
          </div>

          {/* Title */}
          <h1 className={cn('text-2xl font-bold', getLatinTitleClass(i18n.language))}>
            {t('errors.unauthorized.title', 'Access Denied')}
          </h1>

          {/* Description */}
          <p className='text-center text-gray-600'>
            {t(
              'errors.unauthorized.description',
              'You do not have permission to access this page. Contact your administrator if you believe this is an error.'
            )}
          </p>

          {/* Actions */}
          <div className='flex w-full flex-col gap-2'>
            <ErrorRecoveryLink
              to='/'
              className='flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none'
            >
              {t('common.backToHome', 'Back to Home')}
            </ErrorRecoveryLink>

            <PrimaryNavLink
              to='/profile'
              className='flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none'
            >
              {t('common.viewProfile', 'View Profile')}
            </PrimaryNavLink>
          </div>
        </div>
      </div>
    </div>
  )
}
