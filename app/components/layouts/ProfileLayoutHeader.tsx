import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type ProfileLayoutHeaderProps = {
  className?: string
}

export function ProfileLayoutHeader({
  className,
}: ProfileLayoutHeaderProps): JSX.Element {
  const { i18n } = useTranslation()

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid='profile-header'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            Profile Information
          </h1>
          <p className='text-foreground mt-1'>
            Manage your profile settings and account information for tournament
            management.
          </p>
        </div>
      </div>
    </div>
  )
}
