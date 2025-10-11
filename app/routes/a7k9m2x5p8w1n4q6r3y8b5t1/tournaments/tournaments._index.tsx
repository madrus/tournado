import { JSX, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import {
  redirect,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSubmit,
} from 'react-router'

import { Text } from '@radix-ui/themes'

import { DeleteIcon, TrophyIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import {
  datatableActionButtonVariants,
  datatableCellTextVariants,
  datatableContainerVariants,
  datatableDeleteAreaVariants,
  datatableHeaderTextVariants,
  datatableHeaderVariants,
  datatableRowVariants,
} from '~/components/shared/datatable.variants'
import type { TournamentListItem } from '~/models/tournament.server'
import {
  deleteTournamentById,
  getAllTournamentListItems,
} from '~/models/tournament.server'
import { isBreakpoint, STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { cn } from '~/utils/misc'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'

import type { Route } from './+types/tournaments._index'

// Local constants
const PANEL_COLOR = 'teal' as const

// Route metadata - requires tournaments read permission
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin', 'manager'],
    redirectTo: '/unauthorized',
  },
}

export const meta: MetaFunction = () => [
  { title: 'Tournament Management | Admin | Tournado' },
  {
    name: 'description',
    content:
      'Manage all tournaments in the system. View, edit, delete tournaments and oversee competition details.',
  },
  { property: 'og:title', content: 'Tournament Management | Admin | Tournado' },
  {
    property: 'og:description',
    content:
      'Manage all tournaments in the system. View, edit, delete tournaments and oversee competition details.',
  },
  { property: 'og:type', content: 'website' },
]

type LoaderData = {
  tournamentListItems: TournamentListItem[]
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  // Require permission to read tournaments
  await requireUserWithPermission(request, 'tournaments:read')

  const tournamentListItems = await getAllTournamentListItems()

  return { tournamentListItems }
}

export async function action({ request }: Route.ActionArgs): Promise<Response> {
  // Require permission to delete tournaments
  await requireUserWithPermission(request, 'tournaments:delete')

  const formData = await request.formData()
  const intent = formData.get('intent')
  const tournamentId = formData.get('tournamentId')

  if (intent === 'delete' && typeof tournamentId === 'string') {
    if (!tournamentId.trim()) {
      throw new Response('Tournament ID is required', { status: 400 })
    }
    await deleteTournamentById({ id: tournamentId })
    return redirect('.')
  }

  throw new Response('Bad Request', { status: 400 })
}

export default function AdminTournamentsIndexPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { tournamentListItems } = useLoaderData<LoaderData>()
  const submit = useSubmit()
  const revalidator = useRevalidator()
  const navigate = useNavigate()

  // Track swipe state
  const [swipeStates, setSwipeStates] = useState<
    Record<string, { x: number; swiping: boolean; showDelete: boolean }>
  >({})

  // Ref to track current swipe state for touch events (avoids closure issues)
  const currentSwipeRef = useRef<{
    x: number
    swiping: boolean
    showDelete: boolean
    startingFromDelete: boolean
  }>({
    x: 0,
    swiping: false,
    showDelete: false,
    startingFromDelete: false,
  })

  useEffect(() => {
    const handlePopState = () => {
      revalidator.revalidate()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [revalidator])

  const handleTournamentClick = (tournamentId: string) => {
    // Don't navigate if user is swiping or delete is showing
    const swipeState = swipeStates[tournamentId]
    if (
      swipeState?.swiping ||
      swipeState?.showDelete ||
      Math.abs(swipeState?.x || 0) > 10
    ) {
      return
    }

    // Navigate to tournament details/edit page
    navigate(`/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/${tournamentId}`)
  }

  const handleTournamentDelete = (tournamentId: string) => {
    if (confirm(t('admin.tournament.confirmDelete'))) {
      const formData = new FormData()
      formData.append('intent', 'delete')
      formData.append('tournamentId', tournamentId)
      submit(formData, { method: 'post' })
    }
  }

  // Swipe handlers for mobile
  const handleTouchStart = (event: React.TouchEvent, tournamentId: string) => {
    // Only enable swipe on mobile (below lg breakpoint)
    if (isBreakpoint('lg')) return

    const touch = event.touches[0]
    if (!touch) return
    const startX = touch.clientX

    // Check if we're starting from a delete state
    const currentState = swipeStates[tournamentId]
    const startingFromDelete = currentState?.showDelete || false

    // Initialize swipe state - if starting from delete, keep current position unchanged initially
    const initialState = startingFromDelete
      ? { x: currentState.x, swiping: false, showDelete: true } // Don't set swiping=true immediately
      : { x: 0, swiping: true, showDelete: false }

    currentSwipeRef.current = { ...initialState, startingFromDelete }

    // Only update state if not starting from delete (to prevent text shift)
    if (!startingFromDelete) {
      setSwipeStates(prev => ({
        ...prev,
        [tournamentId]: initialState,
      }))
    }

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0]
      if (!currentTouch) return
      const deltaX = currentTouch.clientX - startX

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
          finalX = currentState.x
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

      setSwipeStates(prev => ({
        ...prev,
        [tournamentId]: { x: finalX, swiping: isSwiping, showDelete },
      }))
    }

    const handleTouchEnd = () => {
      // Use ref to get the most current state (avoids closure issues)
      const endState = currentSwipeRef.current

      if (endState.startingFromDelete) {
        // If we started from delete state
        if (!endState.showDelete) {
          // User swiped right to cancel - force reset to normal position
          setSwipeStates(prev => ({
            ...prev,
            [tournamentId]: { x: 0, swiping: false, showDelete: false },
          }))
        } else {
          // Stay in delete state
          setSwipeStates(prev => ({
            ...prev,
            [tournamentId]: { x: endState.x, swiping: false, showDelete: true },
          }))
        }
      } else {
        // Normal swipe logic
        const snapThreshold = -200 // 50% threshold

        if (endState.x < snapThreshold) {
          // Crossed 50% threshold - snap to delete state
          setSwipeStates(prev => ({
            ...prev,
            [tournamentId]: { x: -400, swiping: false, showDelete: true },
          }))
        } else {
          // Under 50% threshold - snap back to normal
          setSwipeStates(prev => ({
            ...prev,
            [tournamentId]: { x: 0, swiping: false, showDelete: false },
          }))
        }
      }

      // Clean up listeners
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className='space-y-6' data-testid='admin-tournaments-page-content'>
      {/* Stats using optimized dashboard panels */}
      <div
        className={cn('grid w-full grid-cols-1 gap-5 lg:w-fit', STATS_PANEL_MIN_WIDTH)}
      >
        <Panel
          color={PANEL_COLOR}
          variant='dashboard-panel'
          icon={<TrophyIcon size={24} variant='outlined' />}
          iconColor='brand'
          title={t('admin.tournament.totalTournaments')}
          showGlow
          data-testid='tournaments-total-stat'
        >
          {tournamentListItems.length}
        </Panel>
      </div>

      {/* Tournaments List */}
      <div className={cn('w-full lg:w-fit', STATS_PANEL_MIN_WIDTH)}>
        <Panel color={PANEL_COLOR} variant='content-panel'>
          {tournamentListItems.length === 0 ? (
            <div className='py-12 text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100'>
                <TrophyIcon className='text-slate-400' size={24} variant='outlined' />
              </div>
              <p className='mb-2 text-base font-medium text-slate-900'>
                {t('tournaments.noTournaments')}
              </p>
              <p className='mb-6 text-sm text-slate-600'>
                {t('tournaments.noTournamentsDescription')}
              </p>
            </div>
          ) : (
            <div className={datatableContainerVariants({ color: 'slate' })}>
              {/* Header - only show on desktop using CSS */}
              <div
                className={cn(
                  datatableHeaderVariants({ color: 'slate' }),
                  'hidden lg:block'
                )}
              >
                <div className='grid grid-cols-[2fr_1fr_1fr_auto] gap-6'>
                  <div className='flex items-start'>
                    <Text
                      size='1'
                      weight='medium'
                      className={datatableHeaderTextVariants({ color: 'slate' })}
                    >
                      {t('tournaments.name')}
                    </Text>
                  </div>
                  <div className='flex items-start'>
                    <Text
                      size='1'
                      weight='medium'
                      className={datatableHeaderTextVariants({ color: 'slate' })}
                    >
                      {t('tournaments.startDate')}
                    </Text>
                  </div>
                  <div className='flex items-start'>
                    <Text
                      size='1'
                      weight='medium'
                      className={datatableHeaderTextVariants({ color: 'slate' })}
                    >
                      {t('tournaments.endDate')}
                    </Text>
                  </div>
                  <div className='flex w-6 items-start justify-center'>
                    <span className='sr-only'>{t('common.actions')}</span>
                    <DeleteIcon
                      className={cn(
                        'h-4 w-4',
                        datatableHeaderTextVariants({ color: 'slate' })
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Tournament Items */}
              {tournamentListItems.map((tournament, index) => {
                const swipeState = swipeStates[tournament.id] || {
                  x: 0,
                  swiping: false,
                  showDelete: false,
                }

                // Transform logic:
                // - When swiping: use current x position
                // - When in persistent delete state: keep at swiped position
                // - When not in delete state and not swiping: always at position 0
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
                  <div
                    key={tournament.id}
                    className={cn(
                      'relative overflow-hidden',
                      datatableRowVariants({
                        color: 'slate',
                        variant:
                          index === tournamentListItems.length - 1 ? 'last' : 'default',
                      })
                    )}
                  >
                    {/* Mobile: Swipeable layout - hide on desktop */}
                    <div
                      className='flex transition-transform duration-200 lg:hidden'
                      style={{ transform }}
                      onTouchStart={event => handleTouchStart(event, tournament.id)}
                    >
                      {/* Main content - fixed width */}
                      <div
                        className='w-full flex-shrink-0'
                        onClick={() => handleTournamentClick(tournament.id)}
                      >
                        <div className='px-6 py-4'>
                          <div className='flex items-start justify-between'>
                            <div className='min-w-0 flex-1'>
                              <Text
                                size='2'
                                weight='medium'
                                className={cn(
                                  'block',
                                  datatableCellTextVariants({ variant: 'primary' })
                                )}
                              >
                                {tournament.name}
                              </Text>
                              <Text
                                size='1'
                                className={cn(
                                  'mt-1 block',
                                  datatableCellTextVariants({ variant: 'secondary' })
                                )}
                              >
                                {tournament.location}
                              </Text>
                            </div>
                            <div className='ml-4 flex-shrink-0 text-right'>
                              <Text
                                size='2'
                                className={cn(
                                  'block font-medium',
                                  datatableCellTextVariants({ variant: 'primary' })
                                )}
                              >
                                {formatDate(tournament.startDate)}
                              </Text>
                              {tournament.endDate ? (
                                <Text
                                  size='1'
                                  className={cn(
                                    'mt-1 block',
                                    datatableCellTextVariants({ variant: 'secondary' })
                                  )}
                                >
                                  {formatDate(tournament.endDate)}
                                </Text>
                              ) : (
                                <Text
                                  size='1'
                                  className={cn(
                                    'mt-1 block',
                                    datatableCellTextVariants({ variant: 'muted' })
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
                      <div className={datatableDeleteAreaVariants({ color: 'red' })}>
                        <div
                          className='flex cursor-pointer items-center space-x-2 text-white'
                          onClick={event => {
                            event.stopPropagation()
                            handleTournamentDelete(tournament.id)
                          }}
                        >
                          <DeleteIcon className='h-5 w-5' />
                          <Text size='2' weight='medium'>
                            {t('tournaments.deleteTournament')}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Table-like grid layout - hide on mobile */}
                    <div
                      className='hidden grid-cols-[2fr_1fr_1fr_auto] gap-6 px-3 py-4 lg:grid'
                      onClick={() => handleTournamentClick(tournament.id)}
                    >
                      <div className='flex items-start'>
                        <div>
                          <Text
                            size='2'
                            weight='medium'
                            className={datatableCellTextVariants({
                              variant: 'primary',
                            })}
                          >
                            {tournament.name}
                          </Text>
                          <div className='mt-1'>
                            <Text
                              size='1'
                              className={datatableCellTextVariants({
                                variant: 'secondary',
                              })}
                            >
                              {tournament.location}
                            </Text>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-start'>
                        <Text
                          size='2'
                          className={datatableCellTextVariants({
                            variant: 'secondary',
                          })}
                        >
                          {formatDate(tournament.startDate)}
                        </Text>
                      </div>
                      <div className='flex items-start'>
                        <Text
                          size='2'
                          className={datatableCellTextVariants({
                            variant: 'secondary',
                          })}
                        >
                          {tournament.endDate ? formatDate(tournament.endDate) : '-'}
                        </Text>
                      </div>
                      <div className='flex w-6 items-start justify-center'>
                        <button
                          onClick={event => {
                            event.stopPropagation()
                            handleTournamentDelete(tournament.id)
                          }}
                          className={datatableActionButtonVariants({
                            action: 'delete',
                          })}
                          title={t('tournaments.deleteTournament')}
                        >
                          <DeleteIcon className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
