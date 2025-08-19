import { Component, ErrorInfo, type JSX, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type ErrorBoundaryProps = {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

type InternalErrorBoundaryProps = ErrorBoundaryProps & {
  errorTitle: string
  errorMessage: string
  language: string
}

interface State {
  hasError: boolean
  error: Error | null
}

class InternalErrorBoundary extends Component<InternalErrorBoundaryProps, State> {
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
      return (
        <ErrorFallback
          error={this.state.error}
          errorTitle={this.props.errorTitle}
          errorMessage={this.props.errorMessage}
          language={this.props.language}
        />
      )
    }

    return this.props.children as JSX.Element
  }
}

const ErrorFallback = ({
  error,
  errorTitle,
  errorMessage,
  language,
}: {
  error: Error | null
  errorTitle: string
  errorMessage: string
  language: string
}): JSX.Element => (
  <div
    role='alert'
    className='border-destructive bg-destructive/10 flex h-full items-center justify-center rounded-lg border p-4'
  >
    <div className='flex w-full max-w-md flex-col gap-6'>
      <h1
        className={cn(
          'text-destructive text-xl font-bold',
          getLatinTitleClass(language)
        )}
      >
        {errorTitle}
      </h1>
      <p className='text-destructive/80' data-testid='error-paragraph'>
        {errorMessage} {error ? <pre className='text-sm'>{error.message}</pre> : null}
      </p>
    </div>
  </div>
)

// Safe wrapper component that handles translations
export default function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <InternalErrorBoundary
      {...props}
      errorTitle={t('errors.panelErrorTitle')}
      errorMessage={t('errors.panelErrorBody')}
      language={i18n.language}
    />
  )
}
