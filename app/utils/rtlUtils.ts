// RTL (Right-to-Left) language utilities
import { useTranslation } from 'react-i18next'

// Check if a language is RTL (only Arabic for the moment)
export const isRTL = (languageCode: string): boolean => ['ar'].includes(languageCode)

// Get direction attribute for HTML
export const getDirection = (languageCode: string): 'ltr' | 'rtl' =>
  isRTL(languageCode) ? 'rtl' : 'ltr'

// Get typography class for body based on language
export const getTypographyClass = (languageCode: string): string =>
  isRTL(languageCode) ? 'text-arabic' : ''

// Helper to apply text-latin in Arabic context for Latin content
export const getLatinTextClass = (languageCode: string): string =>
  isRTL(languageCode) ? 'text-latin' : ''

// Helper to apply text-arabic for Arabic content in any context
export const getArabicTextClass = (): string => 'text-arabic'

// Helper to mark Latin content that should use Inter font (when app is in Arabic mode)
export const getLatinContentClass = (languageCode: string): string =>
  isRTL(languageCode) ? 'latin-content' : ''

// Helper to mark Latin titles that should use Inter font without scaling (when app is in Arabic mode)
export const getLatinTitleClass = (languageCode: string): string =>
  isRTL(languageCode) ? 'latin-title' : ''

// Helper to mark actual Arabic text content (when app is in Arabic mode)
export const getArabicContentClass = (languageCode: string): string =>
  isRTL(languageCode) ? 'arabic-content' : ''

// Specific helper for chip layout (delete button placement)
export function getChipClasses(languageCode: string): { container: string } {
  const isRtl = isRTL(languageCode)

  return {
    // Use Tailwind logical properties that automatically adapt to text direction
    // ps-3 = padding-inline-start (more space where content starts)
    // pe-2 = padding-inline-end (less space where content ends, where delete button is)
    // flex-row-reverse still needed to change visual order in RTL
    container: isRtl ? 'ps-3 pe-2 gap-2 flex-row-reverse' : 'ps-3 pe-2 gap-2 flex-row',
  }
}

// Type for dropdown props
export type DropdownProps = {
  align: 'start' | 'end'
  side: 'bottom'
  sideOffset: number
  alignOffset: number
  avoidCollisions: boolean
}

// Helper for Radix UI dropdown positioning (viewport-aware)
export function getDropdownProps(languageCode: string): DropdownProps {
  const isRtl = isRTL(languageCode)

  return {
    // For Radix UI DropdownMenu.Content
    // We want: RTL = menu on left side, LTR = menu on right side
    // From screenshots:
    // - Arabic (RTL): dropdown perfectly aligned to left edge of trigger using 'start'
    // - Latin (LTR): dropdown should be aligned to right edge of trigger using 'end'
    align: isRtl ? ('start' as const) : ('end' as const),
    side: 'bottom' as const,
    sideOffset: 8,
    // Both Arabic and Latin use the same offset for symmetrical positioning
    alignOffset: -16,
    // Re-enable collision detection to prevent dropdown from going off-screen on mobile
    avoidCollisions: true,
  }
}

// Type for menu classes
export type MenuClasses = {
  spacing: string
  alignment: string
  menuItem: string
  iconContainer: string
  textContainer: string
}

// Helper for manual dropdown positioning with proper spacing
export function getMenuClasses(languageCode: string): MenuClasses {
  const isRtl = isRTL(languageCode)

  return {
    // Use logical properties for spacing
    spacing: isRtl ? 'me-4' : 'ms-4', // margin-inline-end : margin-inline-start
    alignment: isRtl ? 'end-0' : 'start-0', // inset-inline-end : inset-inline-start
    // Menu item layout - icons on correct side for RTL
    menuItem: isRtl ? 'flex flex-row-reverse' : 'flex flex-row',
    // Icon container positioning
    iconContainer: isRtl
      ? 'flex w-8 items-center justify-end ps-2 pe-0 text-end' // Icon on right in RTL
      : 'flex w-8 items-center justify-start ps-0 pe-2 text-start', // Icon on left in LTR
    // Text container alignment
    textContainer: isRtl ? 'text-right' : 'text-left',
  }
}

// React hook for RTL dropdown support
export function useRTLDropdown(): {
  dropdownProps: DropdownProps
  menuClasses: MenuClasses
  isRTL: boolean
} {
  const { i18n } = useTranslation()

  return {
    dropdownProps: getDropdownProps(i18n.language),
    menuClasses: getMenuClasses(i18n.language),
    isRTL: isRTL(i18n.language),
  }
}

// Type for typography classes
export type TypographyClasses = {
  title: string
  heading: string
  textAlign: string
  centerAlign: string
  mixedContent: string
  appName: string
}

// Arabic typography fixes
export function getTypographyClasses(languageCode: string): TypographyClasses {
  const isRtl = isRTL(languageCode)

  return {
    // Better line height and positioning for Arabic text
    title: isRtl ? 'leading-tight' : 'leading-normal',
    // Adjusted letter spacing for Arabic
    heading: isRtl ? 'tracking-normal' : 'tracking-tight',
    // Text alignment
    textAlign: isRtl ? 'text-right' : 'text-left',
    // Center alignment for hero sections
    centerAlign: 'text-center', // Keep center for hero sections regardless of language
    // Special handling for mixed content (app names in Latin script within Arabic context)
    mixedContent: isRtl ? 'leading-snug text-center' : 'leading-normal text-center',
    // App name specific styling (since app name stays in Latin script)
    appName: 'leading-normal text-center font-bold', // Force normal leading for app name
  }
}
