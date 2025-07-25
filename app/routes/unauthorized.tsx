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
    <div
      className='bg-background flex min-h-screen flex-col items-center justify-center'
      data-testid='main-container'
    >
      <div
        className='bg-background mx-auto max-w-md rounded-lg p-6 shadow-md'
        data-testid='content-card'
      >
        <div className='flex flex-col items-center gap-4' data-testid='content-wrapper'>
          {/* Icon */}
          <div
            className='bg-error flex h-12 w-12 items-center justify-center rounded-full'
            data-testid='icon-container'
          >
            <BlockIcon className='text-brand' size={24} />
          </div>

          {/* Title */}
          <h1 className={cn('text-2xl font-bold', getLatinTitleClass(i18n.language))}>
            {t('auth.errors.unauthorizedTitle')}
          </h1>

          {/* Description */}
          <p className='text-foreground text-center'>
            {t(
              'errors.unauthorized.description',
              'You do not have permission to access this page. Contact your administrator if you believe this is an error.'
            )}
          </p>

          {/* Actions */}
          <div className='flex w-full flex-col gap-2' data-testid='actions-container'>
            <ErrorRecoveryLink
              to='/'
              className='bg-button-primary-background text-button-primary-text hover:bg-button-primary-hover-background hover:ring-primary focus:ring-primary flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:ring-2 hover:ring-offset-2 focus:ring-2 focus:ring-offset-2 focus:outline-none'
            >
              {t('common.backToHome')}
            </ErrorRecoveryLink>

            <PrimaryNavLink
              to='/profile'
              className='border-button-secondary-border bg-button-secondary-background text-button-secondary-text hover:bg-button-secondary-hover-background hover:ring-primary focus:ring-primary flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:ring-2 hover:ring-offset-2 focus:ring-2 focus:ring-offset-2 focus:outline-none'
            >
              {t('common.titles.profile')}
            </PrimaryNavLink>
          </div>
        </div>
      </div>
    </div>
  )
}
