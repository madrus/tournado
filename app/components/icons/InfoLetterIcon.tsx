import type { JSX, SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type InfoLetterIconProps = {
	className?: string
	size?: number
	weight?: IconWeight
	'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function InfoLetterIcon({
	className = '',
	size = 24,
	weight = 400,
	'aria-label': ariaLabel = 'Info',
	...rest
}: Readonly<InfoLetterIconProps>): JSX.Element {
	// Google Material Symbols info path (filled icon with outline style)
	const path =
		'M434-281.33h92v-232h-92v232ZM480.25-555.33q18.75 0 31.92-13.42 13.16-13.41 13.16-32.17 0-18.75-13.41-31.92Q498.5-646 479.75-646t-31.92 13.41q-13.16 13.42-13.16 32.17 0 18.75 13.41 31.92 13.42 13.17 32.17 13.17Zm-.58 475.33q-78.84 0-148.21-29.92-69.38-29.93-120.96-81.51-51.58-51.58-81.54-120.92Q99-381.68 99-460.33q0-79.34 29.96-148.51 29.96-69.18 81.54-120.65 51.58-51.48 120.96-81.49Q401.83-841 480.67-841q79.33 0 148.51 30.01 69.18 30.02 120.65 81.49 51.48 51.47 81.49 120.65 30.01 69.17 30.01 148.51 0 78.65-30.01 148.02-30.01 69.38-81.49 120.96-51.47 51.58-120.65 81.54-69.18 29.96-148.51 29.96Zm.33-92q130.67 0 221.67-91t91-221.67q0-130.66-91-221.66t-221.67-91q-130.67 0-221.67 91T167-460.67q0 130.67 91 221.67t221.67 91ZM480-480Z'

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
