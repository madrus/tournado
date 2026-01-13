import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutHeader } from './LayoutHeader'

type SettingsLayoutHeaderProps = {
  className?: string
}

export function SettingsLayoutHeader({
  className,
}: SettingsLayoutHeaderProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <LayoutHeader
      title={t('settings.title')}
      description={t('settings.description')}
      className={className}
      testId='settings-header'
      breakpoint='md'
    />
  )
}
