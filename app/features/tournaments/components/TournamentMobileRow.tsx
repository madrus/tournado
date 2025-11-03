import { JSX, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '@radix-ui/themes'

import { IconLabelButton } from '~/components/buttons/IconLabelButton'
import {
  datatableCellTextVariants,
  datatableDeleteAreaVariants,
} from '~/components/DataTable/dataTable.variants'
import { DeleteIcon } from '~/components/icons'
import type { TournamentListItem } from '~/features/tournaments/types'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'
import { DEFAULT_CONTAINER_WIDTH, SWIPE_START_THRESHOLD } from '~/lib/lib.constants'
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

  // Ref to track the container element for computing swipe distances
  const containerRef = useRef<HTMLDivElement>(null)

  // Ref to track current swipe state for touch events (avoids closure issues)
  const currentSwipeRef = useRef<SwipeState & { startingFromDelete: boolean }>({
    x: 0,
    swiping: false,
    showDelete: false,
    startingFromDelete: false,
  })

  /**
   * Handles touch-based swipe-to-delete gesture on mobile.
   * - Left swipe reveals delete area; crossing 50% threshold snaps to delete state
   * - Right swipe from delete state progressively cancels and returns to normal
   * - Prevents navigation clicks during active swipes
   */
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
      if (Math.abs(deltaX) > SWIPE_START_THRESHOLD) moveEvent.preventDefault()

      let finalX: number
      let showDelete: boolean
      let isSwiping: boolean

      if (startingFromDelete) {
        // If we started from delete state, positive normalized deltaX cancels the delete
        if (Math.abs(deltaX) > SWIPE_START_THRESHOLD) {
          // Only start swiping if moved more than SWIPE_START_THRESHOLD px
          isSwiping = true

          // Calculate progressive position based on container width
          const containerWidth =
            containerRef.current?.clientWidth || DEFAULT_CONTAINER_WIDTH
          const maxCancelSwipe = containerWidth // How far to swipe to fully cancel
          const progress =
            Math.min(Math.max(deltaX, 0), maxCancelSwipe) / maxCancelSwipe // 0 to 1
          finalX = -containerWidth + containerWidth * progress // Move from -containerWidth to 0 progressively

          // Show delete state until we cross the 50% threshold
          showDelete = finalX < -containerWidth / 2 // 50% threshold
        } else {
          // No significant movement - keep current state
          finalX = swipeState.x
          showDelete = true
          isSwiping = false
        }
      } else {
        // Normal swipe logic
        isSwiping = true
        const containerWidth =
          containerRef.current?.clientWidth || DEFAULT_CONTAINER_WIDTH
        const maxSwipeLeft = -containerWidth
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
        const containerWidth =
          containerRef.current?.clientWidth || DEFAULT_CONTAINER_WIDTH
        const snapThreshold = -containerWidth / 2 // 50% threshold

        if (endState.x < snapThreshold) {
          // Crossed 50% threshold - snap to delete state
          setSwipeState({ x: -containerWidth, swiping: false, showDelete: true })
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
      Math.abs(swipeState.x || 0) > SWIPE_START_THRESHOLD
    ) {
      return
    }

    onClick(tournament.id)
  }

  // Transform logic:
  // - When swiping: use current x position (already normalized with directionMultiplier in handleTouchMove)
  // - When in persistent delete state: keep at swiped position (already normalized)
  // - When not in delete state and not swiping: always at position 0
  // Note: directionMultiplier is applied once during deltaX calculation (line 82), not here
  let transform: string
  if (swipeState.swiping) {
    // During active swipe - use current position
    transform = `translateX(${swipeState.x}px)`
  } else if (swipeState.showDelete) {
    // In persistent delete state - use stored position
    transform = `translateX(${swipeState.x}px)`
  } else {
    // Normal state - always at position 0
    transform = 'translateX(0px)'
  }

  return (
    <div className='relative overflow-hidden'>
      <div
        ref={containerRef}
        className='flex transition-transform duration-200'
        style={{ transform, willChange: 'transform' }}
        onTouchStart={handleTouchStart}
      >
        {/* Main content - fixed width */}
        <div
          className='w-full flex-shrink-0'
          onClick={handleClick}
          role='button'
          tabIndex={0}
        >
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
