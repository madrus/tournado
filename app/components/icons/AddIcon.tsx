import type { JSX, SVGProps } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type AddIconProps = {
	className?: string
	size?: number
	variant?: IconVariant
	weight?: IconWeight
	'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const AddIcon = ({
	className = '',
	size = 24,
	variant: _variant = 'outlined',
	weight = 400,
	'aria-label': ariaLabel = 'Add',
	...rest
}: Readonly<AddIconProps>): JSX.Element => {
	// Authentic path from downloaded Google Material Symbols SVG file
	const path = 'M12 6v6m0 0v6m0-6h6m-6 0H6'

	return (
		<svg
			{...rest}
			className={`inline-block fill-current ${className}`}
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth={weight / 200}
			strokeLinecap='round'
			strokeLinejoin='round'
			role='img'
			aria-label={ariaLabel}
		>
			<path d={path} />
		</svg>
	)
}
