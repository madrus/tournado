import { cva } from 'class-variance-authority'
import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react'

import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import type { Permission } from '~/utils/rbac'

import {
	type ButtonVariants,
	buttonVariants,
	DARK_MODE_DARKER_CLASSES,
	ICON_CIRCLE_COLOR_VARIANTS,
} from './button.variants'
import { useActionButton } from './useActionButton'

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

type ActionButtonProps = {
	children: ReactNode
	icon?: IconName
	variant?: ButtonVariants['variant']
	color?: ButtonVariants['color']
	size?: ButtonVariants['size']
	permission?: Permission
	hideWhenDisabled?: boolean
	darkerInDarkMode?: boolean
} & Omit<NativeButtonProps, 'color'>

export function ActionButton({
	onClick,
	children,
	icon,
	variant = 'primary',
	color = 'brand',
	size = 'md',
	type = 'button',
	disabled = false,
	autoFocus = false,
	className,
	permission,
	hideWhenDisabled = false,
	darkerInDarkMode = false,
	...rest
}: Readonly<ActionButtonProps>): JSX.Element | null {
	const { isHidden, isDisabled } = useActionButton({
		permission,
		hideWhenDisabled,
		disabled,
	})

	// Hide button if user lacks permission and hideWhenDisabled is true
	if (isHidden) {
		return null
	}

	// Determine if the icon should be wrapped in a circle with colored border (transparent fill)
	const iconNeedsCircle =
		icon === 'exclamation_mark' || icon === 'info_letter' || icon === 'check'

	const rawIcon = icon
		? renderIcon(icon, {
				className: cn(
					iconNeedsCircle ? 'h-[18px] w-[18px]' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
				),
				weight: iconNeedsCircle ? 600 : undefined,
				'data-testid': 'action-button-icon',
			})
		: null

	const iconElement = rawIcon ? (
		iconNeedsCircle ? (
			<span className={iconCircleVariants({ size, color })} aria-hidden>
				{rawIcon}
			</span>
		) : (
			<span className='icon-spacing' aria-hidden>
				{rawIcon}
			</span>
		)
	) : null

	// Apply darker background in dark mode if requested
	// Uses shared constant from button.variants.ts for consistency
	const darkModeClasses =
		darkerInDarkMode && color ? DARK_MODE_DARKER_CLASSES[color] || '' : ''

	const buttonClasses = cn(
		buttonVariants({ variant, color, size }),
		darkModeClasses,
		className,
	)

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={isDisabled}
			className={buttonClasses}
			{...rest}
		>
			{iconElement}
			{children}
		</button>
	)
}

const iconCircleVariants = cva(
	'icon-spacing flex items-center justify-center rounded-full border-2 bg-transparent',
	{
		variants: {
			size: {
				sm: 'h-5 w-5',
				md: 'h-6 w-6',
			},
			color: ICON_CIRCLE_COLOR_VARIANTS,
		},
		defaultVariants: {
			size: 'md',
			color: 'brand',
		},
	},
)
