/**
 * Layout and styling constants used across the application
 * Ensures consistent spacing and alignment between components
 */

// Horizontal padding/margins for main content areas - responsive three-tier system
export const CONTENT_PX = 'px-4 md:px-8 lg:px-16' // 8px mobile, 32px tablet, 64px desktop

// Container constraints
export const CONTENT_MIN_WIDTH = 'min-w-[320px]'
export const CONTENT_MAX_WIDTH = 'max-w-7xl' // Prevent content stretching on large screens

// Common layout classes that should be used consistently
export const CONTENT_CONTAINER_CLASSES = `mx-auto ${CONTENT_MIN_WIDTH} ${CONTENT_MAX_WIDTH} ${CONTENT_PX}`
