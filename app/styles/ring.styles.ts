import type { ColorAccent } from '~/lib/lib.types'

// Helper to resolve color name: 'primary' stays 'primary', 'brand' stays 'brand', else itself
const resolveColorName = (color: ColorAccent): string => color

export type RingConfig = {
	// Ring properties
	ringWidth?: 'ring-1' | 'ring-2' | 'ring-4' // Default: 'ring-2'
	ringOffset?: 'ring-offset-1' | 'ring-offset-2' | 'ring-offset-4' // Default: 'ring-offset-2'

	// Color configuration for light mode
	lightMode: {
		ringColor: string // e.g., 'red-600', 'emerald-600'
		ringOffsetColor: string // e.g., 'white', 'slate-100'
	}

	// Color configuration for dark mode
	darkMode: {
		ringColor: string // e.g., 'slate-100', 'emerald-400'
		ringOffsetColor: string // e.g., 'red-600', 'slate-900'
	}
}

/**
 * Generates ring classes for focus and hover states with full light/dark mode support
 * NOTE: This function generates the ring classes but does NOT add the hover:/focus-visible: prefixes
 * Those prefixes should be added by the calling functions
 * IMPORTANT: This function does NOT include base ring classes (ring-2, ring-offset-2) to prevent
 * rings from appearing at rest state. The base classes are added by the state-specific functions.
 */
export const getRingClasses = (config: RingConfig): string => {
	const { lightMode, darkMode } = config

	// Light mode classes
	const lightRing = `ring-${lightMode.ringColor}`
	const lightRingOffset = `ring-offset-${lightMode.ringOffsetColor}`

	// Dark mode classes
	const darkRing = `dark:ring-${darkMode.ringColor}`
	const darkRingOffset = `dark:ring-offset-${darkMode.ringOffsetColor}`

	// Return only color classes - width and offset will be added by state-specific functions
	return `${lightRing} ${lightRingOffset} ${darkRing} ${darkRingOffset}`
}

/**
 * Generates focus ring classes (focus-visible and focus states)
 * This properly scopes the ring classes to only appear on focus
 */
export const getFocusRingClasses = (config: RingConfig): string => {
	const {
		ringWidth = 'ring-2',
		ringOffset = 'ring-offset-2',
		lightMode,
		darkMode,
	} = config

	// Build all classes with focus-visible prefix
	const focusVisibleClasses = [
		`focus-visible:${ringWidth}`,
		`focus-visible:${ringOffset}`,
		`focus-visible:ring-${lightMode.ringColor}`,
		`focus-visible:ring-offset-${lightMode.ringOffsetColor}`,
		`focus-visible:dark:ring-${darkMode.ringColor}`,
		`focus-visible:dark:ring-offset-${darkMode.ringOffsetColor}`,
	]

	// Build all classes with focus prefix
	const focusClasses = [
		`focus:${ringWidth}`,
		`focus:${ringOffset}`,
		`focus:ring-${lightMode.ringColor}`,
		`focus:ring-offset-${lightMode.ringOffsetColor}`,
		`focus:dark:ring-${darkMode.ringColor}`,
		`focus:dark:ring-offset-${darkMode.ringOffsetColor}`,
	]

	return [...focusVisibleClasses, ...focusClasses, 'focus:outline-none'].join(' ')
}

/**
 * Generates hover ring classes
 * This properly scopes the ring classes to only appear on hover
 */
export const getHoverRingClasses = (config: RingConfig): string => {
	const {
		ringWidth = 'ring-2',
		ringOffset = 'ring-offset-2',
		lightMode,
		darkMode,
	} = config

	// Build all classes with hover prefix
	const hoverClasses = [
		`hover:${ringWidth}`,
		`hover:${ringOffset}`,
		`hover:ring-${lightMode.ringColor}`,
		`hover:ring-offset-${lightMode.ringOffsetColor}`,
		`hover:dark:ring-${darkMode.ringColor}`,
		`hover:dark:ring-offset-${darkMode.ringOffsetColor}`,
	]

	return hoverClasses.join(' ')
}

