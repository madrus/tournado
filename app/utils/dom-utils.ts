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
export const isPageScrollable = (): boolean => getMaxScrollY() > 0

/**
 * A function type that can be debounced
 */
type DebouncableFunction = (...args: unknown[]) => void

/**
 * A debounced function with a cancel method
 */
type DebouncedFunction<T extends DebouncableFunction> = T & { cancel: () => void }

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
  wait: number
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
