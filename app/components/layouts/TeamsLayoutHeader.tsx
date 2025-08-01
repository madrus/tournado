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

  const title = isAdmin ? t('admin.teams.title') : t('common.titles.teams')
  const description = isAdmin ? t('admin.teams.description') : t('teams.description')

  if (isAdmin) {
    return (
      <div
        className={cn(
          'border-button-neutral-secondary-border border-b pb-6',
          className
        )}
        data-testid='teams-header-admin'
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
              icon='add'
              label={t('common.actions.add')}
              variant='primary'
              color='brand'
              permission='teams:create'
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('mb-8', className)} data-testid='teams-header-public'>
      <h1 className={cn('mb-8 text-3xl font-bold', getLatinTitleClass(i18n.language))}>
        {title}
      </h1>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-foreground text-start text-lg'>{description}</p>
        <div className='flex justify-end gap-4 md:justify-end rtl:justify-start rtl:md:justify-start'>
          <ActionLinkButton
            to={addButtonTo}
            icon='add'
            label={t('common.actions.add')}
            variant='primary'
            color='brand'
          />
        </div>
      </div>
    </div>
  )
}
