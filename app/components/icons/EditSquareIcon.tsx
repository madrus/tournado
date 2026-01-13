import type { JSX, SVGProps } from 'react'
import type { IconWeight } from '~/lib/lib.types'

type EditSquareIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const EditSquareIcon = ({
  className = '',
  size = 24,
  weight: _weight = 400,
  'aria-label': ariaLabel = 'Edit',
  ...rest
}: Readonly<EditSquareIconProps>): JSX.Element => {
  const path =
    'M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z'

  return (
    <svg
      {...rest}
      className={`inline-block fill-current ${className}`}
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      fill='currentColor'
      role='img'
      aria-label={ariaLabel}
    >
      <path d={path} />
    </svg>
  )
}
