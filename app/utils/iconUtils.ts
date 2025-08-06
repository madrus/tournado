import React from 'react'

import {
  AddIcon,
  AdminPanelSettingsIcon,
  ApparelIcon,
  BlockIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  DarkModeIcon,
  DeleteIcon,
  ErrorIcon,
  ExpandMoreIcon,
  HomeIcon,
  InfoIcon,
  LanguageIcon,
  LightModeIcon,
  LoginIcon,
  LogoutIcon,
  MoreHorizIcon,
  MoreVertIcon,
  NewWindowIcon,
  PendingIcon,
  PersonIcon,
  SettingsIcon,
  TrophyIcon,
  TuneIcon,
  UnfoldLessIcon,
  UnfoldMoreIcon,
  WarningIcon,
} from '~/components/icons'
import type { IconVariant, IconWeight } from '~/lib/lib.types'

export type IconName =
  | 'add'
  | 'admin_panel_settings'
  | 'apparel'
  | 'block'
  | 'check'
  | 'check_circle'
  | 'close'
  | 'dark_mode'
  | 'delete'
  | 'newWindow'
  | 'error'
  | 'home'
  | 'info'
  | 'language'
  | 'light_mode'
  | 'login'
  | 'logout'
  | 'more_horiz'
  | 'more_vert'
  | 'newWindow'
  | 'pending'
  | 'person'
  | 'settings'
  | 'trophy'
  | 'tune'
  | 'unfold_less'
  | 'unfold_more'
  | 'warning'
  | 'expand_more'

export const iconMap = {
  add: AddIcon,
  admin_panel_settings: AdminPanelSettingsIcon,
  apparel: ApparelIcon,
  block: BlockIcon,
  check: CheckIcon,
  check_circle: CheckCircleIcon,
  close: CloseIcon,
  dark_mode: DarkModeIcon,
  delete: DeleteIcon,
  newWindow: NewWindowIcon,
  error: ErrorIcon,
  home: HomeIcon,
  info: InfoIcon,
  language: LanguageIcon,
  light_mode: LightModeIcon,
  login: LoginIcon,
  logout: LogoutIcon,
  more_horiz: MoreHorizIcon,
  more_vert: MoreVertIcon,
  pending: PendingIcon,
  person: PersonIcon,
  settings: SettingsIcon,
  trophy: TrophyIcon,
  tune: TuneIcon,
  unfold_less: UnfoldLessIcon,
  unfold_more: UnfoldMoreIcon,
  warning: WarningIcon,
  expand_more: ExpandMoreIcon,
}

// IconProps that match what our icon components actually accept
export type IconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  style?: React.CSSProperties
  'data-testid'?: string
}

export function renderIcon(
  iconName: IconName,
  props: IconProps = {}
): React.ReactElement | null {
  const IconComponent = iconMap[iconName]

  if (!IconComponent) {
    // eslint-disable-next-line no-console
    console.warn(`Icon "${iconName}" not found in iconMap`)
    return null
  }

  const { style, ...componentProps } = props
  const element = React.createElement(IconComponent, componentProps)

  // If style is provided, clone the element with the style applied to the SVG
  if (style && React.isValidElement(element)) {
    return React.cloneElement(
      element as React.ReactElement<React.SVGProps<SVGSVGElement>>,
      {
        style: {
          ...((element.props as React.SVGProps<SVGSVGElement>).style || {}),
          ...style,
        },
      }
    )
  }

  return element
}
