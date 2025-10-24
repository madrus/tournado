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

function DefaultStatusContent({ error }: { error: ErrorResponse }): JSX.Element {
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
}

function DefaultUnexpectedErrorContent({ error }: { error: unknown }): JSX.Element {
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
}

export function GeneralErrorBoundary({
  defaultStatusHandler,
  statusHandlers,
  unexpectedErrorHandler,
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

  let content: JSX.Element | null = null

  if (isRouteErrorResponse(error)) {
    const routeError = error as ErrorResponse
    const statusCode = routeError.status
    const handler = statusHandlers?.[statusCode] ?? defaultStatusHandler

    content = handler ? (
      handler({
        error: routeError,
        params: params as Record<string, string | undefined>,
      })
    ) : (
      <DefaultStatusContent error={routeError} />
    )
  } else {
    content = unexpectedErrorHandler ? (
      unexpectedErrorHandler(error)
    ) : (
      <DefaultUnexpectedErrorContent error={error} />
    )
  }

  return (
    <div className='container mx-auto flex h-full w-full items-center justify-center p-20'>
      {content}
    </div>
  )
}
