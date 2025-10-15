import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  getDirection,
  getLatinFontFamily,
  getSwipeRowConfig,
  type SwipeRowConfig,
} from '~/utils/rtlUtils'

export type LanguageDirection = {
  /** Direction attribute value: 'rtl' or 'ltr' */
  direction: 'rtl' | 'ltr'
  /** Latin font class for overriding Arabic font in RTL context */
  latinFontClass: string
  /** Configuration for swipeable rows with direction multiplier */
  swipeConfig: SwipeRowConfig
}

/**
 * Hook that provides all language direction-related utilities
 * Memoized based on current language to avoid recalculation
 *
 * @returns Object containing:
 *  - direction: 'rtl' | 'ltr' - direction attribute value (use this instead of isRTL)
 *  - latinFontClass: string - '!font-sans' for RTL, '' for LTR
 *  - swipeConfig: { directionMultiplier: 1 | -1 } - for swipeable interactions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { direction, latinFontClass, swipeConfig } = useLanguageDirection()
 *
 *   return (
 *     <div className={latinFontClass}>
 *       {direction === 'rtl' ? 'Arabic mode' : 'Latin mode'}
 *     </div>
 *   )
 * }
 * ```
 */
export function useLanguageDirection(): LanguageDirection {
  const { i18n } = useTranslation()

  return useMemo(
    () => ({
      direction: getDirection(i18n.language),
      latinFontClass: getLatinFontFamily(i18n.language),
      swipeConfig: getSwipeRowConfig(i18n.language),
    }),
    [i18n.language]
  )
}
