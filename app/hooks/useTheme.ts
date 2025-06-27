import type { ThemeColors } from '~/lib/theme.types'
import { useSettingsStore } from '~/stores/useSettingsStore'

type UseThemeReturn = {
  theme: string
  getThemeColor: (colorKey: keyof ThemeColors) => string
  getThemeColors: () => ThemeColors
}

export function useTheme(): UseThemeReturn {
  const { theme } = useSettingsStore()

  const getThemeColor = (colorKey: keyof ThemeColors): string => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return '' // Return empty string for SSR
    }

    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${colorKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`)
      .trim()
  }

  const getThemeColors = (): ThemeColors => ({
    background: getThemeColor('background'),
    foreground: getThemeColor('foreground'),
    brand: getThemeColor('brand'),
    brandAccent: getThemeColor('brandAccent'),
    brandDark: getThemeColor('brandDark'),
    brandLight: getThemeColor('brandLight'),
    main: getThemeColor('main'),
    accent: getThemeColor('accent'),
    title: getThemeColor('title'),
    titleAccent: getThemeColor('titleAccent'),
    foregroundHeading: getThemeColor('foregroundHeading'),
    foregroundLight: getThemeColor('foregroundLight'),
    foregroundLighter: getThemeColor('foregroundLighter'),
    foregroundDarker: getThemeColor('foregroundDarker'),
    buttonPrimaryBackground: getThemeColor('buttonPrimaryBackground'),
    buttonPrimaryText: getThemeColor('buttonPrimaryText'),
    buttonPrimaryHoverBackground: getThemeColor('buttonPrimaryHoverBackground'),
    buttonSecondaryBackground: getThemeColor('buttonSecondaryBackground'),
    buttonSecondaryText: getThemeColor('buttonSecondaryText'),
    buttonSecondaryBorder: getThemeColor('buttonSecondaryBorder'),
    buttonSecondaryHoverBackground: getThemeColor('buttonSecondaryHoverBackground'),
    buttonTertiaryBackground: getThemeColor('buttonTertiaryBackground'),
    buttonTertiaryText: getThemeColor('buttonTertiaryText'),
    buttonTertiaryBorder: getThemeColor('buttonTertiaryBorder'),
    buttonTertiaryHoverBackground: getThemeColor('buttonTertiaryHoverBackground'),
    buttonTertiaryHoverBorder: getThemeColor('buttonTertiaryHoverBorder'),
    buttonDangerBackground: getThemeColor('buttonDangerBackground'),
    buttonDangerText: getThemeColor('buttonDangerText'),
    buttonDangerHoverBackground: getThemeColor('buttonDangerHoverBackground'),
    buttonDangerSecondaryBackground: getThemeColor('buttonDangerSecondaryBackground'),
    buttonDangerSecondaryText: getThemeColor('buttonDangerSecondaryText'),
    buttonDangerSecondaryBorder: getThemeColor('buttonDangerSecondaryBorder'),
    buttonDangerSecondaryHoverBackground: getThemeColor(
      'buttonDangerSecondaryHoverBackground'
    ),
    buttonDangerTertiaryBackground: getThemeColor('buttonDangerTertiaryBackground'),
    buttonDangerTertiaryText: getThemeColor('buttonDangerTertiaryText'),
    buttonDangerTertiaryBorder: getThemeColor('buttonDangerTertiaryBorder'),
    buttonDangerTertiaryHoverBackground: getThemeColor(
      'buttonDangerTertiaryHoverBackground'
    ),
    buttonDangerTertiaryHoverBorder: getThemeColor('buttonDangerTertiaryHoverBorder'),
    buttonBrandBackground: getThemeColor('buttonBrandBackground'),
    buttonBrandText: getThemeColor('buttonBrandText'),
    buttonBrandHoverBackground: getThemeColor('buttonBrandHoverBackground'),
    buttonBrandSecondaryBackground: getThemeColor('buttonBrandSecondaryBackground'),
    buttonBrandSecondaryText: getThemeColor('buttonBrandSecondaryText'),
    buttonBrandSecondaryBorder: getThemeColor('buttonBrandSecondaryBorder'),
    buttonBrandSecondaryHoverBackground: getThemeColor(
      'buttonBrandSecondaryHoverBackground'
    ),
    buttonBrandTertiaryBackground: getThemeColor('buttonBrandTertiaryBackground'),
    buttonBrandTertiaryText: getThemeColor('buttonBrandTertiaryText'),
    buttonBrandTertiaryBorder: getThemeColor('buttonBrandTertiaryBorder'),
    buttonBrandTertiaryHoverBackground: getThemeColor(
      'buttonBrandTertiaryHoverBackground'
    ),
    buttonBrandTertiaryHoverBorder: getThemeColor('buttonBrandTertiaryHoverBorder'),
    buttonNeutralBackground: getThemeColor('buttonNeutralBackground'),
    buttonNeutralText: getThemeColor('buttonNeutralText'),
    buttonNeutralHoverBackground: getThemeColor('buttonNeutralHoverBackground'),
    buttonNeutralSecondaryBackground: getThemeColor('buttonNeutralSecondaryBackground'),
    buttonNeutralSecondaryText: getThemeColor('buttonNeutralSecondaryText'),
    buttonNeutralSecondaryBorder: getThemeColor('buttonNeutralSecondaryBorder'),
    buttonNeutralSecondaryHoverBackground: getThemeColor(
      'buttonNeutralSecondaryHoverBackground'
    ),
    buttonNeutralTertiaryBackground: getThemeColor('buttonNeutralTertiaryBackground'),
    buttonNeutralTertiaryText: getThemeColor('buttonNeutralTertiaryText'),
    buttonNeutralTertiaryBorder: getThemeColor('buttonNeutralTertiaryBorder'),
    buttonNeutralTertiaryHoverBackground: getThemeColor(
      'buttonNeutralTertiaryHoverBackground'
    ),
    buttonNeutralTertiaryHoverBorder: getThemeColor('buttonNeutralTertiaryHoverBorder'),
    buttonDangerOutlineFocusRingInner: getThemeColor(
      'buttonDangerOutlineFocusRingInner'
    ),
    buttonDangerOutlineFocusRingOuter: getThemeColor(
      'buttonDangerOutlineFocusRingOuter'
    ),
    buttonOutlineBorderRed: getThemeColor('buttonOutlineBorderRed'),
    gradientFrom: getThemeColor('gradientFrom'),
    gradientTo: getThemeColor('gradientTo'),
    footerBg: getThemeColor('footerBg'),
    footerText: getThemeColor('footerText'),
    backgroundHover: getThemeColor('backgroundHover'),
  })

  return {
    theme,
    getThemeColor,
    getThemeColors,
  }
}
