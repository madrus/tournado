import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { Panel } from '~/components/Panel'
import type { AuditLogWithAdmin } from '~/features/users/types'

type UserAuditLogListProps = {
  auditLogs: readonly AuditLogWithAdmin[]
}

export function UserAuditLogList(props: Readonly<UserAuditLogListProps>): JSX.Element {
  const { auditLogs } = props
  const { t } = useTranslation()

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
                    <div className='text-foreground/80 mt-1 text-sm'>
                      {log.previousValue} → {log.newValue}
                    </div>
                  ) : null}
                  {log.reason ? (
                    <div className='text-foreground/80 mt-1 text-sm'>{log.reason}</div>
                  ) : null}
                </div>
                <div className='text-foreground/40 text-xs md:text-right'>
                  <div>{new Date(log.createdAt).toLocaleString()}</div>
                  <div className='mt-1'>
                    {t('users.fields.performedBy')}:{' '}
                    {log.admin.displayName || log.admin.email}
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
