import type { JSX, ReactNode } from 'react'
import { cn } from '~/utils/misc'
import { ErrorIcon } from './icons'

type ErrorMessageProps = {
  children: ReactNode
  panelColor: string
  variant?: 'adaptive' | 'inline' | 'prominent'
  className?: string
  id?: string
}

export function ErrorMessage({
  children,
  panelColor,
  variant = 'adaptive',
  className = '',
  id,
}: ErrorMessageProps): JSX.Element {
  // Smart color selection based on panel color for maximum accessibility
  const getErrorStyling = (
    color: string,
    variantType: 'adaptive' | 'inline' | 'prominent',
  ): string => {
    const baseClasses = 'mt-2 px-3 py-2 rounded-md text-sm font-medium'

    switch (variantType) {
      case 'inline':
        // Subtle inline styling
        switch (color) {
          case 'red':
            return `${baseClasses} error-message-white bg-red-900/90 border border-red-800`
          case 'amber':
            return `${baseClasses} error-message-amber bg-amber-50 border border-amber-300`
          case 'indigo':
            return `${baseClasses} error-message-indigo bg-indigo-900/90 border border-indigo-800`
          case 'fuchsia':
            return `${baseClasses} error-message-fuchsia bg-fuchsia-900/90 border border-fuchsia-800`
          case 'slate':
            return `${baseClasses} error-message-slate bg-slate-50 border border-slate-300`
          default:
            return `${baseClasses} error-message-red bg-red-100 border border-red-300`
        }

      case 'prominent':
        // More prominent styling with stronger contrast
        switch (color) {
          case 'red':
            return `${baseClasses} error-message-white bg-red-800 border-2 border-red-700 shadow-lg`
          case 'amber':
            return `${baseClasses} error-message-amber bg-amber-100 border-2 border-amber-400 shadow-lg`
          case 'indigo':
            return `${baseClasses} error-message-indigo bg-indigo-800 border-2 border-indigo-700 shadow-lg`
          case 'fuchsia':
            return `${baseClasses} error-message-fuchsia bg-fuchsia-800 border-2 border-fuchsia-700 shadow-lg`
          case 'slate':
            return `${baseClasses} error-message-slate bg-slate-100 border-2 border-slate-400 shadow-lg`
          default:
            return `${baseClasses} error-message-red bg-red-100 border-2 border-red-400 shadow-lg`
        }

      default:
        // Adaptive variant - adjusts based on panel color
        switch (color) {
          case 'red':
            // On red panel: use WHITE text with dark background for maximum contrast
            return `${baseClasses} error-message-white bg-red-900/95 border border-red-800 shadow-md`
          case 'amber':
            // On amber panel: use DARK text with light background
            return `${baseClasses} error-message-amber bg-amber-50 border border-amber-300 shadow-md`
          case 'indigo':
            // On indigo panel: use WHITE text with dark background
            return `${baseClasses} error-message-indigo bg-indigo-900/95 border border-indigo-800 shadow-md`
          case 'fuchsia':
            // On fuchsia panel: use WHITE text with dark background
            return `${baseClasses} error-message-fuchsia bg-fuchsia-900/95 border border-fuchsia-800 shadow-md`
          case 'slate':
            // On slate panel: use standard high contrast styling
            return `${baseClasses} error-message-slate bg-slate-50 border border-slate-300 shadow-md`
          case 'sky':
            // On sky panel: use DARK text with light background
            return `${baseClasses} error-message-sky bg-sky-50 border border-sky-300 shadow-md`
          default:
            // Fallback: high contrast red
            return `${baseClasses} error-message-red bg-red-100 border border-red-300 shadow-md`
        }
    }
  }

  const errorStyling = getErrorStyling(panelColor, variant)

  return (
    <div
      className={cn(errorStyling, 'flex items-start gap-2', className)}
      role='alert'
      aria-live='polite'
      id={id}
    >
      {/* Error icon for non-color accessibility */}
      <ErrorIcon className='mt-0.5 h-4 w-4 shrink-0' size={16} />
      <span>{children}</span>
    </div>
  )
}
