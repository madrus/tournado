import type { ButtonColor } from '~/components/buttons/button.variants'
import type { IconName } from '~/utils/iconUtils'

import type { DialogIntent } from './dialog.variants'

/**
 * Maps dialog intent to appropriate default icon
 */
export const getIconForIntent = (intent: DialogIntent, customIcon?: IconName): IconName => {
	if (customIcon) return customIcon

	const iconMap: Record<DialogIntent, IconName> = {
		warning: 'warning',
		danger: 'error',
		info: 'info',
		success: 'success',
	}

	return iconMap[intent]
}

/**
 * Maps dialog intent to appropriate button colors
 */
export const getDefaultColorsForIntent = (
	intent: DialogIntent,
): { confirm: ButtonColor; cancel: ButtonColor } => {
	const colorMap: Record<DialogIntent, { confirm: ButtonColor; cancel: ButtonColor }> = {
		warning: { confirm: 'amber', cancel: 'slate' },
		danger: { confirm: 'red', cancel: 'slate' },
		info: { confirm: 'sky', cancel: 'sky' },
		success: { confirm: 'green', cancel: 'slate' },
	}

	return colorMap[intent]
}

/**
 * Get contextually appropriate confirm button color based on intent
 */
export const getColorForIntent = (intent: DialogIntent, customColor?: ButtonColor): ButtonColor => {
	if (customColor) return customColor
	return getDefaultColorsForIntent(intent).confirm
}
