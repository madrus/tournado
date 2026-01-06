import { useSettingsIsRTL } from '~/stores/useSettingsStore'
import type { DropdownProps, MenuClasses } from '~/utils/rtlUtils'
import { getDropdownProps, getMenuClasses } from '~/utils/rtlUtils'

// React hook for RTL dropdown support
export function useRTLDropdown(): {
	dropdownProps: DropdownProps
	menuClasses: MenuClasses
	isRTL: boolean
} {
	const isRTL = useSettingsIsRTL()

	return {
		dropdownProps: getDropdownProps(),
		menuClasses: getMenuClasses(),
		isRTL,
	}
}