/**
 * Generates combined focus and hover ring classes
 * This ensures rings only appear on hover/focus states, not at rest
 */
export const getFocusHoverRingClasses = (config: RingConfig): string => {
	const focusClasses = getFocusRingClasses(config)
	const hoverClasses = getHoverRingClasses(config)
	return `${focusClasses} ${hoverClasses}`
}

/**
 * Generates disabled ring classes (removes rings when disabled)
 */
export const getDisabledRingClasses = (): string =>
	'disabled:hover:ring-0 disabled:hover:ring-offset-0 disabled:focus-visible:ring-0 disabled:focus-visible:ring-offset-0 disabled:focus:ring-0 disabled:focus:ring-offset-0'

/**
 * Pre-configured ring configs for common use cases
 */
export const RING_CONFIGS = {
	// Standard button ring: color-600 ring with slate-50 offset in light mode, inverted in dark
	// Special handling for red/brand buttons: red-slate-50-red becomes slate-50-red-slate-50
	button: (color: ColorAccent): RingConfig => {
		const resolvedColor = resolveColorName(color)

		// For red/brand buttons, we want white-red-white pattern in dark mode
		// This is achieved through: white border + red ring-offset + white ring
		// Light mode: red-ring + white-gap = red-white
		// Dark mode: white-ring + red-gap = white-red (combined with white border = white-red-white)
		if (resolvedColor === 'red' || resolvedColor === 'brand') {
			return {
				lightMode: {
					ringColor: `${resolvedColor}-600`,
					ringOffsetColor: 'slate-50',
				},
				darkMode: {
					ringColor: 'slate-50',
					ringOffsetColor: `${resolvedColor}-600`,
				},
			}
		}

		// For other colors, use the same logic but ensure proper inversion
		return {
			lightMode: {
				ringColor: `${resolvedColor}-600`,
				ringOffsetColor: 'slate-50',
			},
			darkMode: {
				ringColor: 'slate-50',
				ringOffsetColor: `${resolvedColor}-600`,
			},
		}
	},

	// Team chip ring: red-600 ring with slate-50 offset in light mode, slate-100 ring with red-600 offset in dark
	teamChip: (): RingConfig => ({
		lightMode: {
			ringColor: 'red-600',
			ringOffsetColor: 'slate-50',
		},
		darkMode: {
			ringColor: 'slate-100',
			ringOffsetColor: 'red-600',
		},
	}),

	// Generic chip ring: configurable color with inversion
	chip: (color: ColorAccent): RingConfig => {
		const resolvedColor = resolveColorName(color)
		return {
			lightMode: {
				ringColor: `${resolvedColor}-600`,
				ringOffsetColor: 'slate-50',
			},
			darkMode: {
				ringColor: 'slate-100',
				ringOffsetColor: `${resolvedColor}-600`,
			},
		}
	},

	// Input field ring: subtler approach for form fields
	input: (color: ColorAccent): RingConfig => {
		const resolvedColor = resolveColorName(color)
		return {
			lightMode: {
				ringColor: `${resolvedColor}-600`,
				ringOffsetColor: 'slate-50',
			},
			darkMode: {
				ringColor: `${resolvedColor}-400`,
				ringOffsetColor: 'slate-900',
			},
		}
	},
}

/**
 * Convenience functions for common use cases
 */
export const getButtonRingClasses = (color: ColorAccent): string => {
	const config = RING_CONFIGS.button(color)
	return `${getFocusHoverRingClasses(config)} ${getDisabledRingClasses()}`
}

export const getTeamChipRingClasses = (): string => {
	const config = RING_CONFIGS.teamChip()
	return getFocusHoverRingClasses(config)
}

export const getChipRingClasses = (color: ColorAccent): string => {
	const config = RING_CONFIGS.chip(color)
	return getFocusHoverRingClasses(config)
}

export const getInputRingClasses = (color: ColorAccent): string => {
	const config = RING_CONFIGS.input(color)
	return getFocusHoverRingClasses(config)
}
