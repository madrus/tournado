import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type TournamentsLayoutHeaderProps = {
  variant: 'admin'
  addButtonTo?: string
  className?: string
}

export function TournamentsLayoutHeader({
  variant,
  addButtonTo = 'new',
  className,
}: TournamentsLayoutHeaderProps): JSX.Element {
  const { t, i18n } = useTranslation()

  const isAdmin = variant === 'admin'
  const title = isAdmin ? t('admin.tournament.title') : t('common.titles.tournaments')
  const description = isAdmin
    ? t('admin.tournament.description')
    : t('tournaments.description')

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid='tournaments-header-admin'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            {title}
          </h1>
          <p className='text-foreground mt-1'>{description}</p>
        </div>

        {/* Add Tournament Button */}
        <div className='flex justify-end gap-4 md:justify-end rtl:justify-start rtl:md:justify-start'>
          <ActionLinkButton
            to={addButtonTo}
            icon='newWindow'
            label={t('common.actions.add')}
            variant='primary'
            color='brand'
            permission='tournaments:create'
          />
        </div>
      </div>
    </div>
  )
}
