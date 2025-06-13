import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type ErrorResponse,
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from 'react-router'

import { getErrorMessage } from '~/utils/misc'

import { ErrorRecoveryLink } from './PrefetchLink'

type StatusHandler = (info: {
  error: ErrorResponse
  params: Record<string, string | undefined>
}) => JSX.Element | null

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => {
    const { t } = useTranslation()
    return (
      <div className='flex w-full max-w-md flex-col gap-6'>
        <h1 className='text-2xl font-bold'>
          {error.status === 404 ? t('errors.notFoundTitle') : t('errors.errorTitle')}
        </h1>
        <p className='text-foreground-lighter'>
          {error.status === 404
            ? t('auth.errors.notFound')
            : `${error.status} ${error.data}`}
        </p>
        <ErrorRecoveryLink to='/' className='text-body-md underline'>
          {t('common.backToHome')}
        </ErrorRecoveryLink>
      </div>
    )
  },
  statusHandlers,
  unexpectedErrorHandler = error => {
    const { t } = useTranslation()
    return (
      <div className='flex w-full max-w-md flex-col gap-6'>
        <h1 className='text-2xl font-bold'>{t('errors.errorTitle')}</h1>
        <p className='text-foreground-lighter'>{getErrorMessage(error)}</p>
        <ErrorRecoveryLink to='/' className='text-body-md underline'>
          {t('common.backToHome')}
        </ErrorRecoveryLink>
      </div>
    )
  },
}: {
  defaultStatusHandler?: StatusHandler
  statusHandlers?: Record<number, StatusHandler>
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null
}): JSX.Element {
  const error = useRouteError()
  const params = useParams()

  if (typeof document !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  return (
    <div className='container mx-auto flex h-full w-full items-center justify-center p-20'>
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  )
}
