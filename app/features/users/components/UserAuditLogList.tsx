import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import type { AuditLogWithAdmin } from '~/features/users/types'

type UserAuditLogListProps = {
  auditLogs: readonly AuditLogWithAdmin[]
}

export const UserAuditLogList = (
  props: Readonly<UserAuditLogListProps>
): JSX.Element => {
  const { auditLogs } = props
  const { t } = useTranslation()

  return (
    <div className='bg-card rounded-lg p-6 shadow'>
      <h2 className='mb-4 text-xl font-semibold'>{t('users.titles.auditLog')}</h2>

      {auditLogs.length === 0 ? (
        <p className='text-foreground/60 py-8 text-center'>
          {t('users.messages.noAuditLogs')}
        </p>
      ) : (
        <div className='space-y-4'>
          {auditLogs.map(log => (
            <div key={log.id} className='border-primary border-l-2 py-2 pl-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='font-medium'>
                    {t(`users.auditActions.${log.action}`)}
                  </div>
                  {log.previousValue && log.newValue ? (
                    <div className='text-foreground/60 mt-1 text-sm'>
                      {log.previousValue} → {log.newValue}
                    </div>
                  ) : null}
                  {log.reason ? (
                    <div className='text-foreground/60 mt-1 text-sm'>{log.reason}</div>
                  ) : null}
                </div>
                <div className='text-foreground/40 text-xs'>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
              <div className='text-foreground/40 mt-2 text-xs'>
                {t('users.fields.performedBy')}:{' '}
                {log.admin.displayName || log.admin.email}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
