import { useTranslation } from 'react-i18next'

import type { DropdownProps, MenuClasses } from '~/utils/rtlUtils'
import { getDropdownProps, getMenuClasses, isRTL } from '~/utils/rtlUtils'

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
