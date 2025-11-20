import { Text } from '@radix-ui/themes'
import type { JSX, MouseEvent, ReactNode } from 'react'

type IconLabelButtonProps = {
	icon: ReactNode
	label: string
	onClick: (event: MouseEvent<HTMLButtonElement>) => void
	className?: string
	'aria-label'?: string
}

export function IconLabelButton(props: Readonly<IconLabelButtonProps>): JSX.Element {
	const { icon, label, onClick, className, 'aria-label': ariaLabel } = props
	return (
		<button type='button' className={className} onClick={onClick} aria-label={ariaLabel}>
			<div className='flex flex-col items-center justify-center gap-1'>
				{icon}
				<Text size='2' weight='bold' className='text-white'>
					{label}
				</Text>
			</div>
		</button>
	)
}
