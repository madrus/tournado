import type { ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

import { getButtonRingClasses } from './ring.styles'

// Common classes for all buttons
export const commonButtonClasses = cn(
	'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
	'min-h-12 min-w-32 px-4 py-2.5 text-sm uppercase',
	'relative transition-all duration-300 ease-out',
	'whitespace-nowrap',
	'shadow-lg hover:shadow-xl disabled:hover:shadow-lg',
	'hover:scale-105 active:scale-95 disabled:hover:scale-100',
	'disabled:cursor-not-allowed disabled:opacity-50',
	'disabled:border-button-neutral-secondary-border disabled:bg-button-neutral-background disabled:text-button-neutral-text',
)

// Color system

// Helper to resolve color name: 'primary' stays 'primary', 'brand' stays 'brand', else itself
const resolveColorName = (color: ColorAccent): string => color // No more mapping needed - primary and brand are semantic colors now

// Ring classes are now handled by the unified ring system

const getShadowClasses = (color: ColorAccent): string => {
	const resolvedColor = resolveColorName(color)
	const disabledShadow =
		'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70'
	return `shadow-${resolvedColor}-700/40 hover:shadow-${resolvedColor}-700/60 ${disabledShadow}`
}

const getBorderClasses = (color: ColorAccent): string => {
	const resolvedColor = resolveColorName(color)
	return `border border-${resolvedColor}-600`
}

const getColorClasses = (color: ColorAccent, variant: ButtonVariant): string => {
	const resolvedColor = resolveColorName(color)
	const ringClasses = getButtonRingClasses(color)
	const shadowClasses = getShadowClasses(color)
	const borderClasses = getBorderClasses(color)

	if (variant === 'primary') {
		return cn(
			`bg-${resolvedColor}-600 text-white`,
			borderClasses,
			ringClasses,
			shadowClasses,
		)
	} else {
		return cn(
			`bg-transparent text-${resolvedColor}-600`,
			borderClasses,
			ringClasses,
			shadowClasses,
		)
	}
}

// Variant definitions
export type ButtonVariant = 'primary' | 'secondary'

// Set default button color
export const DEFAULT_BUTTON_COLOR: ColorAccent = 'brand'

// Get button classes based on variant and color, defaulting to 'brand'
export const getButtonClasses = (
	variant: ButtonVariant,
	color: ColorAccent = DEFAULT_BUTTON_COLOR,
): string => cn(commonButtonClasses, getColorClasses(color, variant))

// Legacy type exports for backward compatibility
export type LinkButtonVariant = ButtonVariant
export type ButtonColor = ColorAccent // Legacy alias
