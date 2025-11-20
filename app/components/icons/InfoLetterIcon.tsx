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
	// Lucide circle-info paths (circular version)
	const paths = ['M12 16v-4', 'M12 8h.01']

	// Convert weight to stroke-width for Lucide style
	const strokeWidth = weight === 600 ? 2.5 : weight === 500 ? 2.25 : 2

	return (
		<svg
			{...rest}
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			strokeWidth={strokeWidth}
			strokeLinecap='round'
			strokeLinejoin='round'
			className={`inline-block ${className}`}
			role='img'
			aria-label={ariaLabel}
		>
			{paths.map((path, index) => (
				<path key={index} d={path} stroke='currentColor' />
			))}
		</svg>
	)
}
