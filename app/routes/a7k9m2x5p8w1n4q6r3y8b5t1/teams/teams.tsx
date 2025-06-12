import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'

import type { RouteMetadata } from '~/utils/route-types'

// Route metadata - admin only
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin'],
    roleMatchMode: 'any',
    redirectTo: '/unauthorized',
  },
}

export default function AdminTeamsLayout(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='border-b border-gray-200 pb-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>{t('admin.teams.title')}</h2>
            <p className='text-foreground-light mt-1'>{t('admin.teams.description')}</p>
          </div>

          {/* Add Team Button */}
          <Link
            to='new'
            className='bg-brand hover:bg-brand-dark focus:ring-brand inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none'
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

      {/* Content */}
      <Outlet />
    </div>
  )
}
