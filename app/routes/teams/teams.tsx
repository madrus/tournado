import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { ActionLink } from '~/components/PrefetchLink'
import type { RouteMetadata } from '~/utils/route-types'

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
}

export default function PublicTeamsLayout(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>{t('common.titles.teams')}</h1>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-foreground-light text-start text-lg'>
          {t('teams.description')}
        </p>
        <ActionLink
          to='new'
          className='bg-brand hover:bg-brand-dark focus:ring-brand inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none'
          aria-label={t('teams.addTeam')}
        >
          <svg
            className='-ms-1 me-2 h-5 w-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            />
          </svg>
          {t('teams.addTeam')}
        </ActionLink>
      </div>
      {/* Main Content */}
      <Outlet />
    </div>
  )
}
