/**
 * Layout and styling constants used across the application
 * Ensures consistent spacing and alignment between components
 */

// Horizontal padding/margins for main content areas - responsive three-tier system
export const CONTENT_PX = 'px-2 md:px-8 lg:px-16' // 8px mobile, 32px tablet, 64px desktop

// Container constraints
export const CONTENT_MIN_WIDTH = 'min-w-[320px]'

// Common layout classes that should be used consistently
export const CONTENT_CONTAINER_CLASSES = `mx-auto ${CONTENT_MIN_WIDTH} ${CONTENT_PX}`

// CSS custom property for consistent horizontal padding
export const CONTENT_PX_VALUE = '1rem' // 16px
