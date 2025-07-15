import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { getChipClasses, getLatinTextClass, isRTL } from '~/utils/rtlUtils'

type TeamChipProps = {
  team: {
    id: string
    clubName: string
    teamName: string
  }
  onClick?: () => void
  showActions?: boolean // for admin context
  onDelete?: () => void // admin only
  deleteAriaLabel?: string // accessibility text for delete button
  className?: string
}

export function TeamChip({
  team,
  onClick,
  showActions = false,
  onDelete,
  deleteAriaLabel,
  className = '',
}: TeamChipProps): JSX.Element {
  const { i18n } = useTranslation()
  const chipClasses = getChipClasses(i18n.language)
  const isRtl = isRTL(i18n.language)

  const baseClasses = cn(
    'inline-flex h-10 items-center rounded-lg border border-red-600 dark:!border-slate-100 bg-background dark:bg-brand-700',
    'font-semibold text-brand transition-all duration-300 ease-out relative overflow-hidden',
    onClick && 'cursor-pointer',
    showActions && onDelete ? chipClasses.container : 'px-3',
    'hover:scale-105 active:scale-95',
    'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/40 hover:bg-accent hover:border-brand-accent dark:hover:bg-brand-700',
    'focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-white dark:focus:ring-slate-100 dark:focus:ring-offset-red-600 focus:outline-none',
    'hover:ring-2 hover:ring-offset-2 hover:ring-red-600 hover:ring-offset-white dark:hover:ring-slate-100 dark:hover:ring-offset-red-600',
    className
  )

  // For RTL, we need to explicitly control the order
  const deleteButton =
    showActions && onDelete ? (
      <button
        onClick={event => {
          event.stopPropagation()
          onDelete()
        }}
        className='text-brand hover:bg-accent hover:text-brand-accent dark:hover:bg-brand-700 flex-shrink-0 rounded-full p-1'
        aria-label={deleteAriaLabel || `Delete team ${team.clubName} ${team.teamName}`}
      >
        {renderIcon('close', { className: 'h-4 w-4' })}
      </button>
    ) : null

  const teamText = (
    <span className={cn('truncate', getLatinTextClass(i18n.language))}>
      {`${team.clubName} ${team.teamName}`}
    </span>
  )

  // In RTL, we want delete button first, then text
  // In LTR, we want text first, then delete button
  const chipContent = isRtl ? (
    <>
      {deleteButton}
      {teamText}
    </>
  ) : (
    <>
      {teamText}
      {deleteButton}
    </>
  )

  if (showActions) {
    // Admin: outer is a div with button role, inner delete is a real button
    return (
      <div
        className={baseClasses}
        role='button'
        tabIndex={0}
        onClick={onClick}
        onKeyDown={event => {
          if (onClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            onClick()
          }
        }}
        aria-pressed='false'
        data-testid='team-chip'
      >
        {chipContent}
      </div>
    )
  }

  if (onClick) {
    // Non-admin: outer is a real button
    return (
      <button
        onClick={onClick}
        className={baseClasses}
        type='button'
        data-testid='team-chip'
      >
        {chipContent}
      </button>
    )
  }

  return (
    <div className={baseClasses} data-testid='team-chip'>
      {chipContent}
    </div>
  )
}
