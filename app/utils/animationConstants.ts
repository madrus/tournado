/**
 * Shared animation timing constants for consistent animations across components
 *
 * These values are used by AppBar and BottomNavigation components
 * for smooth show/hide transitions on mobile devices.
 */

// Animation durations
export const ANIMATION_DURATION = {
  BOUNCE: '1s',
  SLIDE_OUT: '0.5s',
} as const

// Animation timing functions
export const ANIMATION_TIMING = {
  BOUNCE: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
