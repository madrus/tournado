import type { JSX } from 'react'

import { ActionLink } from '~/components/PrefetchLink'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import type { Permission } from '~/utils/rbac'

import { ActionButton } from './ActionButton'
import { type ButtonVariants, buttonVariants } from './button.variants'
import { useActionButton } from './useActionButton'

type ActionLinkButtonProps = {
	to: string
	label: string
	icon: IconName
	variant?: ButtonVariants['variant']
	color?: ButtonVariants['color']
	size?: ButtonVariants['size']
	className?: string
	'data-testid'?: string
	/**
	 * Required permission to access this action.
	 * If provided, the button will be disabled if user lacks this permission.
	 */
	permission?: Permission
	/**
	 * Whether to hide the button entirely when user lacks permission (default: false)
	 * If false, the button will be disabled but visible
	 */
	hideWhenDisabled?: boolean
}

export function ActionLinkButton({
	to,
	label,
	icon,
	variant = 'primary',
	color = 'brand',
	size = 'md',
	className,
	'data-testid': testId,
	permission,
	hideWhenDisabled = false,
}: Readonly<ActionLinkButtonProps>): JSX.Element | null {
	const { isHidden, isDisabled } = useActionButton({
		permission,
		hideWhenDisabled,
	})

	// Hide button if user lacks permission and hideWhenDisabled is true
	if (isHidden) {
		return null
	}

	const iconElement = renderIcon(icon, {
		className: cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', 'rtl:order-last'),
	})

	const labelText = <span>{label}</span>

	// Render as ActionButton when disabled for better UX and semantics
	if (isDisabled) {
		return (
			<ActionButton
				variant={variant}
				color={color}
				size={size}
				className={className}
				aria-label={label}
				disabled={true}
				icon={icon}
				data-testid={testId}
			>
				{label}
			</ActionButton>
		)
	}

	const buttonClasses = cn(buttonVariants({ variant, color, size }), className)

	// Render as link when enabled
	return (
		<ActionLink
			to={to}
			className={buttonClasses}
			aria-label={label}
			data-testid={testId}
		>
			{iconElement}
			{labelText}
		</ActionLink>
	)
}
