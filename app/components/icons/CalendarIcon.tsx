import type { JSX, SVGProps } from 'react'
import type { IconVariant, IconWeight } from '~/lib/lib.types'

type CalendarIconProps = {
	className?: string
	size?: number
	variant?: IconVariant
	weight?: IconWeight
	'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const CalendarIcon = ({
	className = '',
	size = 24,
	variant: _variant = 'outlined',
	weight = 400,
	'aria-label': ariaLabel = 'Calendar',
	...rest
}: Readonly<CalendarIconProps>): JSX.Element => (
	<svg
		{...rest}
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		className={`inline-block ${className}`}
		stroke='currentColor'
		strokeWidth={weight / 200}
		strokeLinecap='round'
		strokeLinejoin='round'
		role='img'
		aria-label={ariaLabel}
	>
		<rect width='18' height='18' x='3' y='4' rx='2' ry='2' />
		<line x1='16' x2='16' y1='2' y2='6' />
		<line x1='8' x2='8' y1='2' y2='6' />
		<line x1='3' x2='21' y1='10' y2='10' />
	</svg>
)
