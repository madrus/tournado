import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { ActionLinkButton } from '~/components/buttons'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass } from '~/utils/rtlUtils'

// Route metadata - authenticated users can access
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  // No authorization restrictions - all authenticated users can access tournaments listing
}

export default function AdminTournamentsLayout(): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <div className='space-y-8' data-testid='admin-tournaments-layout-container'>
      {/* Header */}
      <div className='border-button-neutral-secondary-border border-b pb-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
              {t('admin.tournament.title')}
            </h1>
            <p className='text-foreground mt-1'>{t('admin.tournament.description')}</p>
          </div>

          {/* Add Tournament Button */}
          <div className='flex justify-end gap-4 md:justify-end rtl:justify-start rtl:md:justify-start'>
            <ActionLinkButton
              to='new'
              icon='newWindow'
              label={t('common.actions.add')}
              variant='primary'
              color='brand'
              className='min-w-32'
              permission='tournaments:create'
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  )
}
