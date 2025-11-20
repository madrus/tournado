import type { JSX, SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

type ExclamationMarkIconProps = {
	className?: string
	size?: number
	weight?: IconWeight
	'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function ExclamationMarkIcon({
	className = '',
	size = 24,
	weight = 400,
	'aria-label': ariaLabel = 'Exclamation',
	...rest
}: Readonly<ExclamationMarkIconProps>): JSX.Element {
	const paths = ['M12 8v4', 'M12 16h.01']
	const strokeWidth = weight === 600 ? 2.5 : weight === 500 ? 2.25 : 2

	return (
		<svg
			{...rest} /* spread first so explicit props below can override rest props */
			className={cn('inline-block', className)}
			width={size}
			height={size}
			viewBox='0 0 24 24'
			fill='none'
			strokeWidth={strokeWidth}
			strokeLinecap='round'
			strokeLinejoin='round'
			role='img'
			aria-label={ariaLabel}
		>
			{paths.map((d, idx) => (
				<path key={idx} d={d} stroke='currentColor' />
			))}
		</svg>
	)
}
