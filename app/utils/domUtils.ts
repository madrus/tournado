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
    document.documentElement.offsetHeight,
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
export const isPageScrollable = (): boolean => getMaxScrollY() > 0

/**
 * A function type that can be debounced
 */
type DebouncableFunction = (...args: unknown[]) => void

/**
 * A debounced function with a cancel method
 */
type DebouncedFunction<T extends DebouncableFunction> = T & {
  cancel: () => void
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns The debounced function with a cancel method
 */
export function debounce<T extends DebouncableFunction>(
  func: T,
  wait: number,
): DebouncedFunction<T> {
  let timeoutId: number | undefined

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => func(...args), wait)
  }) as DebouncedFunction<T>

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return debounced
}

/**
 * Scroll direction detection logic
 */
export const scrollLogic = {
  /**
   * Determines if header should show based on scroll direction and threshold
   * @param currentY Current scroll position
   * @param lastY Previous scroll position
   * @param threshold Minimum movement required to trigger change
   * @returns true to show header, false to hide, null for no change
   */
  shouldShowHeader(currentY: number, lastY: number, threshold: number): boolean | null {
    const diff = currentY - lastY
    const absDiff = Math.abs(diff)

    // Special case: zero threshold with no movement should return null
    if (threshold === 0 && diff === 0) return null

    if (absDiff < threshold) return null // No change

    return diff <= 0 // up = show, down = hide
  },

  /**
   * Checks if scroll position is within valid range (not overscroll)
   * @param y Current scroll position
   * @param maxScrollY Maximum valid scroll position
   * @returns true if position is valid
   */
  isValidScrollPosition: (y: number, maxScrollY: number): boolean =>
    y >= 0 && y <= maxScrollY,

  /**
   * Calculates maximum scrollable distance
   * @param documentHeight Total document height
   * @param windowHeight Viewport height
   * @returns Maximum scroll Y position
   */
  calculateMaxScrollY: (documentHeight: number, windowHeight: number): number =>
    Math.max(0, documentHeight - Math.max(0, windowHeight)),

  /**
   * Determines if page has enough content to be scrollable
   * @param documentHeight Total document height
   * @param windowHeight Viewport height
   * @returns true if page is scrollable
   */
  isScrollable: (documentHeight: number, windowHeight: number): boolean =>
    documentHeight > windowHeight,
}
