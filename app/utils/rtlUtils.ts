// RTL (Right-to-Left) language utilities
import { useTranslation } from 'react-i18next'

import { cn } from './misc'

// Check if a language is RTL (only Arabic for this project)
export const isRTL = (languageCode: string): boolean => languageCode === 'ar'

// Get direction attribute for HTML
export const getDirection = (languageCode: string): 'ltr' | 'rtl' =>
  isRTL(languageCode) ? 'rtl' : 'ltr'

// Get typography class for body based on language
export const getTypographyClass = (languageCode: string): string =>
  isRTL(languageCode) ? 'text-arabic' : ''

// Helper to apply text-force-latin in Arabic context for Latin content
export const getLatinTextClass = (languageCode: string): string =>
  isRTL(languageCode) ? 'text-force-latin' : ''

// Helper to apply text-force-arabic for Arabic content in any context
export const getArabicTextClass = (): string => 'text-force-arabic'

// Get text alignment class for RTL languages
export const getTextAlign = (languageCode: string): string =>
  isRTL(languageCode) ? 'text-right' : 'text-left'

// Get margin/padding classes that need to be flipped for RTL
export function getSpacingClass(ltrClass: string, languageCode: string): string {
  if (!isRTL(languageCode)) {
    return ltrClass
  }

  // Map of LTR to RTL classes
  const rtlMapping: Record<string, string> = {
    // Margins
    'ml-1': 'mr-1',
    'ml-2': 'mr-2',
    'ml-3': 'mr-3',
    'ml-4': 'mr-4',
    'ml-5': 'mr-5',
    'ml-6': 'mr-6',

    // Padding
    'pl-1': 'pr-1',
    'pl-2': 'pr-2',
    'pl-3': 'pr-3',
    'pl-4': 'pr-4',
    'pl-5': 'pr-5',
    'pl-6': 'pr-6',
    'pr-1': 'pl-1',
    'pr-2': 'pl-2',
    'pr-3': 'pl-3',
    'pr-4': 'pl-4',
    'pr-5': 'pl-5',
    'pr-6': 'pl-6',

    // Positioning
    'left-0': 'right-0',
    'left-1': 'right-1',
    'left-2': 'right-2',
    'left-3': 'right-3',
    'left-4': 'right-4',
    'right-0': 'left-0',
    'right-1': 'left-1',
    'right-2': 'left-2',
    'right-3': 'left-3',
    'right-4': 'left-4',

    // Text alignment
    'text-left': 'text-right',
    'text-right': 'text-left',

    // Flex direction (for chip delete buttons)
    'flex-row': 'flex-row-reverse',
    'flex-row-reverse': 'flex-row',
  }

  return rtlMapping[ltrClass] || ltrClass
}

// Helper to get multiple spacing classes
export const getSpacingClasses = (
  ltrClasses: string[],
  languageCode: string
): string[] => ltrClasses.map(cls => getSpacingClass(cls, languageCode))

// Generate conditional RTL class string using tailwind-merge
export function rtlClass(
  baseClasses: string,
  ltrClasses: string,
  rtlClasses: string,
  languageCode: string
): string {
  const conditionalClasses = isRTL(languageCode) ? rtlClasses : ltrClasses
  return cn(baseClasses, conditionalClasses)
}

// For simple LTR/RTL value switching
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function conditionalRTL<T>(ltrValue: T, rtlValue: T, languageCode: string): T {
  return isRTL(languageCode) ? rtlValue : ltrValue
}

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
}

// Helper for Radix UI dropdown positioning (viewport-aware)
export function getDropdownProps(languageCode: string): DropdownProps {
  const isRtl = isRTL(languageCode)

  return {
    // For Radix UI DropdownMenu.Content
    align: isRtl ? ('end' as const) : ('start' as const),
    side: 'bottom' as const,
    sideOffset: 8,
    alignOffset: isRtl ? 8 : -8,
  }
}

// Type for menu classes
export type MenuClasses = {
  spacing: string
  alignment: string
}

// Helper for manual dropdown positioning with proper spacing
export function getMenuClasses(languageCode: string): MenuClasses {
  const isRtl = isRTL(languageCode)

  return {
    // Use logical properties for spacing
    spacing: isRtl ? 'me-4' : 'ms-4', // margin-inline-end : margin-inline-start
    alignment: isRtl ? 'end-0' : 'start-0', // inset-inline-end : inset-inline-start
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

// Simplified spacing utilities using tailwind-merge
export function spacingClass(
  baseClasses: string,
  ltrSpacing: string,
  rtlSpacing: string,
  languageCode: string
): string {
  const spacing = isRTL(languageCode) ? rtlSpacing : ltrSpacing
  return cn(baseClasses, spacing)
}

// Common patterns for text alignment
export function textAlignClass(baseClasses: string, languageCode: string): string {
  const alignment = isRTL(languageCode) ? 'text-right' : 'text-left'
  return cn(baseClasses, alignment)
}

// Common patterns for flex direction
export function flexDirectionClass(baseClasses: string, languageCode: string): string {
  const direction = isRTL(languageCode) ? 'flex-row-reverse' : 'flex-row'
  return cn(baseClasses, direction)
}

// Type for useRTL hook result
export type UseRTLResult = {
  isRTL: boolean
  direction: 'ltr' | 'rtl'
  typographyClass: string
  latinTextClass: string
  arabicTextClass: string
}

// RTL hook for React components
export function useRTL(): UseRTLResult {
  const { i18n } = useTranslation()
  return {
    isRTL: isRTL(i18n.language),
    direction: getDirection(i18n.language),
    typographyClass: getTypographyClass(i18n.language),
    latinTextClass: getLatinTextClass(i18n.language),
    arabicTextClass: getArabicTextClass(),
  }
}
