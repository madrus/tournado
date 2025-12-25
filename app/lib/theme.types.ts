/* Theme token types for Tailwind v4 */

export type ThemeColors = {
	// Core colors
	background: string
	foreground: string

	// Brand colors
	brand: string
	brandAccent: string
	brandDark: string
	brandLight: string

	// Main neutral background
	main: string
	neutral: string

	// Text colors
	title: string
	titleAccent: string
	foregroundHeading: string
	foregroundLight: string
	foregroundLighter: string
	foregroundDarker: string

	// Button colors
	buttonPrimaryBackground: string
	buttonPrimaryText: string
	buttonPrimaryHoverBackground: string

	buttonSecondaryBackground: string
	buttonSecondaryText: string
	buttonSecondaryBorder: string
	buttonSecondaryHoverBackground: string

	buttonTertiaryBackground: string
	buttonTertiaryText: string
	buttonTertiaryBorder: string
	buttonTertiaryHoverBackground: string
	buttonTertiaryHoverBorder: string

	// Danger button colors
	buttonDangerBackground: string
	buttonDangerText: string
	buttonDangerHoverBackground: string

	buttonDangerSecondaryBackground: string
	buttonDangerSecondaryText: string
	buttonDangerSecondaryBorder: string
	buttonDangerSecondaryHoverBackground: string

	buttonDangerTertiaryBackground: string
	buttonDangerTertiaryText: string
	buttonDangerTertiaryBorder: string
	buttonDangerTertiaryHoverBackground: string
	buttonDangerTertiaryHoverBorder: string

	// Brand button colors
	buttonBrandBackground: string
	buttonBrandText: string
	buttonBrandHoverBackground: string

	buttonBrandSecondaryBackground: string
	buttonBrandSecondaryText: string
	buttonBrandSecondaryBorder: string
	buttonBrandSecondaryHoverBackground: string

	buttonBrandTertiaryBackground: string
	buttonBrandTertiaryText: string
	buttonBrandTertiaryBorder: string
	buttonBrandTertiaryHoverBackground: string
	buttonBrandTertiaryHoverBorder: string

	// Neutral button colors
	buttonNeutralBackground: string
	buttonNeutralText: string
	buttonNeutralHoverBackground: string

	buttonNeutralSecondaryBackground: string
	buttonNeutralSecondaryText: string
	buttonNeutralSecondaryBorder: string
	buttonNeutralSecondaryHoverBackground: string

	buttonNeutralTertiaryBackground: string
	buttonNeutralTertiaryText: string
	buttonNeutralTertiaryBorder: string
	buttonNeutralTertiaryHoverBackground: string
	buttonNeutralTertiaryHoverBorder: string

	// Focus ring colors
	buttonDangerOutlineFocusRingInner: string
	buttonDangerOutlineFocusRingOuter: string
	buttonOutlineBorderRed: string

	// Gradients
	gradientFrom: string
	gradientTo: string

	// Footer colors
	footerBg: string
	footerText: string

	// Hover colors
	backgroundHover: string
}

export type ThemeMode = 'light' | 'dark'

export type ThemeTokens = {
	light: ThemeColors
	dark: ThemeColors
}
