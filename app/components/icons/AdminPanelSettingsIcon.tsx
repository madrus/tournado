import type { JSX, SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type AdminPanelSettingsIconProps = {
	className?: string
	size?: number
	weight?: IconWeight
	'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function AdminPanelSettingsIcon({
	className = '',
	size = 24,
	weight = 400,
	'aria-label': ariaLabel = 'Admin panel settings',
	...rest
}: Readonly<AdminPanelSettingsIconProps>): JSX.Element {
	// Authentic path from downloaded Google Material Symbols SVG file
	const path =
		'M687.26-273.33q25.58 0 43.5-18.5 17.91-18.5 17.91-44.09 0-25.59-17.91-43.5-17.92-17.91-43.5-17.91-25.59 0-44.09 17.91-18.5 17.91-18.5 43.5t18.5 44.09q18.5 18.5 44.09 18.5ZM686.33-150q32.67 0 59.34-14.17 26.66-14.16 44.66-39.5-24.66-13.66-50.3-20.66-25.65-7-53.34-7-27.69 0-53.69 7-26 7-50 20.66 18 25.34 44.33 39.5 26.34 14.17 59 14.17ZM480-80q-138.33-33-229.17-157.5Q160-362 160-520v-240.67l320-120 320 120V-505q-15.67-7.33-33-13.17-17.33-5.83-33.67-8.16V-714L480-808l-253.33 94v194q0 66.33 20.5 124.67Q267.67-337 300.5-290.5t74.17 79.83q41.33 33.34 83 50.67 7.66 18.67 21.66 38.33 14 19.67 27 32.67-6.33 3.33-13.16 5.17Q486.33-82 480-80Zm208.33 0q-79.33 0-135.5-56.5-56.16-56.5-56.16-134.83 0-79.96 56.16-136.31Q608.99-464 688.67-464q79 0 135.5 56.36 56.5 56.35 56.5 136.31 0 78.33-56.5 134.83Q767.67-80 688.33-80ZM480-484Z'

	// Convert weight to stroke-width
	const strokeWidth = weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined
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
