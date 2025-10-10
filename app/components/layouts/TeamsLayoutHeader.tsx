import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type TeamsLayoutHeaderProps = {
  variant: 'public' | 'admin'
  addButtonTo?: string
  className?: string
}

export function TeamsLayoutHeader({
  variant,
  addButtonTo = 'new',
  className,
}: TeamsLayoutHeaderProps): JSX.Element {
  const { t, i18n } = useTranslation()

  const isAdmin = variant === 'admin'

  const title = isAdmin ? t('admin.team.title') : t('common.titles.teams')
  const description = isAdmin ? t('admin.team.description') : t('teams.description')

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid={isAdmin ? 'teams-header-admin' : 'teams-header-public'}
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            {title}
          </h1>
          <p className='text-foreground mt-1'>{description}</p>
        </div>

        {/* Add Team Button */}
        <div className='flex justify-end gap-4 md:justify-end rtl:justify-start rtl:md:justify-start'>
          <ActionLinkButton
            to={addButtonTo}
            icon='newWindow'
            label={t('common.actions.add')}
            variant='primary'
            color='brand'
            permission={isAdmin ? 'teams:create' : undefined}
          />
        </div>
      </div>
    </div>
  )
}
