import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { type ErrorResponse, isRouteErrorResponse, useRouteError } from 'react-router'

import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

import { ErrorRecoveryLink } from './PrefetchLink'

// Get the appropriate error message translation key based on the error status
function getErrorMessageKey(error: ErrorResponse): string {
	switch (error.status) {
		case 404:
			return 'messages.auth.notFound'
		case 401:
			return 'messages.auth.unauthorized'
		case 403:
			return 'messages.auth.forbidden'
		default:
			return 'messages.common.unexpectedError'
	}
}

// Get the appropriate error title translation key based on the error status
function getErrorTitleKey(error: ErrorResponse): string {
	switch (error.status) {
		case 404:
			return 'messages.common.notFoundTitle'
		case 401:
			return 'messages.auth.unauthorizedTitle'
		case 403:
			return 'messages.auth.forbiddenTitle'
		default:
			return 'messages.common.errorTitle'
	}
}

export function AuthErrorBoundary(): JSX.Element {
	const error = useRouteError()
	const { t } = useTranslation()

	if (isRouteErrorResponse(error)) {
		return (
			<div className='flex h-full items-center justify-center'>
				<div className='flex w-full max-w-md flex-col gap-6'>
					<h1 className={cn('font-bold text-2xl', getLatinTitleClass())}>
						{t(getErrorTitleKey(error))}
					</h1>
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
				<h1 className={cn('font-bold text-2xl', getLatinTitleClass())}>
					{t('messages.common.errorTitle')}
				</h1>
				<p className='text-foreground-lighter' data-testid='error-paragraph'>
					{t('messages.common.unexpectedError')}{' '}
					{error instanceof Error ? error.message : t('messages.common.unknownError')}
				</p>
				<ErrorRecoveryLink to='/' className='text-body-md underline'>
					{t('common.backToHome')}
				</ErrorRecoveryLink>
			</div>
		</div>
	)
}
