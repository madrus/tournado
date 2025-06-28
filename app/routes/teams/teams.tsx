import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { ActionLinkButton } from '~/components/buttons'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinTitleClass } from '~/utils/rtlUtils'

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
}

export default function PublicTeamsLayout(): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className={cn('mb-8 text-3xl font-bold', getLatinTitleClass(i18n.language))}>
        {t('common.titles.teams')}
      </h1>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-foreground-light text-start text-lg'>
          {t('teams.description')}
        </p>
        <div className='flex justify-end lg:justify-end rtl:justify-start lg:rtl:justify-start'>
          <ActionLinkButton
            to='new'
            icon='add'
            label={t('common.actions.add')}
            variant='primary'
            color='brand'
          />
        </div>
      </div>
      {/* Main Content */}
      <Outlet />
    </div>
  )
}
