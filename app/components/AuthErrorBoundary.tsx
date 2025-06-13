import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { type ErrorResponse, isRouteErrorResponse, useRouteError } from 'react-router'

import { ErrorRecoveryLink } from './PrefetchLink'

// Get the appropriate error message translation key based on the error status
function getErrorMessageKey(error: ErrorResponse): string {
  switch (error.status) {
    case 404:
      return 'auth.errors.notFound'
    case 401:
      return 'auth.errors.unauthorized'
    case 403:
      return 'auth.errors.forbidden'
    default:
      return 'auth.errors.unexpectedError'
  }
}

// Get the appropriate error title translation key based on the error status
function getErrorTitleKey(error: ErrorResponse): string {
  switch (error.status) {
    case 404:
      return 'errors.notFoundTitle'
    case 401:
      return 'auth.errors.unauthorizedTitle'
    case 403:
      return 'auth.errors.forbiddenTitle'
    default:
      return 'errors.errorTitle'
  }
}

export function AuthErrorBoundary(): JSX.Element {
  const error = useRouteError()
  const { t } = useTranslation()

  if (typeof document !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  if (isRouteErrorResponse(error)) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='flex w-full max-w-md flex-col gap-6'>
          <h1 className='text-2xl font-bold'>{t(getErrorTitleKey(error))}</h1>
          <p className='text-foreground-lighter' data-testid='error-paragraph'>
            {t(getErrorMessageKey(error))}
          </p>
          {/* Show status and data for non-404 errors for debugging */}
          {error.status !== 404 ? (
            <p className='text-foreground-lighter text-sm'>{`${error.status} ${error.data}`}</p>
          ) : null}
          <ErrorRecoveryLink to='/' className='text-body-md underline'>
            {t('common.backToHome')}
          </ErrorRecoveryLink>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full items-center justify-center'>
      <div className='flex w-full max-w-md flex-col gap-6'>
        <h1 className='text-2xl font-bold'>{t('errors.errorTitle')}</h1>
        <p className='text-foreground-lighter' data-testid='error-paragraph'>
          {t('auth.errors.unexpectedError')}{' '}
          {error instanceof Error ? error.message : t('auth.errors.unknownError')}
        </p>
        <ErrorRecoveryLink to='/' className='text-body-md underline'>
          {t('common.backToHome')}
        </ErrorRecoveryLink>
      </div>
    </div>
  )
}
