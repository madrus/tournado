import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import type { ErrorResponse } from 'react-router'

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

export function AuthErrorBoundary(): JSX.Element {
  const error = useRouteError()
  const { t } = useTranslation()

  if (isRouteErrorResponse(error)) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='flex w-full max-w-md flex-col gap-6'>
          <h1 className='text-2xl font-bold'>{t('auth.errors.title')}</h1>
          <p className='text-gray-500'>{t(getErrorMessageKey(error))}</p>
          <Link to='/' className='text-body-md underline'>
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full items-center justify-center'>
      <div className='flex w-full max-w-md flex-col gap-6'>
        <h1 className='text-2xl font-bold'>{t('auth.errors.title')}</h1>
        <p className='text-gray-500'>
          {t('auth.errors.unexpectedError')}{' '}
          {error instanceof Error ? error.message : t('auth.errors.unknownError')}
        </p>
        <Link to='/' className='text-body-md underline'>
          {t('common.backToHome')}
        </Link>
      </div>
    </div>
  )
}
