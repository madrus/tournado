/**
 * DOM utility functions for browser environment
 */

/**
 * Gets the current scroll Y position in a cross-browser compatible way
 * @returns The current vertical scroll position in pixels
 */
export function getScrollY(): number {
  if (typeof window === 'undefined') return 0
  return (
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

/**
 * Gets the total document height in a cross-browser compatible way
 * @returns The total document height in pixels
 */
export function getDocumentHeight(): number {
  if (typeof window === 'undefined') return 0
  return Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  )
}

/**
 * Calculates the maximum scrollable distance
 * @returns The maximum scroll Y position in pixels
 */
export function getMaxScrollY(): number {
  if (typeof window === 'undefined') return 0
  return Math.max(0, getDocumentHeight() - window.innerHeight)
}

/**
 * Checks if the current page has enough content to be scrollable
 * @returns true if the page is scrollable, false otherwise
 */
export function isPageScrollable(): boolean {
  return getMaxScrollY() > 0
}
