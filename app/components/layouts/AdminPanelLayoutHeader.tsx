import { JSX } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { getLatinTitleClass } from '~/utils/rtlUtils'

import { LayoutHeader } from './LayoutHeader'

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
    <LayoutHeader
      title={t('common.titles.adminPanel')}
      description={
        <Trans
          i18nKey='admin.panel.description'
          values={{ email: userEmail }}
          components={{
            email: <span className={getLatinTitleClass(i18n.language)} />,
          }}
        />
      }
      className={className}
      testId='admin-panel-header'
    />
  )
}
