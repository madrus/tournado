import { Component, ErrorInfo, type JSX, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type ErrorBoundaryProps = {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

class InternalErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error('Uncaught error in ActionLinkPanel:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  public render(): JSX.Element {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children as JSX.Element
  }
}

function ErrorFallback({ error }: { error: Error | null }): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <div
      role='alert'
      className='border-destructive bg-destructive/10 flex h-full items-center justify-center rounded-lg border p-4'
    >
      <div className='flex w-full max-w-md flex-col gap-6'>
        <h1
          className={cn(
            'text-destructive text-xl font-bold',
            getLatinTitleClass(i18n.language)
          )}
        >
          {t('errors.panelErrorTitle')}
        </h1>
        <p className='text-destructive/80' data-testid='error-paragraph'>
          {t('errors.panelErrorBody')}{' '}
          {error ? <pre className='text-sm'>{error.message}</pre> : null}
        </p>
      </div>
    </div>
  )
}

export default InternalErrorBoundary
