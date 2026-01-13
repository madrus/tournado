import {
	type CSSProperties,
	type ComponentType,
	type ReactElement,
	type SVGProps,
	cloneElement,
	createElement,
	isValidElement,
} from 'react'
import {
	AddIcon,
	AdminPanelSettingsIcon,
	ApparelIcon,
	BlockIcon,
	CheckMarkIcon,
	CloseIcon,
	DarkModeIcon,
	DeleteIcon,
	ErrorIcon,
	ExclamationIcon,
	ExclamationMarkIcon,
	ExpandMoreIcon,
	GroupIcon,
	HomeIcon,
	InfoIcon,
	InfoLetterIcon,
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
	SportsIcon,
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
	| 'exclamation'
	| 'exclamation_mark'
	| 'expand_more'
	| 'group'
	| 'home'
	| 'info'
	| 'info_letter'
	| 'language'
	| 'light_mode'
	| 'login'
	| 'logout'
	| 'more_horiz'
	| 'more_vert'
	| 'newWindow'
	| 'pending'
	| 'people'
	| 'person'
	| 'settings'
	| 'sports'
	| 'success'
	| 'trophy'
	| 'tune'
	| 'unfold_less'
	| 'unfold_more'
	| 'warning'

export const iconMap: Record<IconName, ComponentType<IconProps>> = {
	add: AddIcon,
	admin_panel_settings: AdminPanelSettingsIcon,
	apparel: ApparelIcon,
	block: BlockIcon,
	check: CheckMarkIcon,
	check_circle: CheckMarkIcon,
	close: CloseIcon,
	dark_mode: DarkModeIcon,
	delete: DeleteIcon,
	newWindow: NewWindowIcon,
	error: ErrorIcon,
	exclamation: ExclamationIcon,
	exclamation_mark: ExclamationMarkIcon,
	expand_more: ExpandMoreIcon,
	group: GroupIcon,
	home: HomeIcon,
	info: InfoIcon,
	info_letter: InfoLetterIcon,
	language: LanguageIcon,
	light_mode: LightModeIcon,
	login: LoginIcon,
	logout: LogoutIcon,
	more_horiz: MoreHorizIcon,
	more_vert: MoreVertIcon,
	pending: PendingIcon,
	people: GroupIcon,
	person: PersonIcon,
	settings: SettingsIcon,
	sports: SportsIcon,
	success: CheckMarkIcon,
	trophy: TrophyIcon,
	tune: TuneIcon,
	unfold_less: UnfoldLessIcon,
	unfold_more: UnfoldMoreIcon,
	warning: WarningIcon,
} as const

// IconProps that match what our icon components actually accept
export type IconProps = {
	className?: string
	size?: number
	variant?: IconVariant
	weight?: IconWeight
	style?: CSSProperties
	'data-testid'?: string
}

export function renderIcon(
	iconName: IconName,
	props: IconProps = {},
): ReactElement | null {
	const IconComponent = iconMap[iconName]

	if (!IconComponent) {
		return null
	}

	const { style, ...componentProps } = props
	const element = createElement(IconComponent, componentProps)

	// If style is provided, clone the element with the style applied to the SVG
	if (style && isValidElement(element)) {
		return cloneElement(element as ReactElement<SVGProps<SVGSVGElement>>, {
			style: {
				...((element.props as SVGProps<SVGSVGElement>).style || {}),
				...style,
			},
		})
	}

	return element
}
