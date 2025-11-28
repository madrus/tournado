import type { JSX, SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type ExpandMoreIconProps = {
	className?: string
	size?: number
	weight?: IconWeight
	'aria-label'?: string
} & SVGProps<SVGSVGElement>

// Chevron down (expand_more) icon
export function ExpandMoreIcon({
	className = '',
	size = 24,
	weight = 400,
	'aria-label': ariaLabel = 'Expand more',
	...rest
}: Readonly<ExpandMoreIconProps>): JSX.Element {
	// Material Symbols expand_more path
	const path = 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z'

	// Convert weight to stroke-width (optional, for consistency)
	const strokeWidth =
		weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined
	const { style, ...restProps } = rest
	const combinedStyle = strokeWidth !== undefined ? { ...style, strokeWidth } : style

	return (
		<svg
			{...restProps}
			width={size}
			height={size}
			viewBox='0 0 24 24'
			className={`inline-block fill-current ${className}`}
			role='img'
			aria-label={ariaLabel}
			style={combinedStyle}
		>
			<path d={path} />
		</svg>
	)
}
