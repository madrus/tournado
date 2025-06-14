import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { ActionLinkButton } from '~/components/buttons'
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
        <ActionLinkButton
          to='new'
          icon='add'
          label={t('teams.addTeam')}
          variant='primary'
        />
      </div>
      {/* Main Content */}
      <Outlet />
    </div>
  )
}
