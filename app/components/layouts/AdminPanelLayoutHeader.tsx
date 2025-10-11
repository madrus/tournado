import { JSX } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type AdminPanelLayoutHeaderProps = {
  userEmail: string
  className?: string
}

export function AdminPanelLayoutHeader({
  userEmail,
  className,
}: AdminPanelLayoutHeaderProps): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid='admin-panel-header'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            {t('common.titles.adminPanel')}
          </h1>
          <p className='text-foreground mt-1'>
            <Trans
              i18nKey='admin.panel.description'
              values={{ email: userEmail }}
              components={{
                email: <span className={getLatinTitleClass(i18n.language)} />,
              }}
            />
          </p>
        </div>
      </div>
    </div>
  )
}
