/**
 * Shared animation timing constants for consistent animations across components
 *
 * These values are used by AppBar and BottomNavigation components
 * for smooth show/hide transitions on mobile devices.
 */

// Animation durations - synchronized with CSS
export const ANIMATION_DURATION = {
	BOUNCE: '0.6s',
	SLIDE_OUT: '0.3s',
} as const

// Animation timing constants for reusability
export const CUBIC_BEZIER_SMOOTH = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' as const

// Animation timing functions - synchronized with CSS
export const ANIMATION_TIMING = {
	BOUNCE: CUBIC_BEZIER_SMOOTH,
	SLIDE_OUT: 'ease-out',
} as const

// Complete animation declarations for CSS
export const ANIMATIONS = {
	APP_BAR: {
		BOUNCE: `appBarBounce ${ANIMATION_DURATION.BOUNCE} ${ANIMATION_TIMING.BOUNCE} forwards`,
		SLIDE_OUT: `appBarSlideOut ${ANIMATION_DURATION.SLIDE_OUT} ${ANIMATION_TIMING.SLIDE_OUT} forwards`,
	},
	BOTTOM_NAV: {
		BOUNCE: `bottomNavBounce ${ANIMATION_DURATION.BOUNCE} ${ANIMATION_TIMING.BOUNCE} forwards`,
		SLIDE_OUT: `bottomNavSlideOut ${ANIMATION_DURATION.SLIDE_OUT} ${ANIMATION_TIMING.SLIDE_OUT} forwards`,
	},
} as const

// CSS class names for animations (to be used with CSS classes)
export const ANIMATION_CLASSES = {
	APP_BAR: {
		VISIBLE: 'app-bar-visible',
		HIDDEN: 'app-bar-hidden',
		BOUNCE: 'app-bar-bounce',
		SLIDE_OUT: 'app-bar-slide-out',
	},
	BOTTOM_NAV: {
		VISIBLE: 'bottom-nav-visible',
		HIDDEN: 'bottom-nav-hidden',
		BOUNCE: 'bottom-nav-bounce',
		SLIDE_OUT: 'bottom-nav-slide-out',
	},
} as const

/**
 * Type definitions for animation keys
 */
export type AnimationState = 'visible' | 'hidden'
export type AnimationType = 'bounce' | 'slideOut'
export type ComponentType = 'APP_BAR' | 'BOTTOM_NAV'

/**
 * More specific animation class type based on actual structure
 */
export type AnimationClass =
	(typeof ANIMATION_CLASSES)[ComponentType][keyof (typeof ANIMATION_CLASSES)[ComponentType]]

/**
 * Animation duration values
 */
export type AnimationDuration =
	(typeof ANIMATION_DURATION)[keyof typeof ANIMATION_DURATION]

/**
 * Animation timing function values
 */
export type AnimationTiming = (typeof ANIMATION_TIMING)[keyof typeof ANIMATION_TIMING]
