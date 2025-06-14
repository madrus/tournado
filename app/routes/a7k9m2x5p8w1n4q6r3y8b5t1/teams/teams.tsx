import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { ActionLinkButton } from '~/components/buttons'
import type { RouteMetadata } from '~/utils/route-types'

// Route metadata - admin only
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  // No authorization restrictions - all authenticated users can access
  // Access control will be handled within the Admin Panel components
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
          <ActionLinkButton
            to='new'
            icon='add'
            label={t('teams.addTeam')}
            variant='primary'
          />
        </div>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  )
}
