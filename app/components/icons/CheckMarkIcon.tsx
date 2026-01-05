import type { HTMLAttributes, JSX, SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

type CheckMarkIconProps = {
	backgroundClassName?: string
	backgroundProps?: HTMLAttributes<HTMLSpanElement> & {
		'data-testid'?: string
	}
	className?: string
	size?: number
	weight?: IconWeight
	'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function CheckMarkIcon({
	backgroundClassName,
	backgroundProps,
	className,
	size = 24,
	weight = 400,
	'aria-label': ariaLabel = 'Check mark',
	...rest
}: Readonly<CheckMarkIconProps>): JSX.Element {
	const strokeWidth = weight === 600 ? 2.5 : weight === 500 ? 2 : 2
	const { style, ...restProps } = rest
	const combinedStyle = { ...style, strokeWidth }

	const icon = (
		<svg
			{...restProps}
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			className={cn('inline-block', className)}
			role='img'
			aria-label={ariaLabel}
			style={combinedStyle}
		>
			<path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
		</svg>
	)

	if (!backgroundClassName) {
		return icon
	}

	const { className: backgroundPropsClassName, ...backgroundRest } =
		backgroundProps || {}

	return (
		<span
			{...backgroundRest}
			className={cn(
				'inline-flex items-center justify-center',
				backgroundClassName,
				backgroundPropsClassName,
			)}
		>
			{icon}
		</span>
	)
}
