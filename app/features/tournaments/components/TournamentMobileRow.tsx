import { JSX, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '@radix-ui/themes'

import { IconLabelButton } from '~/components/buttons/IconLabelButton'
import { DeleteIcon } from '~/components/icons'
import {
  datatableCellTextVariants,
  datatableDeleteAreaVariants,
} from '~/components/shared/datatable.variants'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'
import type { TournamentListItem } from '~/models/tournament.server'
import { isBreakpoint } from '~/styles/constants'
import { cn } from '~/utils/misc'

type TournamentMobileRowProps = {
  tournament: TournamentListItem
  onDelete: (id: string) => void
  onClick: (id: string) => void
  formatDate: (date: Date | string) => string
}

type SwipeState = {
  x: number
  swiping: boolean
  showDelete: boolean
}

export function TournamentMobileRow({
  tournament,
  onDelete,
  onClick,
  formatDate,
}: Readonly<TournamentMobileRowProps>): JSX.Element {
  const { t } = useTranslation()
  const { latinFontClass, swipeConfig } = useLanguageDirection()
  const { directionMultiplier } = swipeConfig
  const [swipeState, setSwipeState] = useState<SwipeState>({
    x: 0,
    swiping: false,
    showDelete: false,
  })

  // Ref to track current swipe state for touch events (avoids closure issues)
  const currentSwipeRef = useRef<SwipeState & { startingFromDelete: boolean }>({
    x: 0,
    swiping: false,
    showDelete: false,
    startingFromDelete: false,
  })

  const handleTouchStart = (event: React.TouchEvent) => {
    // Only enable swipe on mobile (below lg breakpoint)
    if (isBreakpoint('lg')) return

    const touch = event.touches[0]
    if (!touch) return
    const startX = touch.clientX

    // Check if we're starting from a delete state
    const startingFromDelete = swipeState.showDelete || false

    // Initialize swipe state - if starting from delete, keep current position unchanged initially
    const initialState = startingFromDelete
      ? { x: swipeState.x, swiping: false, showDelete: true } // Don't set swiping=true immediately
      : { x: 0, swiping: true, showDelete: false }

    currentSwipeRef.current = { ...initialState, startingFromDelete }

    // Only update state if not starting from delete (to prevent text shift)
    if (!startingFromDelete) {
      setSwipeState(initialState)
    }

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0]
      if (!currentTouch) return
      const deltaX = (currentTouch.clientX - startX) * directionMultiplier

      // Prevent vertical scroll during meaningful horizontal swipe
      if (Math.abs(deltaX) > 10) moveEvent.preventDefault()

      let finalX: number
      let showDelete: boolean
      let isSwiping: boolean

      if (startingFromDelete) {
        // If we started from delete state, right swipe should cancel
        if (Math.abs(deltaX) > 10) {
          // Only start swiping if moved more than 10px
          isSwiping = true

          // Calculate progressive position: start from -400, move toward 0 based on deltaX
          const maxRightSwipe = 400 // How far right you can swipe to fully cancel
          const progress = Math.min(Math.max(deltaX, 0), maxRightSwipe) / maxRightSwipe // 0 to 1
          finalX = -400 + 400 * progress // Move from -400 to 0 progressively

          // Show delete state until we cross the 50% threshold
          showDelete = finalX < -200 // 50% threshold
        } else {
          // No significant movement - keep current state
          finalX = swipeState.x
          showDelete = true
          isSwiping = false
        }
      } else {
        // Normal swipe logic
        isSwiping = true
        const maxSwipeLeft = -400
        const maxSwipeRight = 50

        let clampedX = deltaX
        if (deltaX < 0) {
          clampedX = Math.max(deltaX, maxSwipeLeft)
        } else {
          clampedX = Math.min(deltaX, maxSwipeRight)
        }

        finalX = clampedX
        showDelete = clampedX < -50 // Show delete area when swiped left
      }

      // Update ref with current state
      currentSwipeRef.current = {
        x: finalX,
        swiping: isSwiping,
        showDelete,
        startingFromDelete,
      }

      setSwipeState({ x: finalX, swiping: isSwiping, showDelete })
    }

    const handleTouchEnd = () => {
      // Use ref to get the most current state (avoids closure issues)
      const endState = currentSwipeRef.current

      if (endState.startingFromDelete) {
        // If we started from delete state
        if (!endState.showDelete) {
          // User swiped right to cancel - force reset to normal position
          setSwipeState({ x: 0, swiping: false, showDelete: false })
        } else {
          // Stay in delete state
          setSwipeState({ x: endState.x, swiping: false, showDelete: true })
        }
      } else {
        // Normal swipe logic
        const snapThreshold = -200 // 50% threshold

        if (endState.x < snapThreshold) {
          // Crossed 50% threshold - snap to delete state
          setSwipeState({ x: -400, swiping: false, showDelete: true })
        } else {
          // Under 50% threshold - snap back to normal
          setSwipeState({ x: 0, swiping: false, showDelete: false })
        }
      }

      // Clean up listeners
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleTouchEnd)
  }

  const handleClick = () => {
    // Don't navigate if user is swiping or delete is showing
    if (
      swipeState.swiping ||
      swipeState.showDelete ||
      Math.abs(swipeState.x || 0) > 10
    ) {
      return
    }

    onClick(tournament.id)
  }

  // Transform logic:
  // - When swiping: use current x position multiplied by directionMultiplier
  // - When in persistent delete state: keep at swiped position multiplied by directionMultiplier
  // - When not in delete state and not swiping: always at position 0
  // directionMultiplier: 1 for LTR (left swipe), -1 for RTL (right swipe)
  let transform: string
  if (swipeState.swiping) {
    // During active swipe - use current position
    transform = `translateX(${swipeState.x * directionMultiplier}px)`
  } else if (swipeState.showDelete) {
    // In persistent delete state - use stored position
    transform = `translateX(${swipeState.x * directionMultiplier}px)`
  } else {
    // Normal state - always at position 0
    transform = 'translateX(0px)'
  }

  return (
    <div className='relative overflow-hidden'>
      <div
        className='flex transition-transform duration-200'
        style={{ transform, willChange: 'transform' }}
        onTouchStart={handleTouchStart}
      >
        {/* Main content - fixed width */}
        <div className='w-full flex-shrink-0' onClick={handleClick}>
          <div className='px-6 py-4'>
            <div className='flex items-start justify-between'>
              <div className='min-w-0 flex-1'>
                <Text
                  size='2'
                  weight='medium'
                  className={cn(
                    'block',
                    datatableCellTextVariants({ variant: 'primary' }),
                    latinFontClass
                  )}
                >
                  {tournament.name}
                </Text>
                <Text
                  size='1'
                  className={cn(
                    'mt-1 block',
                    datatableCellTextVariants({ variant: 'secondary' }),
                    latinFontClass
                  )}
                >
                  {tournament.location}
                </Text>
              </div>
              <div className='ms-4 flex-shrink-0 text-end'>
                <Text
                  size='2'
                  className={cn(
                    'block font-medium',
                    datatableCellTextVariants({ variant: 'primary' }),
                    latinFontClass
                  )}
                >
                  {formatDate(tournament.startDate)}
                </Text>
                {tournament.endDate ? (
                  <Text
                    size='1'
                    className={cn(
                      'mt-1 block',
                      datatableCellTextVariants({ variant: 'secondary' }),
                      latinFontClass
                    )}
                  >
                    {formatDate(tournament.endDate)}
                  </Text>
                ) : (
                  <Text
                    size='1'
                    className={cn(
                      'mt-1 block',
                      datatableCellTextVariants({ variant: 'muted' }),
                      latinFontClass
                    )}
                  >
                    -
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Red delete area - fixed width */}
        <div
          className={datatableDeleteAreaVariants({ color: 'red', justify: 'start' })}
        >
          <IconLabelButton
            icon={<DeleteIcon className='h-6 w-6 text-white' />}
            label={t('common.actions.delete')}
            onClick={event => {
              event.stopPropagation()
              onDelete(tournament.id)
            }}
            aria-label={t('tournaments.deleteTournament')}
            className='ps-3'
          />
        </div>
      </div>
    </div>
  )
}
