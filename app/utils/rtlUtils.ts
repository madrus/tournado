import type { Language } from '~/i18n/config'
import { useSettingsStore } from '~/stores/useSettingsStore'

// RTL (Right-to-Left) language utilities
// isRTL is now a computed property in useSettingsStore based on the current language

const isLanguageRTL = (language: Language | string): boolean =>
  language.split('-')[0] === 'ar'

const resolveIsRTL = (languageOverride?: Language | string): boolean => {
  if (languageOverride) {
    return isLanguageRTL(languageOverride)
  }

  return useSettingsStore.getState().isRTL
}

// Get direction attribute for HTML
export const getDirection = (languageOverride?: Language | string): 'ltr' | 'rtl' =>
  resolveIsRTL(languageOverride) ? 'rtl' : 'ltr'

// Get typography class for body based on language
export const getTypographyClass = (languageOverride?: Language | string): string =>
  resolveIsRTL(languageOverride) ? 'arabic-text' : ''

type ArabicTextClassOptions = {
  respectDirection?: boolean
}

// Helper to apply arabic-text when UI runs RTL, with override for explicit Arabic snippets
export const getArabicTextClass = (options: ArabicTextClassOptions = {}): string => {
  const { respectDirection = true } = options
  const isRTL = useSettingsStore.getState().isRTL

  if (!respectDirection) return 'arabic-text'

  return isRTL ? 'arabic-text' : ''
}

// Helper to apply latin-text in Arabic context for Latin content
export const getLatinTextClass = (languageOverride?: Language | string): string => {
  if (languageOverride) {
    return resolveIsRTL(languageOverride) ? 'latin-text' : ''
  }
  // On client, check DOM dir attribute for hydration consistency
  if (typeof document !== 'undefined') {
    return document.documentElement.getAttribute('dir') === 'rtl' ? 'latin-text' : ''
  }
  return resolveIsRTL() ? 'latin-text' : ''
}

// Helper to mark Latin titles that should use Inter font without scaling (when app is in Arabic mode)
export const getLatinTitleClass = (languageOverride?: Language | string): string => {
  if (languageOverride) {
    return resolveIsRTL(languageOverride) ? 'latin-title' : ''
  }
  // On client, check DOM dir attribute for hydration consistency
  if (typeof document !== 'undefined') {
    return document.documentElement.getAttribute('dir') === 'rtl' ? 'latin-title' : ''
  }
  return resolveIsRTL() ? 'latin-title' : ''
}

// Helper for Latin content that needs font-family change only (no size override)
// Use this for elements where you want default Latin font but need to preserve responsive sizing
// Uses !important to override arabic-text parent selector
// Uses Tailwind's font-sans which respects your configured default font
export const getLatinFontFamily = (): string =>
  useSettingsStore.getState().isRTL ? '!font-sans' : ''

// Specific helper for chip layout (delete button placement)
export function getChipClasses(): { container: string } {
  const isRTL = useSettingsStore.getState().isRTL

  return {
    // Use Tailwind logical properties that automatically adapt to text direction
    // ps-3 = padding-inline-start (more space where content starts)
    // pe-2 = padding-inline-end (less space where content ends, where delete button is)
    // flex-row-reverse still needed to change visual order in RTL
    container: isRTL ? 'ps-2 pe-1 gap-2 flex-row-reverse' : 'ps-2 pe-1 gap-2 flex-row',
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
export function getDropdownProps(): DropdownProps {
  const isRTL = useSettingsStore.getState().isRTL

  return {
    // For Radix UI DropdownMenu.Content
    // We want: RTL = menu on left side, LTR = menu on right side
    // From screenshots:
    // - Arabic (RTL): dropdown perfectly aligned to left edge of trigger using 'start'
    // - Latin (LTR): dropdown should be aligned to right edge of trigger using 'end'
    align: isRTL ? ('start' as const) : ('end' as const),
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
export function getMenuClasses(): MenuClasses {
  const isRTL = useSettingsStore.getState().isRTL

  return {
    // Use logical properties for spacing
    spacing: isRTL ? 'me-4' : 'ms-4', // margin-inline-end : margin-inline-start
    alignment: isRTL ? 'end-0' : 'start-0', // inset-inline-end : inset-inline-start
    // Menu item layout - icons on correct side for RTL
    menuItem: isRTL ? 'flex flex-row-reverse' : 'flex flex-row',
    // Icon container positioning
    iconContainer: isRTL
      ? 'flex w-8 items-center justify-end ps-2 pe-0 text-end' // Icon on right in RTL
      : 'flex w-8 items-center justify-start ps-0 pe-2 text-start', // Icon on left in LTR
    // Text container alignment
    textContainer: isRTL ? 'text-right' : 'text-left',
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
export function getTypographyClasses(
  languageOverride?: Language | string
): TypographyClasses {
  const isRTL = resolveIsRTL(languageOverride)

  return {
    // Better line height and positioning for Arabic text
    title: isRTL ? 'leading-tight' : 'leading-normal',
    // Adjusted letter spacing for Arabic
    heading: isRTL ? 'tracking-normal' : 'tracking-tight',
    // Text alignment
    textAlign: isRTL ? 'text-right' : 'text-left',
    // Center alignment for hero sections
    centerAlign: 'text-center', // Keep center for hero sections regardless of language
    // Special handling for mixed content (app names in Latin script within Arabic context)
    mixedContent: isRTL ? 'leading-snug text-center' : 'leading-normal text-center',
    // App name specific styling (since app name stays in Latin script)
    appName: 'leading-normal text-center font-bold', // Force normal leading for app name
  }
}

// Type for swipe row configuration
export type SwipeRowConfig = {
  directionMultiplier: 1 | -1 // For inverting touch calculations in RTL
}

// Helper for swipeable row RTL support
export const getSwipeRowConfig = (): SwipeRowConfig => ({
  // RTL: multiply by -1 to invert swipe direction
  // LTR: multiply by 1 (no change)
  directionMultiplier: useSettingsStore.getState().isRTL ? -1 : 1,
})
