import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'

import type { RouteMetadata } from '~/utils/route-types'

// Route metadata - this is a public route
export const handle: RouteMetadata = {
  isPublic: true,
}

export default function PublicTeamsLayout(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className='min-h-screen bg-gray-50' data-cy='teams-layout'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>{t('teams.title')}</h1>
              <p className='mt-2 text-gray-600'>{t('teams.description')}</p>
            </div>

            {/* Add Team Button */}
            <Link
              to='new'
              className='inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
              aria-label={t('teams.addTeam')}
            >
              <svg
                className='mr-2 -ml-1 h-5 w-5'
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
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <Outlet />
      </div>

      {/* Mobile Floating Action Button */}
      <Link
        to='new'
        className='fixed right-4 bottom-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 sm:hidden'
        aria-label={t('teams.addTeam')}
      >
        <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
          />
        </svg>
      </Link>
    </div>
  )
}
