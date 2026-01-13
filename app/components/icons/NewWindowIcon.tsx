import type { JSX, SVGProps } from 'react'
import type { IconVariant, IconWeight } from '~/lib/lib.types'

type NewWindowIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const NewWindowIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 400,
  'aria-label': ariaLabel = 'Open in new window',
  ...rest
}: Readonly<NewWindowIconProps>): JSX.Element => {
  const path =
    'M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240v80H200v560h560v-240h80v240q0 33-23.5 56.5T760-120H200Zm440-400v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z'

  // Convert weight to stroke-width for outlined variants
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined
  const { style, ...restProps } = rest
  const combinedStyle = strokeWidth !== undefined ? { ...style, strokeWidth } : style

  return (
    <svg
      {...restProps}
      className={`inline-block fill-current ${className}`}
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      fill='currentColor'
      role='img'
      aria-label={ariaLabel}
      style={combinedStyle}
    >
      <path d={path} />
    </svg>
  )
}
