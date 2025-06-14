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
  className?: string
}

export function TeamChip({
  team,
  onClick,
  showActions = false,
  onDelete,
  className = '',
}: TeamChipProps): JSX.Element {
  const { i18n } = useTranslation()
  const chipClasses = getChipClasses(i18n.language)
  const isRtl = isRTL(i18n.language)

  const baseClasses = cn(
    'inline-flex h-10 items-center rounded-lg border border-red-300 bg-white',
    'font-medium text-red-700 shadow-sm transition-all duration-200',
    'hover:border-red-300 hover:shadow-md hover:bg-red-50',
    onClick && 'cursor-pointer',
    showActions && onDelete ? chipClasses.container : 'px-3',
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
        className='flex-shrink-0 rounded-full p-1 text-red-500 hover:bg-red-50 hover:text-red-700'
        aria-label={`Delete team ${team.clubName} ${team.teamName}`}
        title='Delete team'
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
      >
        {chipContent}
      </div>
    )
  }

  if (onClick) {
    // Non-admin: outer is a real button
    return (
      <button onClick={onClick} className={baseClasses} type='button'>
        {chipContent}
      </button>
    )
  }

  return <div className={baseClasses}>{chipContent}</div>
}
