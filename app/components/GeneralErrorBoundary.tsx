import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type ErrorResponse,
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from 'react-router'

import { cn, getErrorMessage } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

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
        <h1 className={cn('text-2xl font-bold', getLatinTitleClass())}>
          {error.status === 404
            ? t('messages.common.notFoundTitle')
            : t('messages.common.errorTitle')}
        </h1>
        <p className='text-foreground-lighter'>
          {error.status === 404
            ? t('messages.auth.notFound')
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
        <h1 className={cn('text-2xl font-bold', getLatinTitleClass())}>
          {t('messages.common.errorTitle')}
        </h1>
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
  // Call hooks unconditionally at top level (required by React rules)
  const error = useRouteError()
  const params = useParams()

  if (typeof document !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  return (
    <div className='container mx-auto flex h-full w-full items-center justify-center p-20'>
      {isRouteErrorResponse(error as unknown)
        ? (statusHandlers?.[(error as ErrorResponse).status] ?? defaultStatusHandler)({
            error: error as ErrorResponse,
            params: params as Record<string, string | undefined>,
          })
        : unexpectedErrorHandler(error)}
    </div>
  )
}
