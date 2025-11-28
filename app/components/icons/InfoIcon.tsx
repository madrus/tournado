import type { JSX, SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type InfoIconProps = {
	className?: string
	size?: number
	weight?: IconWeight
	'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function InfoIcon({
	className = '',
	size = 24,
	weight = 400,
	'aria-label': ariaLabel = 'Info',
	...rest
}: Readonly<InfoIconProps>): JSX.Element {
	// Authentic path from Google Material Symbols SVG file
	const path =
		'M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z'

	// Convert weight to stroke-width
	const strokeWidth =
		weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined
	const { style, ...restProps } = rest
	const combinedStyle = strokeWidth !== undefined ? { ...style, strokeWidth } : style

	return (
		<svg
			{...restProps}
			width={size}
			height={size}
			viewBox='0 -960 960 960'
			className={`inline-block fill-current ${className}`}
			role='img'
			aria-label={ariaLabel}
			style={combinedStyle}
		>
			<path d={path} />
		</svg>
	)
}
