import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { Panel } from '~/components/Panel'
import type { AuditLogWithAdmin } from '~/features/users/types'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'

type UserAuditLogListProps = {
  auditLogs: readonly AuditLogWithAdmin[]
}

export function UserAuditLogList(props: Readonly<UserAuditLogListProps>): JSX.Element {
  const { auditLogs } = props
  const { t } = useTranslation()
  const { latinFontClass } = useLanguageDirection()

  return (
    <Panel color='sky' variant='content-panel'>
      <h2 className='mb-4 text-xl font-semibold'>{t('users.titles.auditLog')}</h2>

      {auditLogs.length === 0 ? (
        <p className='text-foreground/80 py-8 text-center'>
          {t('users.messages.noAuditLogs')}
        </p>
      ) : (
        <div className='space-y-4'>
          {auditLogs.map(log => (
            <div key={log.id} className='border-primary border-l-2 py-2 pl-4'>
              <div className='flex flex-col items-start gap-2 md:flex-row md:justify-between'>
                <div>
                  <div className='font-medium'>
                    {t(`users.auditActions.${log.action}`, {
                      defaultValue: log.action,
                    })}
                  </div>
                  {log.previousValue && log.newValue ? (
                    <div
                      className={`text-foreground/80 mt-1 text-sm ${latinFontClass}`}
                    >
                      {log.previousValue} → {log.newValue}
                    </div>
                  ) : null}
                </div>
                <div className='text-foreground/70 text-xs md:text-right'>
                  <div className={latinFontClass}>
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  <div className='mt-1'>
                    {t('users.fields.performedBy')}:{' '}
                    <span className={latinFontClass}>
                      {log.admin.displayName || log.admin.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
