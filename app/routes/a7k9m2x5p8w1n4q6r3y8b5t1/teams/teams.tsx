import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { ActionLinkButton } from '~/components/buttons'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinTitleClass } from '~/utils/rtlUtils'

// Route metadata - authenticated users can access
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  // No authorization restrictions - all authenticated users can access
}

export default function AdminTeamsLayout(): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='border-button-neutral-secondary-border border-b pb-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
              {t('admin.teams.title')}
            </h1>
            <p className='text-foreground-light mt-1'>{t('admin.teams.description')}</p>
          </div>

          {/* Add Team Button */}
          <div className='flex justify-end sm:justify-end rtl:justify-start sm:rtl:justify-start'>
            <ActionLinkButton
              to='new'
              icon='add'
              label={t('common.actions.add')}
              variant='primary'
              color='brand'
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  )
}
