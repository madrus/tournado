import { useCallback, useRef, useState } from 'react'
import { getScrollY } from '~/utils/domUtils'

// Constants for bounce detection
const BOUNCE_VELOCITY_THRESHOLD = 15 // Minimum velocity for intentional bounce
const BOUNCE_DRAG_THRESHOLD = 30 // Minimum drag distance for bounce detection
const BOTTOM_PROXIMITY_THRESHOLD = 5 // Pixels from bottom to consider "at bottom"
const MOMENTUM_SETTLE_TIMEOUT = 300 // Time to wait for iOS momentum scrolling to settle (ms)
const BOUNCE_RESET_THRESHOLD = 10 // Pixels from bottom to reset bounce state
const BOUNCE_SAFETY_TIMEOUT = 800 // Max time to keep bounce state active (ms)

/**
 * Custom hook for bounce detection logic on iOS devices
 * Handles touch events and bounce state management
 *
 * @param isIOS - Whether the current device is iOS
 * @param isMobile - Whether the current device is mobile
 * @param documentHeightRef - Reference to cached document height
 * @param windowHeightRef - Reference to cached window height
 * @returns Object containing bounce state and event handlers
 */
export const useBounceDetection = (
	isIOS: boolean,
	isMobile: boolean,
	documentHeightRef: React.MutableRefObject<number>,
	windowHeightRef: React.MutableRefObject<number>,
): {
	isBouncingBottom: boolean
	handleTouchStart: (event: TouchEvent) => void
	handleTouchMove: (event: TouchEvent) => void
	handleTouchEnd: () => void
	handleVisibilityChange: () => void
	resetBounceState: () => void
	cleanup: () => void
} => {
	const lastTouchY = useRef<number | null>(null)
	const touchStartY = useRef<number | null>(null)
	const touchVelocity = useRef<number>(0)
	const lastTouchTime = useRef<number>(0)
	const isTouching = useRef<boolean>(false)
	const isBouncingBottom = useRef<boolean>(false)
	const [isBouncingBottomState, setIsBouncingBottomState] = useState<boolean>(false)
	const bounceTimeoutRef = useRef<number | null>(null)
	const bounceSettleTimeoutRef = useRef<number | null>(null)

	/**
	 * Determines if current touch interaction should trigger bounce detection
	 * @param currentY Current touch Y position
	 * @param deltaY Change in Y position since last touch
	 * @param scrollY Current scroll position
	 * @param maxScrollY Maximum scrollable position
	 * @returns boolean indicating if bounce should be triggered
	 */
	const shouldTriggerBounce = useCallback(
		(
			currentY: number,
			deltaY: number,
			scrollY: number,
			maxScrollY: number,
		): boolean => {
			// Only consider bounce on iOS devices
			if (!isIOS) return false

			// Must be at bottom of page and dragging upward
			if (!(scrollY >= maxScrollY - BOTTOM_PROXIMITY_THRESHOLD && deltaY < 0)) {
				return false
			}

			// Fix: Only calculate drag distance if we have a valid touchStartY
			// This prevents the calculation from always being zero when touchStartY is null
			const totalDragDistance =
				touchStartY.current !== null ? Math.abs(touchStartY.current - currentY) : 0
			const hasHighVelocity = touchVelocity.current > BOUNCE_VELOCITY_THRESHOLD
			const hasSufficientDrag = totalDragDistance > BOUNCE_DRAG_THRESHOLD

			// Only trigger for deliberate, sustained drags (not natural overscroll)
			return hasHighVelocity && hasSufficientDrag
		},
		[isIOS],
	)

	// Shared function to reset bounce state
	const resetBounceState = useCallback(() => {
		isBouncingBottom.current = false
		setIsBouncingBottomState(false)
		if (bounceTimeoutRef.current) {
			clearTimeout(bounceTimeoutRef.current)
			bounceTimeoutRef.current = null
		}
		if (bounceSettleTimeoutRef.current) {
			clearTimeout(bounceSettleTimeoutRef.current)
			bounceSettleTimeoutRef.current = null
		}
	}, [])

	const handleTouchStart = useCallback((event: TouchEvent) => {
		if (event.touches.length === 0) return

		isTouching.current = true
		lastTouchY.current = event.touches[0].clientY
		touchStartY.current = event.touches[0].clientY
		touchVelocity.current = 0
		lastTouchTime.current = Date.now()
	}, [])

	const handleTouchMove = useCallback(
		(event: TouchEvent) => {
			if (!isMobile || lastTouchY.current === null || event.touches.length === 0) return

			const currentY = event.touches[0].clientY
			const deltaY = currentY - lastTouchY.current
			const currentTime = Date.now()
			const timeDiff = currentTime - lastTouchTime.current

			// Calculate velocity (pixels per millisecond)
			if (timeDiff > 0) {
				touchVelocity.current = Math.abs(deltaY) / timeDiff
			}

			lastTouchY.current = currentY
			lastTouchTime.current = currentTime

			const y = getScrollY()
			const maxScrollY = Math.max(
				0,
				documentHeightRef.current - windowHeightRef.current,
			)

			// Check if this interaction should trigger bounce detection
			if (shouldTriggerBounce(currentY, deltaY, y, maxScrollY)) {
				isBouncingBottom.current = true
				setIsBouncingBottomState(true)

				// Clear any existing timeout
				if (bounceTimeoutRef.current) {
					clearTimeout(bounceTimeoutRef.current)
				}

				// Set safety timeout to prevent stuck bounce state
				bounceTimeoutRef.current = window.setTimeout(() => {
					isBouncingBottom.current = false
					setIsBouncingBottomState(false)
					bounceTimeoutRef.current = null
				}, BOUNCE_SAFETY_TIMEOUT)
			} else {
				// Fix: Reset bounce state if we're at the bottom but don't meet thresholds
				// This prevents the bounce state from getting stuck on iOS
				const isAtBottom = y >= maxScrollY - BOTTOM_PROXIMITY_THRESHOLD
				const isDraggingUp = deltaY < 0

				if (isIOS && isAtBottom && isDraggingUp && isBouncingBottom.current) {
					// Check if we have insufficient velocity or drag distance
					const totalDragDistance =
						touchStartY.current !== null ? Math.abs(touchStartY.current - currentY) : 0
					const hasLowVelocity = touchVelocity.current <= BOUNCE_VELOCITY_THRESHOLD
					const hasInsufficientDrag = totalDragDistance <= BOUNCE_DRAG_THRESHOLD

					// Reset bounce state if thresholds aren't met
					if (hasLowVelocity || hasInsufficientDrag) {
						resetBounceState()
					}
				} else if (!isIOS) {
					// For non-iOS devices, reset bounce state more aggressively
					resetBounceState()
				}
			}
		},
		[
			isMobile,
			isIOS,
			resetBounceState,
			shouldTriggerBounce,
			documentHeightRef,
			windowHeightRef,
		],
	)

	const handleTouchEnd = useCallback(() => {
		isTouching.current = false
		lastTouchY.current = null
		touchStartY.current = null
		touchVelocity.current = 0

		// On iOS, don't immediately reset bounce state as momentum scrolling continues
		// Instead, wait for scroll momentum to settle
		if (isIOS && isBouncingBottom.current) {
			// Give iOS momentum scrolling time to settle
			bounceSettleTimeoutRef.current = window.setTimeout(() => {
				// Check if we're still at the bottom after momentum settles
				const y = getScrollY()
				const maxScrollY = Math.max(
					0,
					documentHeightRef.current - windowHeightRef.current,
				)

				// Only reset if we're no longer at the bottom
				if (y < maxScrollY - BOUNCE_RESET_THRESHOLD) {
					resetBounceState()
				}
			}, MOMENTUM_SETTLE_TIMEOUT) // Wait for momentum to settle
		} else {
			// For non-iOS or non-bouncing states, reset immediately
			resetBounceState()
		}
	}, [isIOS, resetBounceState, documentHeightRef, windowHeightRef])

	// Reset bounce state when page loses focus to prevent stuck state
	const handleVisibilityChange = useCallback(() => {
		if (document.hidden) {
			resetBounceState()
		}
	}, [resetBounceState])

	// Cleanup function for timeouts
	const cleanup = useCallback(() => {
		// Clear bounce timeouts
		if (bounceTimeoutRef.current) {
			clearTimeout(bounceTimeoutRef.current)
			bounceTimeoutRef.current = null
		}
		if (bounceSettleTimeoutRef.current) {
			clearTimeout(bounceSettleTimeoutRef.current)
			bounceSettleTimeoutRef.current = null
		}
	}, [])

	return {
		isBouncingBottom: isBouncingBottomState,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleVisibilityChange,
		resetBounceState,
		cleanup,
	}
}
