import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type AboutLayoutHeaderProps = {
  className?: string
}

export function AboutLayoutHeader({ className }: AboutLayoutHeaderProps): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid='about-header'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            {t('about.title')}
          </h1>
          <p className='text-foreground mt-1'>{t('about.description')}</p>
        </div>
      </div>
    </div>
  )
}
