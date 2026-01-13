import type { JSX } from 'react'

type AccentColor = 'slate' | 'fuchsia' | 'blue' | 'green' | 'red'
type CheckboxProps = {
  id?: string
  name: string
  value?: string
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  accentColor?: AccentColor
  className?: string
}

const colorClasses: Record<AccentColor, string> = {
  slate: 'text-disabled-400',
  fuchsia: 'text-accent-fuchsia-500',
  blue: 'text-info-500',
  green: 'text-success-500',
  red: 'text-error-500',
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
  const colorClass = colorClasses[accentColor] || colorClasses.slate
  const checkboxId = id || `${name}-${value || 'checkbox'}`

  return (
    <div className={`relative inline-flex size-4 ${colorClass} ${className}`}>
      <input
        type='checkbox'
        id={checkboxId}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange}
        className='peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0'
      />
      <div className='pointer-events-none size-4 rounded-[3px] border border-current bg-transparent transition-all duration-150 ease-in-out peer-focus-visible:ring-2 peer-focus-visible:ring-current peer-focus-visible:ring-offset-2 ring-offset-background' />
      <svg
        className='pointer-events-none absolute top-1/2 left-1/2 size-[10px] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150 ease-in-out peer-checked:opacity-100'
        viewBox='0 0 12 10'
        fill='none'
        aria-hidden='true'
      >
        <path
          d='M1 5l3 3 7-7'
          className='stroke-current stroke-2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  )
}
