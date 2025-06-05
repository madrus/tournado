import React from 'react'

import {
  AdminPanelSettingsIcon,
  ApparelIcon,
  BlockIcon,
  CheckCircleIcon,
  DarkModeIcon,
  ErrorIcon,
  HomeIcon,
  InfoIcon,
  LanguageIcon,
  LightModeIcon,
  LoginIcon,
  LogoutIcon,
  MenuIcon,
  MoreHorizIcon,
  MoreVertIcon,
  PendingIcon,
  PersonIcon,
  SettingsIcon,
  TrophyIcon,
  TuneIcon,
  WarningIcon,
} from '~/components/icons'
import type { IconVariant, IconWeight } from '~/lib/lib.types'

export type IconName =
  | 'admin_panel_settings'
  | 'apparel'
  | 'block'
  | 'check_circle'
  | 'dark_mode'
  | 'error'
  | 'home'
  | 'info'
  | 'language'
  | 'light_mode'
  | 'login'
  | 'logout'
  | 'menu'
  | 'more_horiz'
  | 'more_vert'
  | 'pending'
  | 'person'
  | 'settings'
  | 'trophy'
  | 'tune'
  | 'warning'

export const iconMap = {
  admin_panel_settings: AdminPanelSettingsIcon,
  apparel: ApparelIcon,
  block: BlockIcon,
  check_circle: CheckCircleIcon,
  dark_mode: DarkModeIcon,
  error: ErrorIcon,
  home: HomeIcon,
  info: InfoIcon,
  language: LanguageIcon,
  light_mode: LightModeIcon,
  login: LoginIcon,
  logout: LogoutIcon,
  menu: MenuIcon,
  more_horiz: MoreHorizIcon,
  more_vert: MoreVertIcon,
  pending: PendingIcon,
  person: PersonIcon,
  settings: SettingsIcon,
  trophy: TrophyIcon,
  tune: TuneIcon,
  warning: WarningIcon,
}

// IconProps that match what our icon components actually accept
export interface IconProps {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
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

  return React.createElement(IconComponent, props)
}
