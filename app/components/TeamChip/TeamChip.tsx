import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '~/components/ConfirmDialog'
import { renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { getChipClasses, getLatinTextClass, isRTL } from '~/utils/rtlUtils'

import {
  deleteButtonVariants,
  teamChipVariants,
  type TeamChipVariants,
} from './teamChip.variants'

type TeamChipProps = {
  team: {
    id: string
    clubName: string
    name: string
  }
  onClick?: () => void
  showActions?: boolean // for admin context
  onDelete?: () => void // admin only
  deleteAriaLabel?: string // accessibility text for delete button
  color?: TeamChipVariants['color']
  className?: string
}

export function TeamChip({
  team,
  onClick,
  showActions = false,
  onDelete,
  deleteAriaLabel,
  color = 'brand',
  className = '',
}: TeamChipProps): JSX.Element {
  const { i18n, t } = useTranslation()
  const chipClasses = getChipClasses(i18n.language)
  const isRtl = isRTL(i18n.language)

  const baseClasses = cn(
    teamChipVariants({
      interactive: !!onClick,
      hasActions: showActions && !!onDelete,
      color,
    }),
    showActions && onDelete ? chipClasses.container : undefined,
    className
  )

  // For RTL, we need to explicitly control the order
  const deleteButton =
    showActions && onDelete ? (
      <ConfirmDialog
        intent='danger'
        trigger={
          <button
            onClick={event => {
              event.stopPropagation()
            }}
            className={deleteButtonVariants()}
            aria-label={deleteAriaLabel || `Delete team ${team.clubName} ${team.name}`}
          >
            {renderIcon('close', { className: 'h-4 w-4' })}
          </button>
        }
        title={t('teams.confirmations.deleteTitle', 'Delete team')}
        description={t(
          'teams.confirmations.deleteDescription',
          `Are you sure you want to delete ${team.clubName} ${team.name}? This action cannot be undone.`
        )}
        confirmLabel={t('common.actions.confirm', 'Yes, delete')}
        cancelLabel={t('common.actions.cancel', 'Cancel')}
        destructive
        onConfirm={() => {
          onDelete()
        }}
      />
    ) : null

  const teamText = (
    <span className={cn('truncate', getLatinTextClass(i18n.language))}>
      {`${team.clubName} ${team.name}`}
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
