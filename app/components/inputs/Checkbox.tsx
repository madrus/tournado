import type { JSX } from 'react'

type CheckboxProps = {
	id?: string
	name: string
	value?: string
	defaultChecked?: boolean
	checked?: boolean
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
	accentColor?: string
	className?: string
}

const colorMap: Record<string, string> = {
	slate: 'rgb(148, 163, 184)',
	fuchsia: 'rgb(217, 70, 239)',
	blue: 'rgb(59, 130, 246)',
	green: 'rgb(34, 197, 94)',
	red: 'rgb(239, 68, 68)',
}

export function Checkbox({
	id,
	name,
	value,
	defaultChecked,
	checked,
	onChange,
	accentColor = 'slate',
	className = '',
}: CheckboxProps): JSX.Element {
	const color = colorMap[accentColor] || colorMap.slate
	const checkboxId = id || `${name}-${value || 'checkbox'}`

	return (
		<div
			className={`relative inline-flex ${className}`}
			style={{ width: '16px', height: '16px' }}
		>
			<input
				type='checkbox'
				id={checkboxId}
				name={name}
				value={value}
				defaultChecked={defaultChecked}
				checked={checked}
				onChange={onChange}
				className='peer'
				style={{
					position: 'absolute',
					width: '16px',
					height: '16px',
					margin: 0,
					opacity: 0,
					cursor: 'pointer',
					zIndex: 1,
				}}
			/>
			<div
				className='pointer-events-none'
				style={{
					width: '16px',
					height: '16px',
					border: `1px solid ${color}`,
					borderRadius: '3px',
					backgroundColor: 'transparent',
					transition: 'all 0.15s ease-in-out',
				}}
			/>
			<svg
				className='pointer-events-none peer-checked:opacity-100'
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: '10px',
					height: '10px',
					opacity: 0,
					transition: 'opacity 0.15s ease-in-out',
				}}
				viewBox='0 0 12 10'
				fill='none'
				aria-hidden='true'
			>
				<path
					d='M1 5l3 3 7-7'
					stroke={color}
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		</div>
	)
}
