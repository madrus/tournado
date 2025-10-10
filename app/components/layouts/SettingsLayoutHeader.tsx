import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type SettingsLayoutHeaderProps = {
  className?: string
}

export function SettingsLayoutHeader({
  className,
}: SettingsLayoutHeaderProps): JSX.Element {
  const { i18n } = useTranslation()

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid='settings-header'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            Application Settings
          </h1>
          <p className='text-foreground mt-1'>
            Configure your tournament settings, preferences, and account options for
            optimal experience.
          </p>
        </div>
      </div>
    </div>
  )
}
